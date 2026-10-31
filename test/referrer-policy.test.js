import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/referrer-policy.js';
import { runCheck } from './helpers.js';

test('safe policies pass', () => {
  for (const value of ['no-referrer', 'strict-origin-when-cross-origin', 'same-origin']) {
    assert.deepEqual(runCheck(check, { 'Referrer-Policy': value }), []);
  }
});

test('leaky policies are medium', () => {
  assert.equal(runCheck(check, { 'Referrer-Policy': 'unsafe-url' })[0].severity, 'medium');
});

test('the last valid value wins', () => {
  assert.deepEqual(runCheck(check, { 'Referrer-Policy': 'unsafe-url, bogus, no-referrer' }), []);
  assert.equal(runCheck(check, { 'Referrer-Policy': 'no-referrer, unsafe-url' })[0].severity, 'medium');
});

test('missing or garbage values are low', () => {
  assert.equal(runCheck(check, {})[0].severity, 'low');
  assert.match(runCheck(check, { 'Referrer-Policy': 'whatever' })[0].title, /no valid value/);
});
