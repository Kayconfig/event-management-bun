import type { JWT } from '@fastify/jwt';
import type { SignInDto } from '../dtos/sign-in.dto';
import type { SignUpDto } from '../dtos/sign-up.dto';
import type { SignInResult } from './sign-in-result';
import type { SignUpResult } from './sign-up-result';

export interface AuthService {
  signin(signInDto: SignInDto, jwtService: JWT): Promise<SignInResult>;
  signup(signUpDto: SignUpDto, jwtService: JWT): Promise<SignUpResult>;
}
