import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contracts } from './models/contracts.model';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { provideContractsRepository } from './repositories/contracts.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Contracts])],
  controllers: [ContractsController],
  providers: [ContractsService, ...provideContractsRepository()],
  exports: [ContractsService],
})
export class ContractsModule {}

