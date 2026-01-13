import { type FastifyInstance } from 'fastify';
import { dbUtils } from '../database/utils';
import { type ReservationRepository } from './interfaces/reservation-repository';
import { createReservationDrizzleRepository } from './reservation-drizzle-repository';

export function createReservationRepository(
  app: FastifyInstance
): ReservationRepository {
  const db = dbUtils.getDrizzleDb(app);
  return createReservationDrizzleRepository(db);
}
