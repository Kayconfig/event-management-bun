import type { FastifyInstance } from 'fastify';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { createReservationRepository } from './reservation-repository';
import { createReservationService } from './reservation-service';

export function initializeReservationsModule(app: FastifyInstance) {
  const repo = createReservationRepository(app);
  const service = createReservationService(repo);
  dependencyUtils.setReservationService(app, service);
}
