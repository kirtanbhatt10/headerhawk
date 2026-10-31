import { finding } from '../finding.js';

const ID = 'cross-origin';

export default {
  id: ID,
  title: 'Cross-origin isolation',
  run({ headers }) {
    const out = [];
    const coop = headers.get('cross-origin-opener-policy')?.trim().toLowerCase();
    if (!coop) {
      out.push(finding(ID, 'low', 'Cross-Origin-Opener-Policy header missing', 'other sites can keep a handle to this window (XS-Leaks)', 'Send `Cross-Origin-Opener-Policy: same-origin`.'));
    } else if (coop === 'unsafe-none') {
      out.push(finding(ID, 'low', "Cross-Origin-Opener-Policy is 'unsafe-none'", coop, 'Use `same-origin` (or `same-origin-allow-popups` for OAuth popups).'));
    }
    if (!headers.has('cross-origin-resource-policy')) {
      out.push(finding(ID, 'info', 'Cross-Origin-Resource-Policy header missing', '', 'Send `Cross-Origin-Resource-Policy: same-origin` on resources that should not be embedded cross-site.'));
    }
    return out;
  },
};
