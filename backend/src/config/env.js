const dotenv = require('dotenv');
const path = require('node:path');

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@localhost:5432/platform_db?sslmode=disable',
  JWT_SECRET: process.env.JWT_SECRET || 'gerege-nexus-ultra-secure-secret-key-2026',
  SESSION_TTL_HOURS: process.env.SESSION_TTL_HOURS ? parseInt(process.env.SESSION_TTL_HOURS, 10) : 24,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  CATALOG_PATH: process.env.CATALOG_PATH || path.resolve(process.cwd(), '../catalog/apps.json'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};

module.exports = { env };
