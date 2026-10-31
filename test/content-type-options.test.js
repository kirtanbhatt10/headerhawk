import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/content-type-options.js';
import { runCheck } from './helpers.js';

test('nosniff passes (case-insensitive)', () => {
  assert.deepEqual(runCheck(check, { 'X-Content-Type-Options': 'NoSniff' }), []);
});

test('missing and invalid values are flagged', () => {
  assert.match(runCheck(check, {})[0].title, /missing/);
  assert.match(runCheck(check, { 'X-Content-Type-Options': 'sniff' })[0].title, /invalid/);
});
