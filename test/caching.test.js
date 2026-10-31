import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/caching.js';
import { runCheck } from './helpers.js';

test('responses without cookies are not checked', () => {
  assert.deepEqual(runCheck(check, { 'Cache-Control': 'public, max-age=3600' }), []);
});

test('cookie responses need no-store or private', () => {
  assert.equal(runCheck(check, { 'Set-Cookie': 'a=1', 'Cache-Control': 'public, max-age=60' }).length, 1);
  assert.equal(runCheck(check, { 'Set-Cookie': 'a=1' }).length, 1);
  assert.deepEqual(runCheck(check, { 'Set-Cookie': 'a=1', 'Cache-Control': 'private, max-age=0' }), []);
  assert.deepEqual(runCheck(check, { 'Set-Cookie': 'a=1', 'Cache-Control': 'no-store' }), []);
});
