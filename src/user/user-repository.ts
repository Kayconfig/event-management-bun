import { type FastifyInstance } from 'fastify';
import { dbUtils } from '../database/utils';
import { createUserDrizzleRepository } from './user-drizzle-repository';

export function createUserRepository(app: FastifyInstance) {
  const db = dbUtils.getDrizzleDb(app);
  return createUserDrizzleRepository(db);
}
