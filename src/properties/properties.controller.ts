import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertyDto } from './dto/property.dto';
import { PropertyUpdateDto } from './dto/property-update.dto';
import { IProperty } from './interfaces/property.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

@ApiTags('properties')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Find all properties' })
  @ApiResponse({ status: 200, description: 'Get all properties' })
  public async findAll(): Promise<IProperty[]> {
    return this.propertiesService.findAll();
  }

  @Get('/:propertyId')
  @ApiOperation({ summary: 'Find a property by id' })
  @ApiResponse({ status: 200, description: 'Get a property by id' })
  @ApiNotFoundResponse({ description: 'Property not found' })
  public async findOne(
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ): Promise<IProperty> {
    return this.propertiesService.findById(propertyId);
  }

  @Get('/landlord/:landlordId')
  @ApiOperation({ summary: 'Find all properties by landlord id' })
  @ApiResponse({ status: 200, description: 'Get all properties by landlord id' })
  public async findByLandlordId(
    @Param('landlordId', ParseIntPipe) landlordId: number,
  ): Promise<IProperty[]> {
    return this.propertiesService.findByLandlordId(landlordId);
  }

  @Get('/search/city')
  @ApiOperation({ summary: 'Find all properties by city' })
  @ApiResponse({ status: 200, description: 'Get all properties by city' })
  @ApiQuery({ name: 'city', required: true, type: String })
  public async findByCity(@Query('city') city: string): Promise<IProperty[]> {
    return this.propertiesService.findByCity(city);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiCreatedResponse({ description: 'Property created successfully' })
  @ApiBadRequestResponse({ description: 'Property not created' })
  public async create(@Body() propertyDto: PropertyDto): Promise<IProperty> {
    return this.propertiesService.create(propertyDto);
  }

  @Put('/:propertyId')
  @ApiOperation({ summary: 'Update a property by id' })
  @ApiResponse({ status: 200, description: 'Update a property by id' })
  @ApiBadRequestResponse({ description: 'Property not updated' })
  public async update(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() propertyUpdateDto: PropertyUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.propertiesService.update(propertyId, propertyUpdateDto);

      return {
        message: 'Property updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Property not updated!');
    }
  }

  @Delete('/:propertyId')
  @ApiOperation({ summary: 'Delete a property by id' })
  @ApiResponse({ status: 200, description: 'Delete a property by id' })
  @ApiNotFoundResponse({ description: 'Property not found' })
  public async delete(
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ): Promise<ApiResponseMessage> {
    await this.propertiesService.delete(propertyId);

    return {
      message: 'Property deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

