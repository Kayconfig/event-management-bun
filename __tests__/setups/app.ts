import { fastify, type FastifyInstance } from 'fastify';
import type { DrizzleDbType } from '../../src/database/drizzle';
import { setDrizzleDbOnApp } from '../../src/database/utils';

type ModuleCallback = (app: FastifyInstance) => void | Promise<void>;

export async function createTestApp(
  db: DrizzleDbType,
  moduleCallbacks: ModuleCallback[]
) {
  const app = fastify({ logger: true });
  setDrizzleDbOnApp(app, db);

  app.setErrorHandler(function (error, request, reply) {
    // Log the error for internal debugging
    // app.log.error(error);
    console.error(error);

    // Send a generic 500 Internal Server Error response to the client
    reply.status(500).send({
      statusCode: 500,
      message: 'internal server error',
    });
  });

  for (const registerModule of moduleCallbacks) {
    await registerModule(app);
  }

  return app;
}
