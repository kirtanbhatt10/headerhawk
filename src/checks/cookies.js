import { finding } from '../finding.js';

const ID = 'cookies';
const SESSION_LIKE = /(sess|sid|token|auth|jwt|login|remember|csrf|xsrf)/i;

/** Parse one Set-Cookie value into its name and lower-cased attributes. */
export function parseSetCookie(value) {
  const [pair, ...attrs] = value.split(';');
  const name = pair.split('=')[0].trim();
  const attributes = new Map();
  for (const attr of attrs) {
    const [k, ...v] = attr.split('=');
    if (k.trim()) attributes.set(k.trim().toLowerCase(), v.join('=').trim());
  }
  return { name, attributes };
}

export default {
  id: ID,
  title: 'Cookie security',
  run({ headers, https }) {
    const out = [];
    for (const raw of headers.getAll('set-cookie')) {
      const { name, attributes } = parseSetCookie(raw);
      const secure = attributes.has('secure');
      const sameSite = attributes.get('samesite')?.toLowerCase();
      const label = `cookie "${name}"`;
      const sessionLike = SESSION_LIKE.test(name);

      if (name.startsWith('__Host-') && (!secure || attributes.get('path') !== '/' || attributes.has('domain'))) {
        out.push(finding(ID, 'high', `${label} breaks the __Host- prefix rules`, raw, '__Host- cookies need Secure, Path=/ and no Domain.'));
      } else if (name.startsWith('__Secure-') && !secure) {
        out.push(finding(ID, 'high', `${label} uses __Secure- without Secure`, raw, 'Add the Secure attribute.'));
      }
      if (sameSite === 'none' && !secure) {
        out.push(finding(ID, 'high', `${label} has SameSite=None without Secure`, raw, 'Browsers reject this cookie; add Secure.'));
      }
      if (!secure && https) {
        out.push(finding(ID, sessionLike ? 'medium' : 'low', `${label} is missing Secure`, raw, 'Add Secure so it is never sent over plain HTTP.'));
      }
      if (!attributes.has('httponly')) {
        out.push(finding(ID, sessionLike ? 'medium' : 'low', `${label} is missing HttpOnly`, raw, 'Add HttpOnly unless JavaScript must read it.'));
      }
      if (!sameSite) {
        out.push(finding(ID, 'low', `${label} has no SameSite attribute`, raw, 'Set SameSite=Lax (or Strict) explicitly.'));
      }
    }
    return out;
  },
};
