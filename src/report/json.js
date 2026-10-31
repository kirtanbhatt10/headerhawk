import { VERSION } from '../version.js';

export function renderJson(results) {
  return JSON.stringify({ tool: 'headerhawk', version: VERSION, generatedAt: new Date().toISOString(), results }, null, 2);
}
