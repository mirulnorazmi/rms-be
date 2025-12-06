import { ApiProperty } from '@nestjs/swagger';

export class UnitDetailInfoDto {
  @ApiProperty()
  unit_detail_id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  size: string;

  @ApiProperty()
  monthly_rent: string;

  @ApiProperty()
  deposit: string;

  @ApiProperty()
  facilities: string;
}

export class UnitInfoDto {
  @ApiProperty()
  unit_id: number;

  @ApiProperty()
  unit_number: string;

  @ApiProperty()
  monthly_rent: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  main_image_path: string;

  @ApiProperty({ type: [UnitDetailInfoDto] })
  details: UnitDetailInfoDto[];
}

export class PropertyInfoDto {
  @ApiProperty()
  property_id: number;

  @ApiProperty()
  property_name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  zip_code: string;

  @ApiProperty()
  main_image_path: string;
}

export class LandlordInfoDto {
  @ApiProperty()
  landlord_id: number;

  @ApiProperty()
  landlord_name: string;

  @ApiProperty()
  landlord_email: string;

  @ApiProperty()
  landlord_phone_number: string;
}

export class RentalPeriodDto {
  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  renewal_due_by: Date;
}

export class TenantPropertyDetailsDto {
  @ApiProperty({ type: PropertyInfoDto })
  property: PropertyInfoDto;

  @ApiProperty({ type: UnitInfoDto })
  unit: UnitInfoDto;

  @ApiProperty({ type: LandlordInfoDto })
  landlord: LandlordInfoDto;

  @ApiProperty({ type: RentalPeriodDto })
  rental_period: RentalPeriodDto;
}

