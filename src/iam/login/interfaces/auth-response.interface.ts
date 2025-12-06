export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
  };
  redirect_url: string;
}
