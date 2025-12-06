import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './models/roles.model';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { provideRolesRepository } from './repositories/roles.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  controllers: [RolesController],
  providers: [RolesService, ...provideRolesRepository()],
  exports: [RolesService],
})
export class RolesModule {}

