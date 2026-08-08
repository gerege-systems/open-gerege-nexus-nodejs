const pg = require('pg');
const { env } = require('../config/env');

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 25,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}

async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows.length > 0 ? rows[0] : null;
}

async function withTransaction(callback) {
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

module.exports = {
  pool,
  query,
  queryOne,
  withTransaction,
};
