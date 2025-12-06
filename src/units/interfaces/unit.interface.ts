export interface IUnit {
  readonly unit_id: number;
  readonly property_id: number;
  readonly unit_number: string;
  readonly monthly_rent: number;
  readonly status: string;
  readonly main_image_path?: string;
}

