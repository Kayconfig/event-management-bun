import { type User } from '../../database/drizzle/schema';

export class UserDto {
  constructor(public readonly id: string, public readonly username: string) {}

  static create(user: User): UserDto {
    return new UserDto(user.id, user.username);
  }
}
