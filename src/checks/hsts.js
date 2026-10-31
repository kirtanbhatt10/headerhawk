import { finding } from '../finding.js';

const ID = 'hsts';
const SIX_MONTHS = 15552000;
const ONE_YEAR = 31536000;
const RECOMMEND = 'Send `Strict-Transport-Security: max-age=31536000; includeSubDomains` on every HTTPS response.';

export function parseHsts(value) {
  const result = { maxAge: null, includeSubDomains: false, preload: false };
  for (const part of value.split(';')) {
    const [rawKey, ...rest] = part.split('=');
    const key = rawKey.trim().toLowerCase();
    const val = rest.join('=').trim().replace(/^"|"$/g, '');
    if (key === 'max-age' && result.maxAge === null) result.maxAge = /^\d+$/.test(val) ? Number(val) : NaN;
    if (key === 'includesubdomains') result.includeSubDomains = true;
    if (key === 'preload') result.preload = true;
  }
  return result;
}

export default {
  id: ID,
  title: 'HTTP Strict Transport Security',
  run({ headers, url, https }) {
    if (url && !https) {
      return [
        finding(ID, 'high', 'Page is served over plain HTTP', `${url.href} did not redirect to HTTPS`, 'Redirect all HTTP traffic to HTTPS, then enable HSTS.'),
      ];
    }
    const value = headers.get('strict-transport-security');
    if (value === undefined) {
      return [finding(ID, 'high', 'Strict-Transport-Security header missing', '', RECOMMEND)];
    }
    const hsts = parseHsts(headers.getAll('strict-transport-security')[0]);
    const out = [];
    if (hsts.maxAge === null || Number.isNaN(hsts.maxAge)) {
      out.push(finding(ID, 'high', 'HSTS max-age is missing or invalid', value, RECOMMEND));
      return out;
    }
    if (hsts.maxAge === 0) {
      out.push(finding(ID, 'high', 'HSTS is disabled with max-age=0', value, RECOMMEND));
      return out;
    }
    if (hsts.maxAge < SIX_MONTHS) {
      out.push(finding(ID, 'medium', 'HSTS max-age is shorter than 6 months', `max-age=${hsts.maxAge}`, RECOMMEND));
    }
    if (!hsts.includeSubDomains) {
      out.push(finding(ID, 'low', 'HSTS does not cover subdomains', value, 'Add `includeSubDomains` once all subdomains serve HTTPS.'));
    }
    if (hsts.preload && (!hsts.includeSubDomains || hsts.maxAge < ONE_YEAR)) {
      out.push(finding(ID, 'low', 'HSTS preload requested but requirements are not met', value, 'Preload needs max-age >= 31536000 and includeSubDomains.'));
    }
    return out;
  },
};
