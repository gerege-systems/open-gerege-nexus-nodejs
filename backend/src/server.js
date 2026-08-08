const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');
const { pool } = require('./db/index');
const { runMigrations } = require('./db/migrate');
const { syncCatalogToDatabase } = require('./platform/appcatalog');
const { errorMiddleware } = require('./middleware/error.middleware');
const { logger } = require('./utils/logger');

// Import business modules
const authRouter = require('./modules/auth/auth.router');
const appstoreRouter = require('./modules/appstore/appstore.router');
const contactsRouter = require('./modules/contacts/contacts.router');
const productsRouter = require('./modules/products/products.router');
const inventoryRouter = require('./modules/inventory/inventory.router');
const billingRouter = require('./modules/billing/billing.router');
const documentsRouter = require('./modules/documents/documents.router');
const esignRouter = require('./modules/esign/esign.router');
const govRouter = require('./modules/gov_services/gov_services.router');
const aiRouter = require('./modules/ai/ai.router');
const adminRouter = require('./modules/admin/admin.router');
const integrationsRouter = require('./modules/integrations/integrations.router');

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
    logger.info('Starting Node.js Express CJS backend...');

    // 1. Run database migrations
    await runMigrations();

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

if (require.main === module) {
  startServer();
}

module.exports = app;
