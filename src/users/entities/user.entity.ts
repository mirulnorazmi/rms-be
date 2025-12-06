export class User {
  constructor(
    public user_id: number,
    public role_id: number,
    public email: string,
    public first_name: string,
    public last_name: string,
    public phone_number: string,
    public password_hash: string,
    public password_clear: string,
  ) {}
}
