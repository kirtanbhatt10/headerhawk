# headerhawk

[![ci](https://github.com/kirtanbhatt10/headerhawk/actions/workflows/ci.yml/badge.svg)](https://github.com/kirtanbhatt10/headerhawk/actions/workflows/ci.yml)
![node](https://img.shields.io/badge/node-%3E%3D20-339933)
![dependencies](https://img.shields.io/badge/dependencies-0-success)
![license](https://img.shields.io/badge/license-MIT-black)
![release](https://img.shields.io/github/v/release/kirtanbhatt10/headerhawk)

**Audit the HTTP security headers and cookies of any site, get an A+ to F grade
and a concrete fix for every finding.** headerhawk is a zero-dependency Node.js
CLI and library that works on live URLs, saved `curl -I` dumps or piped input,
and outputs text, JSON, Markdown or SARIF so it can gate deployments in CI.

<p align="center">
  <img src="docs/demo.svg" alt="headerhawk grading a weak site F with 16 findings, a hardened site A+, and blocking a deploy below grade B" width="100%">
</p>

```text
$ headerhawk --file test/fixtures/weak.txt
headerhawk 0.2.0

test/fixtures/weak.txt
  Grade F (0/100)  16 finding(s), 0 check(s) passed
  HIGH     cors                  CORS allows any origin together with credentials
                                 Access-Control-Allow-Origin: * with Allow-Credentials: true
                                 fix: Reflect only an allowlist of trusted origins when credentials are needed.
  HIGH     csp                   Content-Security-Policy header missing
                                 fix: Start from `default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` and add sources as needed.
  HIGH     hsts                  Strict-Transport-Security header missing
                                 fix: Send `Strict-Transport-Security: max-age=31536000; includeSubDomains` on every HTTPS response.
  ...
```

Every finding comes with the evidence it was based on (when there is any) and a
`fix:` line you can act on.

## Contents

- [Install](#install)
- [Usage](#usage) and [options](#options)
- [Checks](#checks) and [scoring](#scoring)
- [Output formats](#output-formats)
- [GitHub Action](#github-action)
- [Library](#library)
- [Fixing what it finds](#fixing-what-it-finds)
- [Development](#development)

## Install

```bash
npm install -g github:kirtanbhatt10/headerhawk#v0.2.0
# or run it without installing
npx github:kirtanbhatt10/headerhawk#v0.2.0 https://example.com
# or grab headerhawk-0.2.0.tgz from the GitHub release and `npm install -g ./headerhawk-0.2.0.tgz`
```

Requires Node.js 20 or newer. No dependencies.

## Usage

```bash
headerhawk https://example.com                       # audit a live site (follows redirects)
headerhawk example.com api.example.com               # several targets, https:// assumed
headerhawk --file response-headers.txt               # audit a saved header dump
curl -sIL https://example.com | headerhawk --stdin   # last response in a redirect chain is used
headerhawk example.com --format sarif -o headers.sarif
headerhawk example.com --fail-under B                # exit 1 below grade B (or use a score: 80)
headerhawk example.com --ignore cross-origin,disclosure
headerhawk --list-checks
```

### Options

| Option | Description |
| --- | --- |
| `-f, --file <path>` | audit a saved header dump (repeatable) |
| `--stdin` | read a header dump from stdin |
| `-F, --format <fmt>` | `text`, `json`, `markdown` or `sarif` (default: `text`) |
| `-o, --output <path>` | write the report to a file instead of stdout |
| `--fail-under <min>` | exit 1 if a target scores below a grade (`A+`, `A`, `B`, `C`, `D`) or a number 0-100 |
| `--ignore <ids>` | comma-separated check ids to skip (see `--list-checks`) |
| `--timeout <ms>` | request timeout in milliseconds (default: `10000`) |
| `--no-color` | disable colors in text output |
| `--list-checks` | list available checks |
| `-h, --help` / `-v, --version` | show help / the version |

| Exit code | Meaning |
| --- | --- |
| `0` | audit finished and every target met `--fail-under` |
| `1` | at least one target scored below `--fail-under` |
| `2` | usage error, unreadable file or network failure |

## Checks

| Check | Looks at | Example finding |
| --- | --- | --- |
| `hsts` | Strict-Transport-Security, plain-HTTP targets | max-age under 6 months, no `includeSubDomains`, broken preload |
| `csp` | Content-Security-Policy | `'unsafe-inline'` without nonces, `'unsafe-eval'`, `https:`/`*` script sources, no `object-src 'none'` |
| `framing` | `frame-ancestors`, X-Frame-Options | clickjacking, ignored `ALLOW-FROM` |
| `content-type-options` | X-Content-Type-Options | missing `nosniff` |
| `referrer-policy` | Referrer-Policy | `unsafe-url` / `no-referrer-when-downgrade` leaking full URLs |
| `permissions-policy` | Permissions-Policy, Feature-Policy | camera, microphone or geolocation open to every origin |
| `cross-origin` | COOP, CORP | missing isolation headers (XS-Leaks) |
| `cookies` | Set-Cookie | missing Secure / HttpOnly / SameSite, `SameSite=None` without Secure, broken `__Host-` / `__Secure-` prefixes |
| `cors` | Access-Control-Allow-* | `*` with credentials, trusting the `null` origin |
| `caching` | Cache-Control on cookie-setting responses | user data stored by shared caches |
| `disclosure` | Server, X-Powered-By and friends | version numbers and stack fingerprints |
| `deprecated` | X-XSS-Protection, HPKP, Expect-CT | legacy headers that do more harm than good |

Session-looking cookies (`sid`, `session`, `token`, `auth`…) get stricter
severities than preference cookies like `theme`.

## Scoring

Every target starts at 100 and loses **40 / 20 / 10 / 4 / 0** points per
critical / high / medium / low / info finding. A+ is reserved for a perfect 100,
then A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60 and F below that.

## Output formats

- `text`: human-readable, colored in a terminal.
- `json`: full results, including passed checks and the redirect chain.
- `markdown`: a table per target, ready for PR comments or `$GITHUB_STEP_SUMMARY`.
- `sarif`: SARIF 2.1.0 for GitHub code scanning and other SARIF viewers.

## GitHub Action

```yaml
- uses: kirtanbhatt10/headerhawk@v0.2.0   # or @v0 to follow the latest 0.x release
  with:
    urls: https://your-site.example https://api.your-site.example/health
    fail-under: B
```

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `urls` | yes | | space-separated URLs to audit |
| `fail-under` | no | `B` | minimum grade (`A+`, `A`, `B`, `C`, `D`) or score (0-100) |
| `args` | no | `""` | extra headerhawk arguments, e.g. `--ignore cross-origin` |

The Markdown report is added to the job summary, and the step fails when any
target scores below `fail-under`. A full workflow is in
[`examples/headerhawk-workflow.yml`](examples/headerhawk-workflow.yml).

## Library

```js
import { auditHeaders, auditUrl, parseRaw } from 'headerhawk';

const live = await auditUrl('https://example.com', { timeout: 5000 });
console.log(live.grade, live.findings);

const { headers } = parseRaw(savedCurlOutput);
const offline = auditHeaders(headers, { ignore: ['disclosure'] });
```

Each result has `target`, `score`, `grade`, `findings` and `passed`. The package
also exports `fetchHeaders`, `CHECKS`, `grade`, `score`, `meetsGrade`, `FORMATS`
and `VERSION`.

## Fixing what it finds

Copy-paste starting points that score A+:

- nginx: [`examples/nginx-security-headers.conf`](examples/nginx-security-headers.conf)
- Express, without helmet: [`examples/express-helmet-free.js`](examples/express-helmet-free.js)

Tighten the CSP to the sources your site really loads before shipping it.

## Responsible use

headerhawk sends one ordinary `GET` request per target (plus redirects), the
same as a browser. Only audit sites you own or are allowed to test.

## Development

```bash
npm test          # node:test, no install step needed
node bin/headerhawk.js --file test/fixtures/strong.txt
```

See [CONTRIBUTING.md](CONTRIBUTING.md) to add a check.

## License

[MIT](LICENSE) © Kirtan Bhatt
