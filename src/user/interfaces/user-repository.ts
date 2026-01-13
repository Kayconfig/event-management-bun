import type { NewUser, User } from '../../database/drizzle/schema';

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(newUser: NewUser): Promise<User>;
}
