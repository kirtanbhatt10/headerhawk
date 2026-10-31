# headerhawk

**Audit the HTTP security headers and cookies of any site, get an A+ to F grade
and a concrete fix for every finding.** headerhawk is a zero-dependency Node.js
CLI and library that works on live URLs, saved `curl -I` dumps or piped input,
and outputs text, JSON, Markdown or SARIF so it can gate deployments in CI.

## Install

```bash
npm install -g github:kirtanbhatt10/headerhawk
# or run it without installing
npx github:kirtanbhatt10/headerhawk https://example.com
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

