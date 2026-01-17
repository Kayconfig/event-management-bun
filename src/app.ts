import fastify from 'fastify';

import { initializeAuthModule } from './auth/index.ts';
import { type DrizzleDbType } from './database/drizzle/index.ts';
import { setDrizzleDbOnApp } from './database/utils.ts';
import { initializeEventsModule } from './events/index.ts';
import { initializeRedisModule } from './redis/index.ts';
import { initializeReservationsModule } from './reservations/index.ts';
import { initializeUserModule } from './user/index.ts';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role?: string };
    user: { userId: string; role?: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    // Add your decorator name + exact type here
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export async function createApp(db: DrizzleDbType) {
  const app = fastify({ logger: true });
  setDrizzleDbOnApp(app, db);

  app.setErrorHandler(function (error, request, reply) {
    // Log the error for internal debugging
    app.log.error(error);

    // Send a generic 500 Internal Server Error response to the client
    reply.status(500).send({
      statusCode: 500,
      message: 'internal server error',
    });
  });

  initializeUserModule(app);
  initializeReservationsModule(app);
  await initializeRedisModule(app);
  initializeEventsModule(app);
  initializeAuthModule(app);

  return app;
}
