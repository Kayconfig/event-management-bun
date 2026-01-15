import { type FastifyInstance } from 'fastify';
import { type AuthService } from '../../auth/interfaces/auth-services';
import { type EventsService } from '../../events/interfaces/event-service';
import type { DistributedService } from '../../redis/interfaces/distributed-service';
import { type ReservationService } from '../../reservations/interfaces/reservation-service';
import { type UserService } from '../../user/interfaces/user-service';
import { ErrServiceNotFound } from './errors/err-service-not-found';

const eventServiceKey = 'eventService';
function setEventService(app: FastifyInstance, eventService: EventsService) {
  app.decorate(eventServiceKey, eventService);
}

function getEventServiceOrThrow(
  app: FastifyInstance & { [eventServiceKey]?: EventsService }
): EventsService {
  const service = app[eventServiceKey];
  if (!service) {
    throw ErrServiceNotFound.create('eventService not attached to app');
  }
  return service;
}

const reservationServiceKey = 'reservationService';
function setReservationService(
  app: FastifyInstance,
  service: ReservationService
) {
  app.decorate(reservationServiceKey, service);
}

function getReservationServiceOrThrow(
  app: FastifyInstance & { [reservationServiceKey]?: ReservationService }
) {
  const service = app[reservationServiceKey];
  if (!service) {
    throw ErrServiceNotFound.create('reservationService not attached to app');
  }
  return service;
}

const userServiceKey = 'userService';
function setUserService(app: FastifyInstance, service: UserService) {
  app.decorate(userServiceKey, service);
}
/**
 *
 * @param app
 * @returns userService instance
 *
 * @throws ErrServiceNotFound
 */
function getUserServiceOrThrow(
  app: FastifyInstance & { [userServiceKey]?: UserService }
): UserService {
  const service = app[userServiceKey];
  if (!service) {
    throw ErrServiceNotFound.create('userService not attached to app');
  }

  return service;
}

const authServiceKey = 'authService';
function setAuthService(app: FastifyInstance, service: AuthService) {
  app.decorate(authServiceKey, service);
}

function getAuthServiceOrThrow(
  app: FastifyInstance & { [authServiceKey]?: AuthService }
): AuthService {
  const service = app[authServiceKey];
  if (!service) {
    throw ErrServiceNotFound.create('authService not attached to app');
  }
  return service;
}

const distributedServiceKey = 'distributedService';
function setDistributedService(
  app: FastifyInstance,
  service: DistributedService
) {
  app.decorate(distributedServiceKey, service);
}

function getDistributedServiceOrThrow(
  app: FastifyInstance & { [distributedServiceKey]?: DistributedService }
): DistributedService {
  const service = app[distributedServiceKey];
  if (!service) {
    throw ErrServiceNotFound.create('distributedService not attached to app');
  }
  return service;
}

export const dependencyUtils = {
  setEventService,
  getEventServiceOrThrow,
  setReservationService,
  getReservationServiceOrThrow,
  setUserService,
  getUserServiceOrThrow,
  setAuthService,
  getAuthServiceOrThrow,
  setDistributedService,
  getDistributedServiceOrThrow,
};
