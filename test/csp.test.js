import assert from 'node:assert/strict';
import { test } from 'node:test';

import csp, { analysePolicy } from '../src/checks/csp.js';
import { runCheck, titles } from './helpers.js';

const STRICT = "default-src 'self'; object-src 'none'; base-uri 'none'";

test('strict policy passes', () => {
  assert.deepEqual(runCheck(csp, { 'Content-Security-Policy': STRICT }), []);
});

test('missing CSP is high, report-only is medium', () => {
  assert.equal(runCheck(csp, {})[0].severity, 'high');
  assert.equal(runCheck(csp, { 'Content-Security-Policy-Report-Only': STRICT })[0].severity, 'medium');
});

test('unsafe-inline is flagged unless a nonce or hash is present', () => {
  assert.ok(titles(analysePolicy("script-src 'self' 'unsafe-inline'")).some((t) => /inline/.test(t)));
  assert.ok(!titles(analysePolicy("script-src 'nonce-abc' 'unsafe-inline'")).some((t) => /inline/.test(t)));
});

test('unsafe-eval and wildcard sources', () => {
  assert.ok(titles(analysePolicy("script-src 'self' 'unsafe-eval'")).some((t) => /eval/.test(t)));
  assert.ok(titles(analysePolicy('script-src https:')).some((t) => /any origin/.test(t)));
  assert.ok(!titles(analysePolicy("script-src 'nonce-a' 'strict-dynamic' https:")).some((t) => /any origin/.test(t)));
});

test('missing script restriction, object-src and base-uri', () => {
  const t = titles(analysePolicy("img-src 'self'"));
  assert.ok(t.some((x) => /does not restrict scripts/.test(x)));
  assert.ok(t.some((x) => /object-src/.test(x)));
  assert.ok(t.some((x) => /base-uri/.test(x)));
});

test('duplicate problems across multiple policies are reported once', () => {
  const findings = runCheck(csp, { 'Content-Security-Policy': ["img-src 'self'", "font-src 'self'"] });
  assert.equal(new Set(titles(findings)).size, findings.length);
});
