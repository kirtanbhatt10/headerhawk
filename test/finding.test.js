import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compareFindings, finding, SEVERITIES } from '../src/finding.js';

test('finding builds a plain object', () => {
  assert.deepEqual(finding('hsts', 'high', 'missing', 'd', 'r'), { check: 'hsts', severity: 'high', title: 'missing', detail: 'd', recommendation: 'r' });
});

test('finding rejects unknown severities', () => {
  assert.throws(() => finding('x', 'urgent', 't'), TypeError);
});

test('severities are ordered low to high', () => {
  assert.deepEqual(SEVERITIES, ['info', 'low', 'medium', 'high', 'critical']);
});

test('compareFindings sorts by severity then check id', () => {
  const list = [finding('b', 'low', ''), finding('z', 'high', ''), finding('a', 'low', '')];
  assert.deepEqual(list.sort(compareFindings).map((f) => f.check), ['z', 'a', 'b']);
});
