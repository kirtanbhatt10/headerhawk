import assert from 'node:assert/strict';
import { test } from 'node:test';

import hsts, { parseHsts } from '../src/checks/hsts.js';
import { runCheck, titles } from './helpers.js';

const STS = 'Strict-Transport-Security';

test('strong HSTS passes', () => {
  assert.deepEqual(runCheck(hsts, { [STS]: 'max-age=63072000; includeSubDomains; preload' }), []);
});

test('missing header is high', () => {
  assert.equal(runCheck(hsts, {})[0].severity, 'high');
});

test('plain HTTP target is flagged', () => {
  assert.match(runCheck(hsts, {}, { url: 'http://example.com' })[0].title, /plain HTTP/);
});

test('max-age problems', () => {
  assert.match(runCheck(hsts, { [STS]: 'includeSubDomains' })[0].title, /missing or invalid/);
  assert.match(runCheck(hsts, { [STS]: 'max-age=0' })[0].title, /disabled/);
  assert.ok(titles(runCheck(hsts, { [STS]: 'max-age=86400; includeSubDomains' })).some((t) => /6 months/.test(t)));
});

test('subdomains and preload requirements', () => {
  assert.ok(titles(runCheck(hsts, { [STS]: 'max-age=31536000' })).some((t) => /subdomains/.test(t)));
  assert.ok(titles(runCheck(hsts, { [STS]: 'max-age=31536000; preload' })).some((t) => /preload/.test(t)));
});

test('parseHsts tolerates quotes and odd spacing', () => {
  assert.deepEqual(parseHsts(' max-age="31536000" ;IncludeSubDomains'), { maxAge: 31536000, includeSubDomains: true, preload: false });
});
