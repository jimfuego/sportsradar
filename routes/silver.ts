/**
 * @file silver.ts
 *
 * Contains routes that interact with the silver table.
 */
import express, { Request, Response } from 'express';
import { Responses } from '../utils';
import { RESPONSE_CODES } from '../utils';

const router = express.Router();
const processErrorResponse = Responses.processErrorResponse;
const processResponse = Responses.processResponse;

/**
 * POST: Creates The bronze table
 *
 * /api/v1/app/silver
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    processResponse(res, RESPONSE_CODES.CREATED, {
      data: 'There is no silver table',
    });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST);
  }
});
