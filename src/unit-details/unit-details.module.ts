import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitDetailsController } from './unit-details.controller';
import { UnitDetailsService } from './unit-details.service';
import { UnitDetails } from './models/unit-details.model';
import { unitDetailsRepositoryProvider } from './repositories/unit-details.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([UnitDetails])],
  controllers: [UnitDetailsController],
  providers: [UnitDetailsService, unitDetailsRepositoryProvider],
  exports: [UnitDetailsService],
})
export class UnitDetailsModule {}

