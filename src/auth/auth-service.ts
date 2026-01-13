import { type JWT } from '@fastify/jwt';
import bcrypt from 'bcrypt';
import { ErrUserAlreadyExists } from '../user/errors/err-user-already-exists';
import { ErrUserNotFound } from '../user/errors/err-user-not-found';
import { type UserService } from '../user/interfaces/user-service';
import { ErrPasswordNotMatch } from './errors/err-password-not-match';
import { type AuthService } from './interfaces/auth-services';

export function createAuthService(userService: UserService): AuthService {
  const generateAccessToken = (
    user: { id: string },
    jwtService: JWT
  ): string => {
    return jwtService.sign({ userId: user.id });
  };

  return {
    async signup(signUpDto, jwtService: JWT) {
      const { existingUser, error } = await userService
        .findByUsername(signUpDto.username)
        .then((data) => ({
          existingUser: data,
          error: null,
        }))
        .catch((error) => ({ existingUser: null, error }));
      const acceptableError = error instanceof ErrUserNotFound;
      if (error && !acceptableError) {
        throw error;
      }
      if (existingUser) {
        throw ErrUserAlreadyExists.create(
          `user registeration failed. user with username: ${signUpDto.username} already exist`
        );
      }
      signUpDto.password = await bcrypt.hash(signUpDto.password, 12);
      const newUser = await userService.create(signUpDto);
      const accessToken = generateAccessToken(newUser, jwtService);
      return {
        user: newUser,
        accessToken,
      };
    },

    async signin(signInDto, jwtService: JWT) {
      const user = await userService.findByUsername(signInDto.username);
      if (!user) {
        throw ErrUserNotFound.create(
          `signin failed. user with username: ${signInDto.username} does not exist`
        );
      }
      const passwordNotmatch = !bcrypt.compareSync(
        signInDto.password,
        user.password
      );
      if (passwordNotmatch) {
        throw ErrPasswordNotMatch.create(
          'sign in failed. password do not match'
        );
      }
      const accessToken = generateAccessToken(user, jwtService);
      return {
        user,
        accessToken,
      };
    },
  };
}
