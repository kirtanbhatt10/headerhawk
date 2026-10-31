import assert from 'node:assert/strict';
import { test } from 'node:test';

import { auditHeaders } from '../src/audit.js';
import { CHECKS } from '../src/checks/index.js';
import { FORMATS } from '../src/report/index.js';

const weak = { ...auditHeaders({ 'X-Powered-By': 'Express', 'Set-Cookie': 'sid=1' }), source: 'weak.txt' };
const clean = auditHeaders({
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
});

test('text report shows grade and findings without color by default', () => {
  const out = FORMATS.text([weak]);
  assert.match(out, /Grade F/);
  assert.match(out, /weak\.txt/);
  assert.doesNotMatch(out, /\x1b\[/);
  assert.match(FORMATS.text([weak], { color: true }), /\x1b\[/);
});

test('json report is parseable', () => {
  const data = JSON.parse(FORMATS.json([weak]));
  assert.equal(data.tool, 'headerhawk');
  assert.equal(data.results[0].grade, 'F');
});

test('markdown report escapes pipes and celebrates clean results', () => {
  assert.match(FORMATS.markdown([weak]), /\| Severity \| Check \|/);
  assert.match(FORMATS.markdown([clean]), /No findings/);
});

test('sarif report is valid-looking SARIF 2.1.0', () => {
  const sarif = JSON.parse(FORMATS.sarif([weak]));
  assert.equal(sarif.version, '2.1.0');
  const run = sarif.runs[0];
  assert.equal(run.tool.driver.rules.length, CHECKS.length);
  assert.equal(run.results.length, weak.findings.length);
  for (const r of run.results) {
    assert.equal(run.tool.driver.rules[r.ruleIndex].id, r.ruleId);
    assert.ok(['error', 'warning', 'note'].includes(r.level));
    assert.equal(r.locations[0].physicalLocation.artifactLocation.uri, 'weak.txt');
  }
});
