import { finding } from '../finding.js';

const ID = 'caching';

export default {
  id: ID,
  title: 'Caching of sensitive responses',
  run({ headers }) {
    if (!headers.has('set-cookie')) return [];
    const cacheControl = (headers.get('cache-control') ?? '').toLowerCase();
    if (/\b(no-store|private)\b/.test(cacheControl)) return [];
    return [
      finding(ID, 'medium', 'Response sets cookies but may be stored by shared caches', cacheControl ? `Cache-Control: ${cacheControl}` : 'no Cache-Control header', 'Send `Cache-Control: no-store` (or `private`) on responses that set cookies or show user data.'),
    ];
  },
};
