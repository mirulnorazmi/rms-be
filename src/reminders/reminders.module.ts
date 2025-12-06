import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RentReminderController } from './rent-reminder.controller';
import { LindyCallbackController } from './lindy-callback.controller';
import { RentReminderService } from './rent-reminder.service';
import { Payments } from '../payments/models/payments.model';
import { Contracts } from '../contracts/models/contracts.model';
import { LindyModule } from '../common/lindy/lindy.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Payments, Contracts]),
    LindyModule,
    UsersModule,
  ],
  controllers: [RentReminderController, LindyCallbackController],
  providers: [RentReminderService],
  exports: [RentReminderService],
})
export class RemindersModule {}

