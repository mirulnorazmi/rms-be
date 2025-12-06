export interface IProperty {
  readonly property_id: number;
  readonly landlord_id: number;
  readonly address: string;
  readonly city: string;
  readonly zip_code: string;
  readonly main_image_path?: string;
}

