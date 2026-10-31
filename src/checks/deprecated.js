import { finding } from '../finding.js';

const ID = 'deprecated';

export default {
  id: ID,
  title: 'Deprecated security headers',
  run({ headers }) {
    const out = [];
    const xss = headers.get('x-xss-protection');
    if (xss !== undefined && xss.trim() !== '0') {
      out.push(finding(ID, 'low', 'X-XSS-Protection enables the legacy XSS auditor', `X-XSS-Protection: ${xss}`, 'Set it to 0 or remove it, and rely on CSP.'));
    }
    if (headers.has('public-key-pins')) {
      out.push(finding(ID, 'medium', 'Public-Key-Pins (HPKP) is deprecated and risky', '', 'Remove HPKP; a bad pin can lock users out of the site.'));
    }
    if (headers.has('expect-ct')) {
      out.push(finding(ID, 'info', 'Expect-CT is obsolete', '', 'Remove it; Certificate Transparency is enforced by default.'));
    }
    return out;
  },
};
