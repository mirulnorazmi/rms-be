import { User } from './user.entity';

describe('User class', () => {
  it('should make a user with no fields', () => {
    const user = new User(0, 0, '', '', '', '', '', '');
    expect(user).toBeTruthy();
    expect(user.user_id).toBe(0);
    expect(user.role_id).toBe(0);
    expect(user.email).toBe('');
    expect(user.first_name).toBe('');
    expect(user.last_name).toBe('');
    expect(user.phone_number).toBe('');
    expect(user.password_hash).toBe('');
    expect(user.password_clear).toBe('');
  });

  it('should make a user with fields', () => {
    const user = new User(
      1,
      1,
      'test@example.com',
      'John',
      'Doe',
      '1234567890',
      'hashed_password_123',
      'cleartext_password',
    );
    expect(user).toBeTruthy();
    expect(user.user_id).toBe(1);
    expect(user.role_id).toBe(1);
    expect(user.email).toBe('test@example.com');
    expect(user.first_name).toBe('John');
    expect(user.last_name).toBe('Doe');
    expect(user.phone_number).toBe('1234567890');
    expect(user.password_hash).toBe('hashed_password_123');
    expect(user.password_clear).toBe('cleartext_password');
  });
});
