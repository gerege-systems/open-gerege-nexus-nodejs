import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pathToFileURL } from 'node:url';
import { env } from './config/env.js';
import { pool } from './db/index.js';
import { runMigrations } from './db/migrate.js';
import { seedDemoData } from './db/seed.js';
import { syncCatalogToDatabase } from './platform/appcatalog.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';

// Import business modules
import authRouter from './modules/auth/auth.router.js';
import appstoreRouter from './modules/appstore/appstore.router.js';
import contactsRouter from './modules/contacts/contacts.router.js';
import productsRouter from './modules/products/products.router.js';
import inventoryRouter from './modules/inventory/inventory.router.js';
import billingRouter from './modules/billing/billing.router.js';
import documentsRouter from './modules/documents/documents.router.js';
import esignRouter from './modules/esign/esign.router.js';
import govRouter from './modules/gov_services/gov_services.router.js';
import aiRouter from './modules/ai/ai.router.js';
import adminRouter from './modules/admin/admin.router.js';
import integrationsRouter from './modules/integrations/integrations.router.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// Health Checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'open-gerege-nexus-backend-node', version: '1.0.0' });
});

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unreachable', details: err.message });
  }
});

// API Routes (v1)
const apiV1 = express.Router();

apiV1.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'open-gerege-nexus-backend-node', version: '1.0.0' });
});

apiV1.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unreachable', details: err.message });
  }
});

apiV1.use(authRouter);
apiV1.use(appstoreRouter);
apiV1.use(contactsRouter);
apiV1.use(productsRouter);
apiV1.use(inventoryRouter);
apiV1.use(billingRouter);
apiV1.use(documentsRouter);
apiV1.use(esignRouter);
apiV1.use(govRouter);
apiV1.use(aiRouter);
apiV1.use(adminRouter);
apiV1.use(integrationsRouter);

app.use('/api/v1', apiV1);

// Error Handling
app.use(errorMiddleware);

// Server Startup
async function startServer() {
  try {
    logger.info('Starting Node.js Express TypeScript backend...');

    // 1. Run database migrations
    await runMigrations();

    // Demo credentials are opt-in, including in production.
    await seedDemoData();

    // 2. Sync Catalog
    await syncCatalogToDatabase();

    // 3. Start HTTP Listener
    app.listen(env.PORT, () => {
      logger.info(`Gerege Nexus Node.js Express server running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error('Fatal startup error', { error: err.stack });
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

export default app;
