import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

import { auditHeaders, auditUrl } from './audit.js';
import { CHECKS } from './checks/index.js';
import { meetsGrade } from './grade.js';
import { parseRaw } from './headers.js';
import { FORMATS } from './report/index.js';
import { VERSION } from './version.js';

export const EXIT_OK = 0;
export const EXIT_BELOW_THRESHOLD = 1;
export const EXIT_ERROR = 2;

const HELP = `headerhawk ${VERSION} - audit HTTP security headers and cookies

Usage:
  headerhawk [options] <url...>
  headerhawk --file response-headers.txt
  curl -sI https://example.com | headerhawk --stdin

Options:
  -f, --file <path>       audit a saved header dump (repeatable)
      --stdin             read a header dump from stdin
  -F, --format <fmt>      text | json | markdown | sarif (default: text)
  -o, --output <path>     write the report to a file instead of stdout
      --fail-under <min>  exit 1 if a target scores below a grade (A+, A, B, C, D) or a number 0-100
      --ignore <ids>      comma-separated check ids to skip
      --timeout <ms>      request timeout in milliseconds (default: 10000)
      --no-color          disable colors in text output
      --list-checks       list available checks
  -h, --help              show this help
  -v, --version           show the version
`;

const OPTIONS = {
  file: { type: 'string', short: 'f', multiple: true },
  stdin: { type: 'boolean' },
  format: { type: 'string', short: 'F', default: 'text' },
  output: { type: 'string', short: 'o' },
  'fail-under': { type: 'string' },
  ignore: { type: 'string' },
  timeout: { type: 'string', default: '10000' },
  'no-color': { type: 'boolean' },
  'list-checks': { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
};

function belowThreshold(result, threshold) {
  if (/^\d+$/.test(threshold)) return result.score < Number(threshold);
  return !meetsGrade(result.grade, threshold);
}

async function readStdin(stdin) {
  let data = '';
  for await (const chunk of stdin) data += chunk;
  return data;
}

/**
 * Run the CLI. Returns an exit code instead of exiting so it can be tested.
 * @param {string[]} argv
 * @param {{stdout?: {write(s: string): void}, stderr?: {write(s: string): void}, stdin?: AsyncIterable<string>, isTTY?: boolean}} [io]
 */
export async function main(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  try {
    const { values, positionals } = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true });
    if (values.help) return stdout.write(HELP), EXIT_OK;
    if (values.version) return stdout.write(`${VERSION}\n`), EXIT_OK;
    if (values['list-checks']) {
      for (const c of CHECKS) stdout.write(`${c.id.padEnd(22)}${c.title}\n`);
      return EXIT_OK;
    }

    const render = FORMATS[values.format];
    if (!render) throw new Error(`unknown format "${values.format}" (use ${Object.keys(FORMATS).join(', ')})`);
    const timeout = Number(values.timeout);
    if (!Number.isInteger(timeout) || timeout <= 0) throw new Error('--timeout must be a positive integer');
    const ignore = values.ignore ? values.ignore.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const threshold = values['fail-under'];
    if (threshold !== undefined && !/^\d+$/.test(threshold)) meetsGrade('F', threshold); // validates the grade

    const results = [];
    for (const path of values.file ?? []) {
      const { headers } = parseRaw(await readFile(path, 'utf8'));
      results.push({ ...auditHeaders(headers, { ignore }), source: path });
    }
    if (values.stdin) {
      const { headers } = parseRaw(await readStdin(io.stdin ?? process.stdin));
      results.push({ ...auditHeaders(headers, { ignore }), source: 'stdin' });
    }
    for (const url of positionals) {
      results.push(await auditUrl(/^https?:\/\//i.test(url) ? url : `https://${url}`, { ignore, timeout }));
    }
    if (!results.length) {
      stderr.write(HELP);
      return EXIT_ERROR;
    }

    const color = values.format === 'text' && !values['no-color'] && !values.output && (io.isTTY ?? process.stdout.isTTY ?? false);
    const report = render(results, { color });
    if (values.output) await writeFile(values.output, `${report}\n`);
    else stdout.write(`${report}\n`);

    return threshold !== undefined && results.some((r) => belowThreshold(r, threshold)) ? EXIT_BELOW_THRESHOLD : EXIT_OK;
  } catch (error) {
    stderr.write(`headerhawk: ${error.message}\n`);
    return EXIT_ERROR;
  }
}
