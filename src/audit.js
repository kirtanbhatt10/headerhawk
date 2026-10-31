import { CHECKS } from './checks/index.js';
import { fetchHeaders } from './fetch.js';
import { compareFindings } from './finding.js';
import { grade, score } from './grade.js';
import { HeaderSet } from './headers.js';

/**
 * Audit a set of response headers.
 * @param {HeaderSet|Record<string, string|string[]>} headers
 * @param {{url?: string|URL|null, ignore?: string[]}} [options]
 */
export function auditHeaders(headers, { url = null, ignore = [] } = {}) {
  const set = headers instanceof HeaderSet ? headers : HeaderSet.fromObject(headers);
  const target = url ? new URL(url) : null;
  const context = { headers: set, url: target, https: target ? target.protocol === 'https:' : true };
  const unknown = ignore.filter((id) => !CHECKS.some((c) => c.id === id));
  if (unknown.length) throw new RangeError(`unknown check id(s): ${unknown.join(', ')}`);

  const findings = [];
  const passed = [];
  for (const check of CHECKS) {
    if (ignore.includes(check.id)) continue;
    const results = check.run(context);
    if (results.length) findings.push(...results);
    else passed.push(check.id);
  }
  findings.sort(compareFindings);
  const value = score(findings);
  return { target: target?.href ?? null, score: value, grade: grade(value), findings, passed };
}

/** Fetch a URL (following redirects) and audit the final response. */
export async function auditUrl(url, { ignore = [], ...fetchOptions } = {}) {
  const response = await fetchHeaders(url, fetchOptions);
  return {
    ...auditHeaders(response.headers, { url: response.finalUrl, ignore }),
    target: response.url,
    finalUrl: response.finalUrl,
    status: response.status,
    redirects: response.redirects,
  };
}
