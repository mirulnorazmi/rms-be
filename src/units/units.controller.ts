import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitDto } from './dto/unit.dto';
import { UnitUpdateDto } from './dto/unit-update.dto';
import { IUnit } from './interfaces/unit.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

@ApiTags('units')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Find all units' })
  @ApiResponse({ status: 200, description: 'Get all units' })
  public async findAll(): Promise<IUnit[]> {
    return this.unitsService.findAll();
  }

  @Get('/:unitId')
  @ApiOperation({ summary: 'Find a unit by id' })
  @ApiResponse({ status: 200, description: 'Get a unit by id' })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  public async findOne(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<IUnit> {
    return this.unitsService.findById(unitId);
  }

  @Get('/property/:propertyId')
  @ApiOperation({ summary: 'Find all units by property id' })
  @ApiResponse({ status: 200, description: 'Get all units by property id' })
  public async findByPropertyId(
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ): Promise<IUnit[]> {
    return this.unitsService.findByPropertyId(propertyId);
  }

  @Get('/search/status')
  @ApiOperation({ summary: 'Find all units by status' })
  @ApiResponse({ status: 200, description: 'Get all units by status' })
  @ApiQuery({ name: 'status', required: true, type: String })
  public async findByStatus(@Query('status') status: string): Promise<IUnit[]> {
    return this.unitsService.findByStatus(status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiCreatedResponse({ description: 'Unit created successfully' })
  @ApiBadRequestResponse({ description: 'Unit not created' })
  public async create(@Body() unitDto: UnitDto): Promise<IUnit> {
    return this.unitsService.create(unitDto);
  }

  @Put('/:unitId')
  @ApiOperation({ summary: 'Update a unit by id' })
  @ApiResponse({ status: 200, description: 'Update a unit by id' })
  @ApiBadRequestResponse({ description: 'Unit not updated' })
  public async update(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() unitUpdateDto: UnitUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.unitsService.update(unitId, unitUpdateDto);

      return {
        message: 'Unit updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Unit not updated!');
    }
  }

  @Delete('/:unitId')
  @ApiOperation({ summary: 'Delete a unit by id' })
  @ApiResponse({ status: 200, description: 'Delete a unit by id' })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  public async delete(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<ApiResponseMessage> {
    await this.unitsService.delete(unitId);

    return {
      message: 'Unit deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

