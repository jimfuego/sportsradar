/**
 * @file product-service.ts
 *
 * Utility class used for processing responses from services.
 *
 * Intended to be used in ./src/routes directory.
 */
import { NextFunction, Response } from 'express';
import {
  DEFAULT_STATUS,
  RESPONSE_CODES,
  responseMessages,
} from './response-codes';

export default class ResponseFactory {
  /**
   * Determines whether the response code is considered "successful" (i.e. int the 200s)
   * @param status the not-so-final status code
   * @returns true if successful
   */
  static successfulRequest(status: number): boolean {
    return new Set([
      RESPONSE_CODES.ACCEPTED,
      RESPONSE_CODES.OK,
      RESPONSE_CODES.CREATED,
      RESPONSE_CODES.NO_CONTENT,
    ]).has(status)
      ? true
      : false;
  }

  /**
   * Wrapper callback for sending messages
   * back with Express router.
   * @param res
   * @param status
   * @param data
   */
  static processResponse(
    res: Response,
    status: number = DEFAULT_STATUS,
    data?: unknown | null
  ) {
    if (ResponseFactory.successfulRequest(status) && data) {
      res
        .status(status)
        .send(ResponseFactory.createServerResponse(status, data));
    } else if (status === RESPONSE_CODES.UNAUTHORIZED) {
      res.status(status).send(ResponseFactory.createServerResponse(status));
    } else {
      res
        .status(DEFAULT_STATUS)
        .send(ResponseFactory.createServerResponse(DEFAULT_STATUS));
    }
  }

  /**
   * Wrapper callback for sending error messages back with Express router
   * @param res Response object
   * @param err error message
   * @param status response status
   */
  static processErrorResponse(
    res: Response,
    err: any,
    status: number = RESPONSE_CODES.NOT_ACCEPTABLE,
    next?: NextFunction
  ) {
    res.status(status).send(ResponseFactory.createServerResponse(status));
  }

  /**
   * Creates end-user response object;
   * defaults to '406 Not Acceptable'
   * @param status response code
   * @param data end-user response data
   * @returns {JSON} {message:string, status:number, data?:JSON}
   */
  static createServerResponse(status: number, data?: unknown | null) {
    status = status in responseMessages ? status : DEFAULT_STATUS;
    const txtResponse = { message: responseMessages[status] };
    return data || txtResponse;
  }
}
