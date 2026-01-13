import { type FastifyInstance } from 'fastify';
import { type DrizzleDbType } from './drizzle';
import { ErrDrizzleDbNotConnectedToApp } from './errors/err-drizzle-not-connected-to-app';

const drizzleDbKey = 'drizzleDb';

function getDrizzleDb(
  app: FastifyInstance & { [drizzleDbKey]?: DrizzleDbType }
): DrizzleDbType {
  const db = app.drizzleDb;
  if (!db) {
    throw ErrDrizzleDbNotConnectedToApp.create();
  }
  return db;
}

export function setDrizzleDbOnApp(app: FastifyInstance, db: DrizzleDbType) {
  app.decorate(drizzleDbKey, db);
}

export const dbUtils = { getDrizzleDb };
