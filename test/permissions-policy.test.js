import assert from 'node:assert/strict';
import { test } from 'node:test';

import check, { parsePermissionsPolicy } from '../src/checks/permissions-policy.js';
import { runCheck } from './helpers.js';

test('restrictive policy passes', () => {
  assert.deepEqual(runCheck(check, { 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)' }), []);
});

test('sensitive features open to everyone are flagged', () => {
  const [f] = runCheck(check, { 'Permissions-Policy': 'camera=*, microphone=(*), fullscreen=*' });
  assert.equal(f.severity, 'medium');
  assert.equal(f.detail, 'camera, microphone');
});

test('missing header and legacy Feature-Policy', () => {
  assert.match(runCheck(check, {})[0].title, /missing/);
  assert.match(runCheck(check, { 'Feature-Policy': "camera 'none'" })[0].title, /Feature-Policy/);
});

test('parsePermissionsPolicy', () => {
  const map = parsePermissionsPolicy('camera=(), geolocation=(self "https://maps.example"), usb=*');
  assert.equal(map.get('camera'), '()');
  assert.equal(map.get('usb'), '*');
});
