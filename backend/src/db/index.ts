/**
 * Gerege Nexus Backend — PostgreSQL Pool & Native Query Abstraction
 * High Performance, Low Footprint, Zero ORM Overhead
 */

import pg, { type PoolClient } from 'pg';
import { env } from '../config/env.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 30,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});

/**
 * Execute query and return rows array
 */
async function query(text: string, params?: unknown[]): Promise<any[]> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`[Slow Query] (${duration}ms): ${text}`);
  }
  return res.rows;
}

/**
 * Execute query and return single row or null
 */
async function queryOne(text: string, params?: unknown[]): Promise<any | null> {
  const rows = await query(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute query and return row count affected
 */
async function execute(text: string, params?: unknown[]): Promise<number | null> {
  const res = await pool.query(text, params);
  return res.rowCount;
}

/**
 * Execute callback within an isolated SQL transaction
 */
async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export {
  pool,
  query,
  queryOne,
  execute,
  withTransaction,
};
