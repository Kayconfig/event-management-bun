import { type ApiResponseJson } from './types/api-json-body';

function createOkResponse<Data>(
  data: Data,
  message = 'successful'
): ApiResponseJson<Data> {
  return {
    statusCode: 200,
    message,
    data,
  };
}

function createCreatedResponse<Data>(
  data: Data,
  message: string
): ApiResponseJson<Data> {
  return {
    statusCode: 201,
    message,
    data,
  };
}

function createBadRequestResponse(errors: string[]): ApiResponseJson {
  return {
    statusCode: 400,
    message: 'bad request',
    errors,
  };
}
function createNotFoundResponse(errors: string[]): ApiResponseJson {
  return {
    statusCode: 404,
    message: 'not found',
    errors,
  };
}

function createInternalServerErrorResponse() {
  return {
    statusCode: 500,
    message: 'unable to process request, please try again',
  };
}
function sendUnauthorizedResponse(errors?: string[]) {
  return {
    statusCode: 401,
    message: 'unauthorized',
    errors,
  };
}
function createConflictResponse(errors: string[]) {
  return {
    statusCode: 409,
    message: 'conflict',
    errors,
  };
}

export const apiResponse = {
  createCreatedResponse,
  createOkResponse,
  createBadRequestResponse,
  createInternalServerErrorResponse,
  createNotFoundResponse,
  sendUnauthorizedResponse,
  createConflictResponse,
};
