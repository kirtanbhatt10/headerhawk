import { HeaderSet } from '../src/headers.js';

/** Run a check against plain-object headers. */
export function runCheck(check, headers = {}, { url = null } = {}) {
  const target = url ? new URL(url) : null;
  return check.run({ headers: HeaderSet.fromObject(headers), url: target, https: target ? target.protocol === 'https:' : true });
}

export const titles = (findings) => findings.map((f) => f.title);
export const severities = (findings) => findings.map((f) => f.severity);
