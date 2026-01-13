import { eq } from 'drizzle-orm';
import { type DrizzleDbType } from '../database/drizzle';
import { users } from '../database/drizzle/schema';
import { type UserRepository } from './interfaces/user-repository';

export function createUserDrizzleRepository(db: DrizzleDbType): UserRepository {
  return {
    async create(newUser) {
      const [user] = await db.insert(users).values(newUser).returning();
      if (!user) {
        throw new Error('userRepository.create failed. user should be created');
      }
      return user;
    },

    async findById(userId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      return user ?? null;
    },

    async findByUsername(username) {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      return user ?? null;
    },
  };
}
