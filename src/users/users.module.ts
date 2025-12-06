import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './models/users.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { provideUsersRepository } from './repositories/users.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService, ...provideUsersRepository()],
  exports: [UsersService],
})
export class UsersModule {}
