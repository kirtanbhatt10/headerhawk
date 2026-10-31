import { finding } from '../finding.js';

const ID = 'content-type-options';

export default {
  id: ID,
  title: 'MIME sniffing protection',
  run({ headers }) {
    const value = headers.get('x-content-type-options');
    if (value === undefined) {
      return [finding(ID, 'medium', 'X-Content-Type-Options header missing', '', 'Send `X-Content-Type-Options: nosniff`.')];
    }
    if (value.trim().toLowerCase() !== 'nosniff') {
      return [finding(ID, 'medium', 'X-Content-Type-Options has an invalid value', value, 'The only valid value is `nosniff`.')];
    }
    return [];
  },
};
