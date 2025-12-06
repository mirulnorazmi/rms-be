export interface IUnitDetailInfo {
  unit_detail_id: number;
  type: string;
  size: string;
  monthly_rent: string;
  deposit: string;
  facilities: string;
}

export interface IUnitInfo {
  unit_id: number;
  unit_number: string;
  monthly_rent: number;
  status: string;
  main_image_path: string;
  details: IUnitDetailInfo[];
}

export interface IPropertyInfo {
  property_id: number;
  property_name: string;
  address: string;
  city: string;
  zip_code: string;
  main_image_path: string;
}

export interface ILandlordInfo {
  landlord_id: number;
  landlord_name: string;
  landlord_email: string;
  landlord_phone_number: string;
}

export interface IRentalPeriod {
  start_date: Date;
  end_date: Date;
  renewal_due_by: Date;
}

export interface ITenantPropertyDetails {
  property: IPropertyInfo;
  unit: IUnitInfo;
  landlord: ILandlordInfo;
  rental_period: IRentalPeriod;
}

