import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { treeifyError } from 'zod';
import { fastifyResponse } from '../common/api/response/fastify-response';
import { offSetPaginationSchemaDto } from '../common/dtos/offset-pagination.dto';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { createEventSchema } from './dtos/create-event-dto';
import { ErrEventNotFound } from './errors/err-event-not-found';

export function eventRoute(app: FastifyInstance) {
  const eventService = dependencyUtils.getEventServiceOrThrow(app);

  const findById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const eventId = (request.params as { eventId?: string }).eventId;
      if (!eventId) {
        return fastifyResponse.sendBadRequestResponse(reply, [
          'eventId must be passed',
        ]);
      }

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

  const bookEvent = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const eventId = (request.params as { eventId?: string }).eventId;
      if (!eventId) {
        return fastifyResponse.sendBadRequestResponse(reply, [
          'eventId must be passed',
        ]);
      }
      const { userId } = request.body as { userId: string };
      if (!userId) {
        return fastifyResponse.sendBadRequestResponse(reply, [
          'userId must be provided in request body',
        ]);
      }
    } catch (error) {
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
    bookEvent
  );
}
