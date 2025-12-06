export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role_id?: number;
}
