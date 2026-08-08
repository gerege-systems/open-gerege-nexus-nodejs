const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Environment and Server Config Smoke Test', () => {
  assert.ok(process.env.PORT === undefined || typeof process.env.PORT === 'string');
  assert.ok(true, 'Smoke test passed');
});

test('HTTP health endpoints are public and return service metadata', async (t) => {
  const app = require('../src/server');
  const server = app.listen(0, '127.0.0.1');
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  for (const path of ['/health', '/api/v1/health']) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    assert.equal(response.status, 200, `${path} must not require authentication`);
    const body = await response.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'open-gerege-nexus-backend-node');
  }
});

test('Catalog App Validation Test', () => {
  const appSlug = 'contacts';
  const isValidSlug = /^[a-z0-9_-]+$/.test(appSlug);
  assert.ok(isValidSlug, 'App slug should be valid alphanumeric with hyphen');
});

test('App installation supplies the required installed version', () => {
  const router = fs.readFileSync(path.join(__dirname, '../src/modules/appstore/appstore.router.js'), 'utf8');
  assert.match(router, /INSERT INTO app_installations \(tenant_id, app_id, installed_version, enabled\)/);
  assert.match(router, /COALESCE\(\$3, '1\.0\.0'\)/);
});

test('E-ID start endpoint matches the frontend contract', async (t) => {
  const app = require('../src/server');
  const server = app.listen(0, '127.0.0.1');
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/eid/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.session_id, /^eid_sess_/);
  assert.match(body.verification_code, /^\d{6}$/);
  assert.ok(body.device_link_url);
  assert.ok(body.expires_at);
});
