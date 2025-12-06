import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UnitDetailsService } from './unit-details.service';
import { UnitDetails } from './models/unit-details.model';
import { UnitDetailsDto } from './dto/unit-details.dto';
import { UnitDetailsUpdateDto } from './dto/unit-details-update.dto';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { UpdateResult, DeleteResult } from 'typeorm';

@ApiTags('unit-details')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('unit-details')
export class UnitDetailsController {
  constructor(private readonly unitDetailsService: UnitDetailsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all unit details' })
  @ApiResponse({
    status: 200,
    description: 'Returns all unit details',
  })
  async findAll(): Promise<UnitDetails[]> {
    return await this.unitDetailsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit detail by ID' })
  @ApiParam({ name: 'id', description: 'Unit detail ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the unit detail',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit detail not found',
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UnitDetails> {
    return await this.unitDetailsService.findById(id);
  }

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get unit details by unit ID' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all unit details for the specified unit',
  })
  async findByUnitId(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<UnitDetails[]> {
    return await this.unitDetailsService.findByUnitId(unitId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new unit detail' })
  @ApiResponse({
    status: 201,
    description: 'Unit detail created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async create(@Body() unitDetailsDto: UnitDetailsDto): Promise<UnitDetails> {
    return await this.unitDetailsService.create(unitDetailsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a unit detail' })
  @ApiParam({ name: 'id', description: 'Unit detail ID' })
  @ApiResponse({
    status: 200,
    description: 'Unit detail updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit detail not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() unitDetailsUpdateDto: UnitDetailsUpdateDto,
  ): Promise<UpdateResult> {
    return await this.unitDetailsService.update(id, unitDetailsUpdateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unit detail' })
  @ApiParam({ name: 'id', description: 'Unit detail ID' })
  @ApiResponse({
    status: 204,
    description: 'Unit detail deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit detail not found',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.unitDetailsService.delete(id);
  }
}

