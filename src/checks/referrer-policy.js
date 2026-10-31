import { finding } from '../finding.js';

const ID = 'referrer-policy';
const VALID = new Set([
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url',
]);
const LEAKY = new Set(['unsafe-url', 'no-referrer-when-downgrade']);
const RECOMMEND = 'Send `Referrer-Policy: strict-origin-when-cross-origin` (or `no-referrer`).';

export default {
  id: ID,
  title: 'Referrer policy',
  run({ headers }) {
    const value = headers.get('referrer-policy');
    if (value === undefined) {
      return [finding(ID, 'low', 'Referrer-Policy header missing', 'browsers fall back to their default', RECOMMEND)];
    }
    // Browsers use the last value they understand.
    const effective = value
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter((v) => VALID.has(v))
      .at(-1);
    if (!effective) {
      return [finding(ID, 'low', 'Referrer-Policy has no valid value', value, RECOMMEND)];
    }
    if (LEAKY.has(effective)) {
      return [finding(ID, 'medium', `Referrer-Policy '${effective}' leaks full URLs to other sites`, value, RECOMMEND)];
    }
    return [];
  },
};
