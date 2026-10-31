import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/deprecated.js';
import { runCheck, severities } from './helpers.js';

test('X-XSS-Protection: 0 is fine, 1 is flagged', () => {
  assert.deepEqual(runCheck(check, { 'X-XSS-Protection': '0' }), []);
  assert.equal(runCheck(check, { 'X-XSS-Protection': '1; mode=block' }).length, 1);
});

test('HPKP and Expect-CT', () => {
  assert.deepEqual(severities(runCheck(check, { 'Public-Key-Pins': 'pin-sha256="x"', 'Expect-CT': 'max-age=0' })), ['medium', 'info']);
});
