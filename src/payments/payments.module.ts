import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payments } from './models/payments.model';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { providePaymentsRepository } from './repositories/payments.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Payments])],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...providePaymentsRepository()],
  exports: [PaymentsService],
})
export class PaymentsModule {}

