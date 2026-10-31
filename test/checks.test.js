import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { CHECKS } from '../src/checks/index.js';
import { VERSION } from '../src/version.js';

test('check ids are unique, titled and runnable', () => {
  const ids = CHECKS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of CHECKS) {
    assert.match(c.id, /^[a-z-]+$/);
    assert.ok(c.title);
    assert.equal(typeof c.run, 'function');
  }
});

test('VERSION matches package.json', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(VERSION, pkg.version);
});
