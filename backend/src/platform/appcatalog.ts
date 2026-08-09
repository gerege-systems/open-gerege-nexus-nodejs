import fs from 'node:fs';
import { env } from '../config/env.js';
import { pool } from '../db/index.js';
import { logger } from '../utils/logger.js';

async function syncCatalogToDatabase() {
  if (!fs.existsSync(env.CATALOG_PATH)) {
    logger.warn(`Catalog file not found at ${env.CATALOG_PATH}`);
    return;
  }

  try {
    const rawData = fs.readFileSync(env.CATALOG_PATH, 'utf8');
    const apps = JSON.parse(rawData);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const app of apps) {
        await client.query(
          `INSERT INTO apps (id, slug, name, description, icon_url, category, visibility, version, translations)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             slug = EXCLUDED.slug,
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             icon_url = EXCLUDED.icon_url,
             category = EXCLUDED.category,
             visibility = EXCLUDED.visibility,
             version = EXCLUDED.version,
             translations = EXCLUDED.translations;`,
          [
            app.id,
            app.slug,
            app.name,
            app.description,
            app.icon_url || '',
            app.category || 'General',
            app.visibility || 'public',
            app.version || '1.0.0',
            JSON.stringify(app.translations || {}),
          ]
        );
      }
      await client.query('COMMIT');
      logger.info(`Synced ${apps.length} catalog apps to database.`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('Failed to sync catalog apps to database', { error: err.message });
  }
}

export { syncCatalogToDatabase };
