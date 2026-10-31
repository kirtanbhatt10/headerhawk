import { parseDirectives } from '../directives.js';
import { finding } from '../finding.js';

const ID = 'framing';
const RECOMMEND = "Send `Content-Security-Policy: frame-ancestors 'none'` (or 'self'), plus `X-Frame-Options: DENY` for older browsers.";

export default {
  id: ID,
  title: 'Clickjacking protection',
  run({ headers }) {
    const csp = headers.getAll('content-security-policy').map(parseDirectives);
    const ancestors = csp.find((d) => d.has('frame-ancestors'))?.get('frame-ancestors');
    const xfo = headers.get('x-frame-options')?.trim().toUpperCase();

    if (ancestors) {
      if (ancestors.includes('*')) {
        return [finding(ID, 'medium', 'frame-ancestors allows framing by any site', `frame-ancestors ${ancestors.join(' ')}`, RECOMMEND)];
      }
      return [];
    }
    if (xfo === 'DENY' || xfo === 'SAMEORIGIN') return [];
    if (xfo?.startsWith('ALLOW-FROM')) {
      return [finding(ID, 'medium', 'X-Frame-Options ALLOW-FROM is ignored by modern browsers', xfo, RECOMMEND)];
    }
    if (xfo) {
      return [finding(ID, 'medium', 'X-Frame-Options has an invalid value', xfo, RECOMMEND)];
    }
    return [finding(ID, 'medium', 'Page can be framed by other sites (clickjacking)', 'no frame-ancestors or X-Frame-Options', RECOMMEND)];
  },
};
