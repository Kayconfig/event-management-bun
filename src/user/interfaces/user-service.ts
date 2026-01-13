import type { NewUser, User } from '../../database/drizzle/schema';

export interface UserService {
  /**
   * finds a user by id
   * @param userId user id
   *@returns user
   * @throws ErrUserNotFound when user is not found
   */
  findById(userId: string): Promise<User>;

  /**
   * finds a user by username
   * @param username user name
   *@returns user
   * @throws ErrUserNotFound when user is not found
   */
  findByUsername(username: string): Promise<User>;

  /**
   *
   * @param newUser new user data
   * @returns User
   *
   * @throws ErrUserAlreadyExists
   */
  create(newUser: NewUser): Promise<User>;
}
