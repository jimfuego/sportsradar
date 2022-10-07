/**
 * @file bronze.ts
 *
 * Contains routes that interact with the bronze table.
 */
import express, { Request, Response } from 'express';
import db from '../utils/sqlite';
import { createBronzeTable, getBronzeTable, seedBronzeTable } from '../services/sql-service';
import { Responses } from '../utils';
import { RESPONSE_CODES } from '../utils';

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
    const body = { label: req.body as string };
    const createBronze = createBronzeTable();
    processResponse(res, RESPONSE_CODES.OK, { data: createBronze });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST)
  }
});

/**
 * POST: Seeds The bronze table with test data
 * /api/v1/app/bronze/seed
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const body = { label: req.body as string };
    const createBronze = createBronzeTable();
    const bronzeSeed = seedBronzeTable()
    processResponse(res, RESPONSE_CODES.OK, { data: bronzeSeed });
  } catch (err) {
    processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST)
  }
});

/**
 * GET
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
    processErrorResponse(res, err, RESPONSE_CODES.BAD_REQUEST)
  }
});

export default router;

