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

