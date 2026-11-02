# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-11-02

### Fixed

- Repeated `Strict-Transport-Security` headers were misparsed on live audits,
  because `fetch` comma-joins them (`max-age=63072000; preload, max-age=0`).
  They are now split back apart, only the first value is graded (as browsers
  do), and conflicting values are reported as a medium finding.

### Added

- Release workflow: tests, checks the tag against `package.json` and the CLI,
  attaches the npm tarball to the GitHub release, moves the `v0` action tag
  and can publish to npm with provenance once a token is configured.
- Animated terminal demo in the README.

## [0.1.0] - 2026-10-31

### Added

- Twelve checks: HSTS, CSP, clickjacking, MIME sniffing, Referrer-Policy,
  Permissions-Policy, cross-origin isolation, cookies, CORS, caching of
  cookie-setting responses, information disclosure and deprecated headers.
- A+ to F grading with severity-weighted scoring.
- Live URL audits with a recorded redirect chain and timeouts.
- Offline audits of `curl -I` dumps (files or stdin), including redirect chains and folded headers.
- Text, JSON, Markdown and SARIF 2.1.0 reports.
- `--fail-under` CI gate, `--ignore`, `--list-checks`.
- Composite GitHub Action that writes the report to the job summary.
