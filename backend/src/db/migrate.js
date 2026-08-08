const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('./index');

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.resolve(process.cwd(), 'db/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[Migration] Directory not found: ${migrationsDir}`);
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query('SELECT version FROM schema_migrations WHERE version = $1', [file]);
      if (rows.length === 0) {
        console.log(`[Migration] Executing: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[Migration] Success: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[Migration] Error in ${file}:`, err);
          throw err;
        }
      }
    }
    console.log('[Migration] All database migrations up to date.');
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
