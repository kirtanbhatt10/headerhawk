import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { auditHeaders } from '../src/audit.js';
import { CHECKS } from '../src/checks/index.js';
import { parseRaw } from '../src/headers.js';

const fixture = (name) => parseRaw(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')).headers;

test('strong fixture scores A+', () => {
  const result = auditHeaders(fixture('strong.txt'));
  assert.equal(result.grade, 'A+');
  assert.equal(result.findings.length, 0);
  assert.equal(result.passed.length, CHECKS.length);
});

test('weak fixture scores F with findings sorted by severity', () => {
  const result = auditHeaders(fixture('weak.txt'));
  assert.equal(result.grade, 'F');
  assert.equal(result.findings[0].severity, 'high');
  assert.equal(result.findings.at(-1).severity, 'info');
});

test('accepts plain objects and a target URL', () => {
  const result = auditHeaders({ 'X-Frame-Options': 'DENY' }, { url: 'http://example.com/' });
  assert.equal(result.target, 'http://example.com/');
  assert.ok(result.findings.some((f) => f.title.includes('plain HTTP')));
});

test('ignore skips checks and rejects unknown ids', () => {
  const result = auditHeaders({}, { ignore: ['csp', 'hsts'] });
  assert.ok(!result.findings.some((f) => f.check === 'csp' || f.check === 'hsts'));
  assert.throws(() => auditHeaders({}, { ignore: ['nope'] }), /unknown check/);
});
