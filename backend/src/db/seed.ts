import bcrypt from 'bcryptjs';
import { pool } from './index.js';
import { env } from '../config/env.js';

async function seedDemoData() {
  if (!env.SEED_DEMO_DATA) return;

  const passwordHash = await bcrypt.hash('Password123!', 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tenant = await client.query(
      `INSERT INTO tenants (slug, name) VALUES ('demo', 'Demo Corporation')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const user = await client.query(
      `INSERT INTO users (email, password_hash, name, is_admin)
       VALUES ('admin@example.com', $1, 'System Administrator', TRUE)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, is_admin = TRUE
       RETURNING id`,
      [passwordHash]
    );
    await client.query(
      `INSERT INTO memberships (tenant_id, user_id) VALUES ($1, $2)
       ON CONFLICT (tenant_id, user_id) DO NOTHING`,
      [tenant.rows[0].id, user.rows[0].id]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { seedDemoData };
