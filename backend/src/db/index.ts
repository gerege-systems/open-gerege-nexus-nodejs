import pg from 'pg';
import { env } from '../config/env.js';

// Native PostgreSQL connection pool
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 25,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

// Generic Query helper returning typed rows array
export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

// Single row query helper
export async function queryOne<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// Transaction helper
export async function withTransaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
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
