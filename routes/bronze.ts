/**
 * @file bronze.ts
 *
 * Contains routes that interact with the bronze table.
 */
import express, { Request, Response, NextFunction } from 'express';
import db from '../utils/sqlite';
import { createBronzeTable, seedBronzeTable } from '../services/sql-service';
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
    seedBronzeTable();
    processResponse(res, RESPONSE_CODES.CREATED, { data: 'Success' });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
  }
});

/**
 * POST: Adds game data to the bronze table by its corresponding gameId.
 *
 * @body string[] of gameIds
 * /api/v1/app/bronze/add
 */
router.post('/add', async (req: Request, res: Response) => {
  const body: [any] = req.body.gameIds;
  ScheduleService.getGamesById(body)
    .then((dbResult) => {
      processResponse(res, RESPONSE_CODES.CREATED, dbResult);
    })
    .catch((err) =>
      processErrorResponse(res, err, RESPONSE_CODES.NOT_ACCEPTABLE)
    );
});

/**
 * GET: Retrieves all bronze_table entries.
 * /api/v1/app/bronze
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const sql = 'SELECT * FROM bronze_table';
    db.all(sql, (err, rows) => {
      if (err) processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST);
      processResponse(res, RESPONSE_CODES.OK, { data: rows });
    });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
  }
});

/**
 * GET: Retrieves all bronze_table entries of a corresponding gameId.
 * /api/v1/app/bronze/:gameId
 */
router.get(
  '/game/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!parseInt(id, 10)) {
      return next();
    }
    try {
      const sql = `SELECT * FROM bronze_table where game_id = ${id}`;
      db.all(sql, (err, rows) => {
        if (err) processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST);
        processResponse(res, RESPONSE_CODES.OK, { data: rows });
      });
    } catch (err) {
      processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
  }
);

/**
 * GET: Retrieves all bronze_table entries of a corresponding playerId
 * /api/v1/app/bronze/:gameId
 */
router.get('/player/:id', (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!parseInt(id, 10)) {
    return next();
  }
  try {
    const sql = `SELECT * FROM bronze_table where player_id = ${id}`;
    db.all(sql, (err, rows) => {
      if (err) {
        res.send(err);
        processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST);
      }
      return processResponse(res, RESPONSE_CODES.OK, { data: rows });
    });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
