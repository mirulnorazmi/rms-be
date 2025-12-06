import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Properties } from './models/properties.model';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { providePropertiesRepository } from './repositories/properties.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Properties])],
  controllers: [PropertiesController],
  providers: [PropertiesService, ...providePropertiesRepository()],
  exports: [PropertiesService],
})
export class PropertiesModule {}

