import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

export interface MaintenanceAnalysisResult {
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  suggestedCategory?: string;
}

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async analyzeMaintenanceIssue(
    imagePath: string,
    title: string,
    category?: string,
  ): Promise<MaintenanceAnalysisResult> {
    try {
      // Read image file and convert to base64
      let base64Image: string;
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

      if (imagePath.startsWith('http')) {
        // If image path is a URL (R2/S3), fetch it first
        const response = await fetch(imagePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString('base64');
        mediaType = this.getMediaType(imagePath);
      } else {
        // Local file system
        const imageBuffer = fs.readFileSync(imagePath);
        base64Image = imageBuffer.toString('base64');
        mediaType = this.getMediaType(imagePath);
      }
      
      const prompt = this.buildPrompt(title, category);

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      // Parse Claude's response
      const response = message.content[0];
      if (response.type === 'text') {
        return this.parseClaudeResponse(response.text);
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      this.logger.error('Error analyzing maintenance issue with Claude:', error);
      throw error;
    }
  }

  private buildPrompt(title: string, category?: string): string {
    return `You are a maintenance issue analyzer for a property management system. 

Issue Title: ${title}
${category ? `Category: ${category}` : ''}

Please analyze the uploaded image and provide:
1. A detailed description of the maintenance issue visible in the image
2. Priority level (Low, Medium, or High) based on:
   - Safety concerns (immediate safety issues = High)
   - Potential for property damage (water leaks, electrical = High/Medium)
   - Impact on tenant comfort and usability (Medium/Low)
   - Urgency of repair needed

${!category ? '3. Suggest an appropriate category (e.g., Plumbing, Electrical, HVAC, Structural, Appliance, General Maintenance)' : ''}

Please respond in the following JSON format only, with no additional text:
{
  "description": "detailed description of the issue",
  "priority": "Low|Medium|High",
  ${!category ? '"suggestedCategory": "category name"' : ''}
}`;
  }

  private parseClaudeResponse(responseText: string): MaintenanceAnalysisResult {
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      // Validate priority value
      if (!['Low', 'Medium', 'High'].includes(parsed.priority)) {
        throw new Error('Invalid priority value');
      }

      return {
        description: parsed.description,
        priority: parsed.priority as 'Low' | 'Medium' | 'High',
        suggestedCategory: parsed.suggestedCategory,
      };
    } catch (error) {
      this.logger.error('Error parsing Claude response:', error);
      this.logger.debug('Raw response:', responseText);
      
      // Fallback response
      return {
        description: responseText,
        priority: 'Medium',
      };
    }
  }

  private getMediaType(imagePath: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    const extension = imagePath.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // default fallback
    }
  }
}