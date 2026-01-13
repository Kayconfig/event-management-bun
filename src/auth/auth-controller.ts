import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { treeifyError } from 'zod';
import { fastifyResponse } from '../common/api/response/fastify-response';
import { UserDto } from '../common/dtos/user.dto';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { ErrUserAlreadyExists } from '../user/errors/err-user-already-exists';
import { ErrUserNotFound } from '../user/errors/err-user-not-found';
import { signInDtoSchema } from './dtos/sign-in.dto';
import { signUpDtoSchema } from './dtos/sign-up.dto';
import { ErrPasswordNotMatch } from './errors/err-password-not-match';

export function authRoute(app: FastifyInstance) {
  const authService = dependencyUtils.getAuthServiceOrThrow(app);

  const signup = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parseResult = await signUpDtoSchema.safeParseAsync(request.body);
      if (parseResult.error) {
        return fastifyResponse.sendBadRequestResponse(
          reply,
          treeifyError(parseResult.error).errors
        );
      }
      const { user, accessToken } = await authService.signup(
        parseResult.data,
        request.server.jwt
      );
      return fastifyResponse.sendCreatedResponse(
        reply,
        { user: UserDto.create(user), accessToken },
        'signup successful'
      );
    } catch (error) {
      if (error instanceof ErrUserAlreadyExists) {
        const errors = ['username already exists'];
        return fastifyResponse.sendConflictResponse(reply, errors);
      }
      app.log.error(error);
      throw error;
    }
  };
  const signin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parseResult = await signInDtoSchema.safeParseAsync(request.body);
      if (parseResult.error) {
        return fastifyResponse.sendBadRequestResponse(
          reply,
          parseResult.error.issues.map((issue) => issue.message)
        );
      }
      const { user, accessToken } = await authService.signin(
        parseResult.data,
        request.server.jwt
      );
      return fastifyResponse.sendCreatedResponse(
        reply,
        { user: UserDto.create(user), accessToken },
        'successful'
      );
    } catch (error) {
      if (
        error instanceof ErrUserNotFound ||
        error instanceof ErrPasswordNotMatch
      ) {
        return fastifyResponse.sendUnauthorizedResponse(reply);
      }

      throw error;
    }
  };

  app.post('/auth/signin', {}, signin);

  app.post('/auth/signup', {}, signup);
}
