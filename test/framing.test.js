import assert from 'node:assert/strict';
import { test } from 'node:test';

import framing from '../src/checks/framing.js';
import { runCheck } from './helpers.js';

test('frame-ancestors or X-Frame-Options protect the page', () => {
  assert.deepEqual(runCheck(framing, { 'Content-Security-Policy': "frame-ancestors 'none'" }), []);
  assert.deepEqual(runCheck(framing, { 'X-Frame-Options': 'deny' }), []);
  assert.deepEqual(runCheck(framing, { 'X-Frame-Options': 'SAMEORIGIN' }), []);
});

test('unprotected page is flagged', () => {
  assert.match(runCheck(framing, {})[0].title, /clickjacking/);
});

test('weak values are flagged', () => {
  assert.match(runCheck(framing, { 'Content-Security-Policy': 'frame-ancestors *' })[0].title, /any site/);
  assert.match(runCheck(framing, { 'X-Frame-Options': 'ALLOW-FROM https://a.example' })[0].title, /ALLOW-FROM/);
  assert.match(runCheck(framing, { 'X-Frame-Options': 'yes please' })[0].title, /invalid/);
});
