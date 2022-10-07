/**
 * @file sqlite.ts
 *
 * This field initializes a sqlite database in memory for our pseudo-persistent
 * pipeline.
 */
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(':memory:');

export default db;
