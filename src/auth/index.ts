import cookie from '@fastify/cookie';
import fjwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { ErrServiceNotFound } from '../common/utils/errors/err-service-not-found';
import { getSecretOrThrow } from '../config/get-secret';
import { authRoute } from './auth-controller';
import { createAuthService } from './auth-service';

export function initializeAuthModule(app: FastifyInstance) {
  app.register(fjwt, {
    secret: getSecretOrThrow('JWT_SECRET'),
    sign: {
      expiresIn: getSecretOrThrow('ACCESS_TOKEN_EXPIRES'),
    },
  });

  app.register(cookie);

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const userService = dependencyUtils.getUserServiceOrThrow(app);
        await userService.findById(request.user.userId);
      } catch (err) {
        if (err instanceof ErrServiceNotFound) {
          throw err;
        }
        reply.code(401).send({ error: 'Unauthorized' });
      }
    }
  );

  const userService = dependencyUtils.getUserServiceOrThrow(app);
  const authService = createAuthService(userService);
  dependencyUtils.setAuthService(app, authService);
  app.register(authRoute);
}
