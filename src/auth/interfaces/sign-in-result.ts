import { type User } from '../../database/drizzle/schema';

export interface SignInResult {
  user: User;
  accessToken: string;
}
