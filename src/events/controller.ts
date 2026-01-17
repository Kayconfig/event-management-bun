import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { treeifyError } from 'zod';
import { fastifyResponse } from '../common/api/response/fastify-response';
import { offSetPaginationSchemaDto } from '../common/dtos/offset-pagination.dto';
import { ErrInternal } from '../common/errors/err-internal.error';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { validateUUID } from '../common/validation/validate-uuid';
import { createEventSchema } from './dtos/create-event-dto';
import { ErrEventFullyBooked } from './errors/err-event-fully-booked';
import { ErrEventNotFound } from './errors/err-event-not-found';
import { ErrHighDemandOnEvents } from './errors/err-high-demand-on-event';

export function eventRoute(app: FastifyInstance) {
  const eventService = dependencyUtils.getEventServiceOrThrow(app);

  const findById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const eventIdParseResult = await validateUUID(
        (request.params as { eventId?: string }).eventId
      );
      if (eventIdParseResult.error) {
        return fastifyResponse.sendBadRequestResponse(
          reply,
          treeifyError(eventIdParseResult.error).errors
        );
      }
      const eventId = eventIdParseResult.data;

      const event = await eventService.findById(eventId);

      return fastifyResponse.sendOkResponse(reply, { event }, 'successful');
    } catch (error) {
      if (error instanceof ErrEventNotFound) {
        return fastifyResponse.sendNotFoundResponse(reply, ['event not found']);
      }
      app.log.error(error);
      return fastifyResponse.sendInternalErrorResponse(reply);
    }
  };

  const reserveSeat = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const eventIdParseResult = await validateUUID(
        (request.params as { eventId?: string }).eventId
      );
      if (eventIdParseResult.error) {
        return fastifyResponse.sendBadRequestResponse(
          reply,
          treeifyError(eventIdParseResult.error).errors
        );
      }
      const eventId = eventIdParseResult.data;

      const { userId } = request.user;
      if (!userId) {
        throw ErrInternal.create(
          'reserveSeat failed, userId must be available to reserveSeat'
        );
      }
      const reservation = await eventService.reserveSeat(eventId, userId);
      return fastifyResponse.sendCreatedResponse(
        reply,
        { reservation },
        'successful'
      );
    } catch (error) {
      if (error instanceof ErrEventFullyBooked) {
        return fastifyResponse.sendForbiddenResponse(reply, [
          'event fully booked',
        ]);
      }

      if (error instanceof ErrEventNotFound) {
        return fastifyResponse.sendNotFoundResponse(reply, ['event not found']);
      }

      if (error instanceof ErrHighDemandOnEvents) {
        return fastifyResponse.sendTooManyRequestResponse(reply, [
          'high demand for this event. Please retry shortly.',
        ]);
      }
      app.log.error(error);
      throw error;
    }
  };

  const createEvent = async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = await createEventSchema.safeParseAsync(request.body);
    if (parseResult.error) {
      return fastifyResponse.sendBadRequestResponse(
        reply,
        treeifyError(parseResult.error).errors
      );
    }
    const authUser = request.user;
    const event = await eventService.createEvent(
      parseResult.data,
      authUser.userId
    );
    return fastifyResponse.sendCreatedResponse(
      reply,
      { event },
      'event created successfully'
    );
  };

  const findByUserId = async (request: FastifyRequest, reply: FastifyReply) => {
    const paginationParseResult =
      await offSetPaginationSchemaDto.safeParseAsync(request.query);
    if (paginationParseResult.error) {
      return fastifyResponse.sendBadRequestResponse(
        reply,
        treeifyError(paginationParseResult.error).errors
      );
    }
    const authUser = request.user;
    const events = await eventService.findByUserId(
      authUser.userId,
      paginationParseResult.data
    );
    return fastifyResponse.sendOkResponse(reply, { events }, 'successful');
  };

  const findReservationsByUserId = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const paginationParseResult =
      await offSetPaginationSchemaDto.safeParseAsync(request.query);
    if (paginationParseResult.error) {
      return fastifyResponse.sendBadRequestResponse(
        reply,
        treeifyError(paginationParseResult.error).errors
      );
    }
    const authUser = request.user;
    const reservations = await eventService.findReservationsByUserId(
      authUser.userId,
      paginationParseResult.data
    );
    return fastifyResponse.sendOkResponse(
      reply,
      { reservations },
      'successful'
    );
  };

  app.post(
    '/events',
    {
      onRequest: [app.authenticate],
    },
    createEvent
  );

  app.get(
    '/events/:eventId',
    {
      onRequest: [app.authenticate],
    },
    findById
  );

  app.get(
    '/events',
    {
      onRequest: [app.authenticate],
    },
    findByUserId
  );

  app.post(
    '/events/:eventId/reservations',
    {
      onRequest: [app.authenticate],
    },
    reserveSeat
  );

  app.get(
    '/events/:eventId/reservations',
    {
      onRequest: [app.authenticate],
    },
    findReservationsByUserId
  );
}
