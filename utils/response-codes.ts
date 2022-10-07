/**
 * @file response-codes.ts
 *
 * Utility class predefines server responses.
 *
 * Intended to be used by ./src/utilities/responses.ts
 */
const DEFAULT_STATUS = 406;

enum RESPONSE_CODES {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ACCEPTABLE = 406,
  INTERNAL_SERVER_ERROR = 500,
}

const responseMessages: { [key: number]: string } = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  406: 'Not Acceptable',
  500: 'Internal Server Error',
};

export { DEFAULT_STATUS, RESPONSE_CODES, responseMessages };
