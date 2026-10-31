import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { HeaderSet, parseRaw } from '../src/headers.js';

test('HeaderSet is case-insensitive and keeps repeated values', () => {
  const h = new HeaderSet().add('Set-Cookie', 'a=1').add('set-cookie', 'b=2').add('X-Test', ' v ');
  assert.deepEqual(h.getAll('SET-COOKIE'), ['a=1', 'b=2']);
  assert.equal(h.get('x-test'), 'v');
  assert.equal(h.get('missing'), undefined);
  assert.ok(h.has('X-TEST'));
});

test('fromObject accepts strings and arrays', () => {
  const h = HeaderSet.fromObject({ A: 'x', 'Set-Cookie': ['c=1', 'd=2'] });
  assert.equal(h.get('a'), 'x');
  assert.equal(h.getAll('set-cookie').length, 2);
  assert.deepEqual(h.toObject(), { a: 'x', 'set-cookie': ['c=1', 'd=2'] });
});

test('fromFetch keeps Set-Cookie values separate', () => {
  const fetchHeaders = new Headers();
  fetchHeaders.append('set-cookie', 'a=1; Path=/');
  fetchHeaders.append('set-cookie', 'b=2');
  fetchHeaders.append('x-frame-options', 'DENY');
  const h = HeaderSet.fromFetch(fetchHeaders);
  assert.deepEqual(h.getAll('set-cookie'), ['a=1; Path=/', 'b=2']);
  assert.equal(h.get('x-frame-options'), 'DENY');
});

test('parseRaw uses the last response of a redirect chain', () => {
  const { status, headers } = parseRaw(readFileSync(new URL('./fixtures/weak.txt', import.meta.url), 'utf8'));
  assert.equal(status, 200);
  assert.equal(headers.get('location'), undefined);
  assert.equal(headers.get('x-powered-by'), 'PHP/7.4.3');
});

test('parseRaw handles CRLF, missing status line and folded headers', () => {
  const { status, headers } = parseRaw('Content-Security-Policy: default-src \'self\';\r\n  object-src \'none\'\r\nX-A: 1\r\n');
  assert.equal(status, null);
  assert.equal(headers.get('content-security-policy'), "default-src 'self'; object-src 'none'");
  assert.equal(headers.get('x-a'), '1');
});

test('parseRaw ignores the body after the headers', () => {
  const { headers } = parseRaw('HTTP/1.1 200 OK\nX-A: 1\n\n<html>Key: not-a-header</html>');
  assert.equal(headers.has('key'), false);
});
