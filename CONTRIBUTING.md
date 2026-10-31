# Contributing

## Setup

No install step is needed; headerhawk has no dependencies.

```bash
npm test
node bin/headerhawk.js --file test/fixtures/weak.txt
```

## Adding a check

1. Create `src/checks/<id>.js` exporting `{ id, title, run(context) }`.
   `context` has `headers` (a case-insensitive `HeaderSet`), `url` (a `URL` or
   `null` for offline input) and `https` (boolean). Return an array of
   `finding(id, severity, title, detail, recommendation)` objects, empty when the check passes.
2. Register it in `src/checks/index.js`.
3. Add `test/<id>.test.js` with passing, failing and edge-case headers.
4. Document it in the README check table and in `CHANGELOG.md`.

Every finding needs a concrete recommendation. Telling someone a header is
wrong without saying what to send instead is not helpful.

## Style

- ES modules, 2-space indentation, single quotes.
- Keep the runtime dependency-free.
