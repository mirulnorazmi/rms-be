import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LindyService } from './lindy.service';

@Module({
  imports: [HttpModule],
  providers: [LindyService],
  exports: [LindyService],
})
export class LindyModule {}

