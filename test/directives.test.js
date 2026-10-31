import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseDirectives } from '../src/directives.js';

test('parses directives and lower-cases names', () => {
  const d = parseDirectives("Default-Src 'self'; script-src 'self' https://cdn.example;;");
  assert.deepEqual(d.get('default-src'), ["'self'"]);
  assert.deepEqual(d.get('script-src'), ["'self'", 'https://cdn.example']);
});

test('first occurrence of a directive wins', () => {
  assert.deepEqual(parseDirectives("script-src 'self'; script-src *").get('script-src'), ["'self'"]);
});

test('empty input yields an empty map', () => {
  assert.equal(parseDirectives(undefined).size, 0);
});
