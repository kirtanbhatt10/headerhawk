import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/disclosure.js';
import { runCheck } from './helpers.js';

test('versioned Server header is flagged, bare one is not', () => {
  assert.equal(runCheck(check, { Server: 'Apache/2.4.41 (Ubuntu)' }).length, 1);
  assert.deepEqual(runCheck(check, { Server: 'nginx' }), []);
});

test('stack-revealing headers are each reported', () => {
  const findings = runCheck(check, { 'X-Powered-By': 'Express', 'X-AspNet-Version': '4.0.30319' });
  assert.equal(findings.length, 2);
});
