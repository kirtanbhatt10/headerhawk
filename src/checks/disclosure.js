import { finding } from '../finding.js';

const ID = 'disclosure';
const VERSIONED = /\d+(\.\d+)+/;
const LEAKY_HEADERS = ['x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version', 'x-generator', 'x-drupal-cache', 'x-runtime'];

export default {
  id: ID,
  title: 'Information disclosure',
  run({ headers }) {
    const out = [];
    const server = headers.get('server');
    if (server && VERSIONED.test(server)) {
      out.push(finding(ID, 'low', 'Server header reveals a version number', `Server: ${server}`, 'Strip version details (e.g. `server_tokens off;` in nginx).'));
    }
    for (const name of LEAKY_HEADERS) {
      const value = headers.get(name);
      if (value !== undefined) {
        out.push(finding(ID, 'low', `${name} header reveals the technology stack`, `${name}: ${value}`, `Remove the ${name} header.`));
      }
    }
    return out;
  },
};
