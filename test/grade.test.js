import assert from 'node:assert/strict';
import { test } from 'node:test';

import { finding } from '../src/finding.js';
import { grade, meetsGrade, score } from '../src/grade.js';

test('score subtracts penalties and floors at 0', () => {
  assert.equal(score([]), 100);
  assert.equal(score([finding('a', 'high', ''), finding('b', 'low', ''), finding('c', 'info', '')]), 76);
  assert.equal(score(Array.from({ length: 5 }, () => finding('x', 'critical', ''))), 0);
});

test('grade boundaries', () => {
  assert.deepEqual([100, 99, 90, 89, 80, 79, 70, 69, 60, 59, 0].map(grade), ['A+', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'F', 'F']);
});

test('meetsGrade compares letter grades', () => {
  assert.ok(meetsGrade('A+', 'A'));
  assert.ok(meetsGrade('B', 'b'));
  assert.ok(!meetsGrade('C', 'B'));
  assert.throws(() => meetsGrade('A', 'Z'), RangeError);
});
