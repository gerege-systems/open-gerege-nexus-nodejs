# Module Authoring Guide

<p>
  <img src="assets/icons/flag-en.png" width="18" height="18" alt=""> <b>English</b>
</p>

[Back to the documentation hub](README.md)

Welcome to the **open-gerege-nexus** Module Authoring Guide! This guide explains how to write and register custom business application modules for the Node.js Express platform.

---

## Module architecture overview

In `open-gerege-nexus`, business modules are written as CommonJS Express Routers under `backend/src/modules/`.

Each module consists of:
1. Manifest JSON definition in `catalog/manifests/<app_slug>.json`
2. Express Router handling endpoints in `backend/src/modules/<app_slug>/<app_slug>.router.js`

---

## Step by step: creating a new module

### Step 1: Create Express Router (`backend/src/modules/invoices/invoices.router.js`)

```javascript
const { Router } = require('express');
const { query, queryOne } = require('../../db/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { appGateMiddleware } = require('../../middleware/rbac.middleware');

const router = Router();

// Protect all module endpoints with auth and app-gate middleware
router.use(authMiddleware);
router.use(appGateMiddleware('io.example.invoices'));

// GET /api/v1/invoices
router.get('/invoices', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const invoices = await query('SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: invoices });
}));

// POST /api/v1/invoices
router.post('/invoices', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { customer_name, amount } = req.body;

  const invoice = await queryOne(
    `INSERT INTO invoices (tenant_id, customer_name, amount, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [tenantId, customer_name, amount]
  );

  res.status(201).json({ status: 'success', data: invoice });
}));

module.exports = router;
```

### Step 2: Register Router in `backend/src/server.js`

```javascript
const invoicesRouter = require('./modules/invoices/invoices.router');

// Mount on apiV1
apiV1.use(invoicesRouter);
```

### Step 3: Add Catalog Manifest (`catalog/manifests/invoices.json`)

Add the app metadata to `catalog/apps.json` and create `catalog/manifests/invoices.json` declaring title, permissions, dependencies, and menus.
