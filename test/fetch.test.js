import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { auditUrl } from '../src/audit.js';
import { fetchHeaders } from '../src/fetch.js';
import { startServer } from './server.js';

let server;
before(async () => {
  server = await startServer();
});
after(() => server.close());

test('fetches headers and keeps cookies separate', async () => {
  const res = await fetchHeaders(`${server.base}/`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.getAll('set-cookie').length, 2);
});

test('records the redirect chain', async () => {
  const res = await fetchHeaders(`${server.base}/redirect`);
  assert.equal(res.finalUrl, `${server.base}/final`);
  assert.deepEqual(res.redirects, [{ from: `${server.base}/redirect`, to: `${server.base}/final`, status: 301 }]);
});

test('stops redirect loops', async () => {
  await assert.rejects(fetchHeaders(`${server.base}/loop`, { maxRedirects: 3 }), /too many redirects/);
});

test('times out slow servers', async () => {
  await assert.rejects(fetchHeaders(`${server.base}/slow`, { timeout: 50 }), /timed out/);
});

test('rejects non-http URLs', async () => {
  await assert.rejects(fetchHeaders('ftp://example.com'), TypeError);
});

test('auditUrl audits the final response', async () => {
  const result = await auditUrl(`${server.base}/redirect`);
  assert.equal(result.status, 200);
  assert.equal(result.redirects.length, 1);
  assert.ok(result.passed.includes('framing'));
  assert.ok(result.findings.some((f) => f.title.includes('plain HTTP')));
});
