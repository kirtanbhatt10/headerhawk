import { parseDirectives } from '../directives.js';
import { finding } from '../finding.js';

const ID = 'csp';
const STARTER = "Start from `default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` and add sources as needed.";
const BROAD_SOURCES = new Set(['*', 'http:', 'https:', 'data:', 'blob:']);

function scriptSources(directives) {
  return directives.get('script-src') ?? directives.get('default-src');
}

function hasNonceOrHash(sources) {
  return sources.some((s) => /^'(nonce-|sha256-|sha384-|sha512-)/i.test(s));
}

/** Analyse a single enforced CSP policy string. */
export function analysePolicy(policy) {
  const d = parseDirectives(policy);
  const out = [];
  const scripts = scriptSources(d);
  const lower = (list) => list.map((s) => s.toLowerCase());

  if (!scripts) {
    out.push(finding(ID, 'high', 'CSP does not restrict scripts', 'no script-src or default-src directive', STARTER));
  } else {
    const src = lower(scripts);
    const strictDynamic = src.includes("'strict-dynamic'");
    if (src.includes("'unsafe-inline'") && !hasNonceOrHash(scripts)) {
      out.push(finding(ID, 'high', "CSP allows inline scripts ('unsafe-inline')", `script sources: ${scripts.join(' ')}`, 'Use nonces or hashes instead of unsafe-inline.'));
    }
    if (src.includes("'unsafe-eval'")) {
      out.push(finding(ID, 'medium', "CSP allows eval() ('unsafe-eval')", `script sources: ${scripts.join(' ')}`, 'Remove unsafe-eval and avoid string-to-code APIs.'));
    }
    const broad = src.filter((s) => BROAD_SOURCES.has(s));
    if (broad.length && !strictDynamic) {
      out.push(finding(ID, 'high', 'CSP allows scripts from any origin', `wildcard or scheme source: ${broad.join(' ')}`, 'List exact script origins, or use nonces with strict-dynamic.'));
    }
  }

  const objects = d.get('object-src') ?? d.get('default-src');
  if (!objects || !lower(objects).includes("'none'")) {
    out.push(finding(ID, 'medium', 'CSP does not block plugins (object-src)', objects ? `object-src: ${objects.join(' ')}` : 'object-src not set', "Add `object-src 'none'`."));
  }
  if (!d.has('base-uri')) {
    out.push(finding(ID, 'low', 'CSP does not restrict <base> (base-uri)', '', "Add `base-uri 'none'` (or 'self')."));
  }
  return out;
}

export default {
  id: ID,
  title: 'Content Security Policy',
  run({ headers }) {
    const enforced = headers.getAll('content-security-policy');
    if (!enforced.length) {
      if (headers.has('content-security-policy-report-only')) {
        return [finding(ID, 'medium', 'CSP is only in report-only mode', 'Content-Security-Policy-Report-Only is set but nothing is enforced', 'Promote the policy to Content-Security-Policy once reports are clean.')];
      }
      return [finding(ID, 'high', 'Content-Security-Policy header missing', '', STARTER)];
    }
    // Multiple policies are all enforced; report each problem once.
    const seen = new Set();
    return enforced.flatMap(analysePolicy).filter((f) => !seen.has(f.title) && seen.add(f.title));
  },
};
