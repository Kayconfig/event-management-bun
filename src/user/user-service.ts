import { DrizzleQueryError } from 'drizzle-orm';
import { ErrUserAlreadyExists } from './errors/err-user-already-exists';
import { ErrUserNotFound } from './errors/err-user-not-found';
import { type UserRepository } from './interfaces/user-repository';
import { type UserService } from './interfaces/user-service';

export function createUserService(repo: UserRepository): UserService {
  return {
    async create(newUser) {
      try {
        const user = await repo.create(newUser);
        return user;
      } catch (error) {
        if (error instanceof DrizzleQueryError) {
          // TODO: handle duplicate error better
          throw ErrUserAlreadyExists.create(
            'user creation failed. user already exist'
          );
        }
        throw error;
      }
    },

    async findById(userId) {
      const user = await repo.findById(userId);
      if (!user) {
        throw ErrUserNotFound.create(
          `findById failed. user with userId: ${userId} not found`
        );
      }
      return user;
    },

    async findByUsername(username) {
      const user = await repo.findByUsername(username);
      if (!user) {
        throw ErrUserNotFound.create(
          `findByUsername failed. user with username: ${username} not found`
        );
      }
      return user;
    },
  };
}
