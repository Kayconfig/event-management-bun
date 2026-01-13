import { type FastifyInstance } from 'fastify';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { dbUtils } from '../database/utils';
import { eventRoute } from './controller';
import { createEventsRepository } from './repository';
import { createEventsService } from './service';

export function initializeEventsModule(app: FastifyInstance) {
  const db = dbUtils.getDrizzleDb(app);
  const repo = createEventsRepository(db);
  const reservationService = dependencyUtils.getReservationServiceOrThrow(app);
  const service = createEventsService(repo, reservationService);
  dependencyUtils.setEventService(app, service);
  app.register(eventRoute);
}
