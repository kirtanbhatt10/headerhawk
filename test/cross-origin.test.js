import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/cross-origin.js';
import { runCheck, severities } from './helpers.js';

test('COOP and CORP set passes', () => {
  assert.deepEqual(runCheck(check, { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-site' }), []);
});

test('missing headers are low and info', () => {
  assert.deepEqual(severities(runCheck(check, {})), ['low', 'info']);
});

test('unsafe-none COOP is flagged', () => {
  const findings = runCheck(check, { 'Cross-Origin-Opener-Policy': 'unsafe-none', 'Cross-Origin-Resource-Policy': 'same-origin' });
  assert.match(findings[0].title, /unsafe-none/);
});
