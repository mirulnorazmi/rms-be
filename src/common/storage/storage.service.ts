import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import * as multerS3 from 'multer-s3';

@Injectable()
export class StorageService {
  private s3: S3Client;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  getMulterConfig() {
    return {
      storage: multerS3({
        s3: this.s3,
        bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req: any, file: any, cb: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `maintenance-issues/${uniqueSuffix}.${ext}`);
        },
      }),
    };
  }
}

