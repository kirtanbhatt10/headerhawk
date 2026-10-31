import assert from 'node:assert/strict';
import { test } from 'node:test';

import check, { parseSetCookie } from '../src/checks/cookies.js';
import { runCheck, titles } from './helpers.js';

const cookie = (value, url) => runCheck(check, { 'Set-Cookie': value }, { url });

test('well-configured cookies pass', () => {
  assert.deepEqual(cookie('__Host-sid=1; Path=/; Secure; HttpOnly; SameSite=Strict'), []);
});

test('session cookie missing flags is medium', () => {
  const findings = cookie('sessionid=abc');
  assert.ok(findings.some((f) => f.title.includes('Secure') && f.severity === 'medium'));
  assert.ok(findings.some((f) => f.title.includes('HttpOnly') && f.severity === 'medium'));
  assert.ok(findings.some((f) => f.title.includes('SameSite')));
});

test('non-session cookies get low severity', () => {
  assert.ok(cookie('theme=dark; SameSite=Lax').every((f) => f.severity === 'low'));
});

test('Secure is not required on plain HTTP targets', () => {
  assert.ok(!titles(cookie('theme=dark; HttpOnly; SameSite=Lax', 'http://example.com')).some((t) => t.includes('Secure')));
});

test('cookie prefix rules', () => {
  assert.match(cookie('__Host-a=1; Secure; Path=/; Domain=example.com; HttpOnly; SameSite=Lax')[0].title, /__Host-/);
  assert.match(cookie('__Secure-a=1; HttpOnly; SameSite=Lax')[0].title, /__Secure-/);
});

test('SameSite=None requires Secure', () => {
  assert.ok(titles(cookie('a=1; SameSite=None; HttpOnly')).some((t) => t.includes('SameSite=None')));
});

test('parseSetCookie', () => {
  const { name, attributes } = parseSetCookie('id=a=b; Path=/; Max-Age=60; Secure');
  assert.equal(name, 'id');
  assert.equal(attributes.get('max-age'), '60');
  assert.ok(attributes.has('secure'));
});
