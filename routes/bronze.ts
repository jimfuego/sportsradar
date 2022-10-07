/**
 * @file bronze.ts
 *
 * Contains routes that interact with the bronze table.
 */
import express, { Request, Response } from 'express';
import db from '../utils/sqlite';
import { createBronzeTable, seedBronzeTable, } from '../services/sql-service';
import { Responses } from '../utils';
import { RESPONSE_CODES } from '../utils';
import ScheduleService from '../services/schedule-service';

const router = express.Router();
const processErrorResponse = Responses.processErrorResponse;
const processResponse = Responses.processResponse;

/**
 * POST: Creates The bronze table
 *
 * /api/v1/app/bronze
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const createBronze = createBronzeTable();
    processResponse(res, RESPONSE_CODES.CREATED, { data: createBronze });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST);
  }
});

/**
 * POST: Seeds The bronze table with test data
 * /api/v1/app/bronze/seed
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    createBronzeTable();
    const bronzeSeed = seedBronzeTable();
    processResponse(res, RESPONSE_CODES.CREATED, { data: bronzeSeed });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
  }
});

/**
 * POST: Adds 
 * 
 * @body string[] of gameIds
 * /api/v1/app/bronze/add
 */
router.post('/add', async (req: Request, res: Response) => {
  const body: [any] = req.body.gameIds;
  try {
    ScheduleService.getGamesById(body).then(dbResult => {
      processResponse(res, RESPONSE_CODES.OK, dbResult)
    });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
  }
});

/**
 * GET: Retrieves all bronze_table entries
 * /api/v1/app/bronze
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let sql = 'SELECT * FROM bronze_table';
    db.all(sql, (err, rows) => {
      if (err) processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST);
      processResponse(res, RESPONSE_CODES.OK, { data: rows });
    });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
