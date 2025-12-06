export class Property {
  constructor(
    public property_id: number,
    public landlord_id: number,
    public address: string,
    public city: string,
    public zip_code: string,
    public main_image_path: string,
  ) {}
}

