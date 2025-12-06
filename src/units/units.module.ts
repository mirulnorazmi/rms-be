import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Units } from './models/units.model';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { provideUnitsRepository } from './repositories/units.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Units])],
  controllers: [UnitsController],
  providers: [UnitsService, ...provideUnitsRepository()],
  exports: [UnitsService],
})
export class UnitsModule {}

