import { type FastifyReply } from 'fastify';
import { apiResponse } from './api-response';

function sendOkResponse<Data>(
  reply: FastifyReply,
  data: Data,
  message: string
) {
  reply.headers({
    'content-type': 'application/json',
  });
  return reply.status(200).send(apiResponse.createOkResponse(data, message));
}

function sendBadRequestResponse(reply: FastifyReply, errors: string[]) {
  reply.headers({
    'content-type': 'application/json',
  });
  return reply.status(400).send(apiResponse.createBadRequestResponse(errors));
}

function sendNotFoundResponse(reply: FastifyReply, errors: string[]) {
  reply.headers({
    'content-type': 'application/json',
  });
  return reply.status(404).send(apiResponse.createNotFoundResponse(errors));
}

function sendCreatedResponse<Data>(
  reply: FastifyReply,
  data: Data,
  message: string
) {
  reply.headers({
    'content-type': 'application/json',
  });
  return reply
    .status(201)
    .send(apiResponse.createCreatedResponse(data, message));
}

function sendInternalErrorResponse(reply: FastifyReply) {
  reply.headers({
    'content-type': 'application/json',
  });

  return reply
    .status(500)
    .send(apiResponse.createInternalServerErrorResponse());
}
function sendUnauthorizedResponse(reply: FastifyReply, error?: string[]) {
  reply.headers({
    'content-type': 'application/json',
  });

  return reply.status(401).send(apiResponse.sendUnauthorizedResponse(error));
}

function sendConflictResponse(reply: FastifyReply, error: string[]) {
  reply.headers({
    'content-type': 'application/json',
  });

  return reply.status(409).send(apiResponse.createConflictResponse(error));
}

function sendForbiddenResponse(reply: FastifyReply, error: string[]) {
  reply.headers({
    'content-type': 'application/json',
  });

  return reply.status(403).send(apiResponse.createForbiddenResponse(error));
}
function sendTooManyRequestResponse(reply: FastifyReply, error: string[]) {
  reply.headers({
    'content-type': 'application/json',
  });

  return reply
    .status(429)
    .send(apiResponse.createTooManyRequestResponse(error));
}

export const fastifyResponse = {
  sendOkResponse,
  sendBadRequestResponse,
  sendCreatedResponse,
  sendInternalErrorResponse,
  sendNotFoundResponse,
  sendUnauthorizedResponse,
  sendConflictResponse,
  sendForbiddenResponse,
  sendTooManyRequestResponse,
};
