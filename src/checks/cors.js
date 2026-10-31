import { finding } from '../finding.js';

const ID = 'cors';

export default {
  id: ID,
  title: 'CORS configuration',
  run({ headers }) {
    const origin = headers.get('access-control-allow-origin')?.trim();
    if (!origin) return [];
    const credentials = headers.get('access-control-allow-credentials')?.trim().toLowerCase() === 'true';
    if (origin === '*' && credentials) {
      return [finding(ID, 'high', 'CORS allows any origin together with credentials', 'Access-Control-Allow-Origin: * with Allow-Credentials: true', 'Reflect only an allowlist of trusted origins when credentials are needed.')];
    }
    if (origin.toLowerCase() === 'null') {
      return [finding(ID, 'medium', "CORS trusts the 'null' origin", 'sandboxed iframes and local files can send Origin: null', 'Never allow the null origin.')];
    }
    if (origin === '*') {
      return [finding(ID, 'info', 'Any origin can read this response (CORS *)', '', 'Fine for public, unauthenticated resources; restrict it otherwise.')];
    }
    return [];
  },
};
