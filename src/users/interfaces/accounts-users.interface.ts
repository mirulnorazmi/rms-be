export interface AccountsUsers {
  readonly user_id: number;
  readonly role_id: number;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly phone_number?: string;
  readonly password_hash: string;
  // password_clear is NOT stored in database - only used in DTOs for input
}
