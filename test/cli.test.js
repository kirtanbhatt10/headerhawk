import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { main } from '../src/cli.js';
import { VERSION } from '../src/version.js';
import { startServer } from './server.js';

const WEAK = fileURLToPath(new URL('./fixtures/weak.txt', import.meta.url));
const STRONG = fileURLToPath(new URL('./fixtures/strong.txt', import.meta.url));

function capture() {
  const out = { text: '', write(s) { this.text += s; } };
  const err = { text: '', write(s) { this.text += s; } };
  return { out, err, io: { stdout: out, stderr: err, isTTY: false } };
}

let server;
before(async () => {
  server = await startServer();
});
after(() => server.close());

test('--version and --help', async () => {
  const c = capture();
  assert.equal(await main(['--version'], c.io), 0);
  assert.equal(c.out.text.trim(), VERSION);
  assert.equal(await main(['--help'], c.io), 0);
  assert.match(c.out.text, /Usage:/);
});

test('--list-checks prints every check', async () => {
  const c = capture();
  await main(['--list-checks'], c.io);
  assert.match(c.out.text, /^hsts/m);
  assert.match(c.out.text, /^cookies/m);
});

test('audits a header file', async () => {
  const c = capture();
  assert.equal(await main(['--file', WEAK], c.io), 0);
  assert.match(c.out.text, /Grade F/);
});

test('--fail-under gates on grade and score', async () => {
  assert.equal(await main(['--file', WEAK, '--fail-under', 'C'], capture().io), 1);
  assert.equal(await main(['--file', STRONG, '--fail-under', 'A+'], capture().io), 0);
  assert.equal(await main(['--file', STRONG, '--fail-under', '100'], capture().io), 0);
});

test('reads stdin', async () => {
  const c = capture();
  c.io.stdin = Readable.from([readFileSync(STRONG, 'utf8')]);
  assert.equal(await main(['--stdin', '--format', 'json'], c.io), 0);
  assert.equal(JSON.parse(c.out.text).results[0].source, 'stdin');
});

test('audits a live URL and writes a report file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'headerhawk-'));
  const output = join(dir, 'report.md');
  assert.equal(await main([`${server.base}/`, '--format', 'markdown', '--output', output], capture().io), 0);
  assert.match(readFileSync(output, 'utf8'), /# headerhawk report/);
});

test('--ignore removes checks from the result', async () => {
  const c = capture();
  await main(['--file', WEAK, '--format', 'json', '--ignore', 'cookies,cors'], c.io);
  const checks = JSON.parse(c.out.text).results[0].findings.map((f) => f.check);
  assert.ok(!checks.includes('cookies') && !checks.includes('cors'));
});

test('errors exit with code 2', async () => {
  for (const args of [[], ['--format', 'pdf', '--file', WEAK], ['--file', WEAK, '--fail-under', 'Z'], ['--file', '/no/such/file'], ['--timeout', '-5', 'example.com']]) {
    const c = capture();
    assert.equal(await main(args, c.io), 2, args.join(' '));
  }
});
