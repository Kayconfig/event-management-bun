import { type User } from '../../database/drizzle/schema';

export interface SignUpResult {
  user: User;
  accessToken: string;
}
