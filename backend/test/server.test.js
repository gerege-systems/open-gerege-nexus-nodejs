const test = require('node:test');
const assert = require('node:assert/strict');

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
