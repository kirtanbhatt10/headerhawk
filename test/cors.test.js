import assert from 'node:assert/strict';
import { test } from 'node:test';

import check from '../src/checks/cors.js';
import { runCheck } from './helpers.js';

test('no CORS headers means nothing to report', () => {
  assert.deepEqual(runCheck(check, {}), []);
});

test('wildcard with credentials is high', () => {
  assert.equal(runCheck(check, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' })[0].severity, 'high');
});

test('null origin is medium, plain wildcard is info', () => {
  assert.equal(runCheck(check, { 'Access-Control-Allow-Origin': 'null' })[0].severity, 'medium');
  assert.equal(runCheck(check, { 'Access-Control-Allow-Origin': '*' })[0].severity, 'info');
});

test('specific origin passes', () => {
  assert.deepEqual(runCheck(check, { 'Access-Control-Allow-Origin': 'https://app.example', 'Access-Control-Allow-Credentials': 'true' }), []);
});
