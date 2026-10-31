import { finding } from '../finding.js';

const ID = 'permissions-policy';
const SENSITIVE = ['camera', 'microphone', 'geolocation', 'payment', 'usb', 'display-capture'];
const RECOMMEND = 'Send `Permissions-Policy: camera=(), microphone=(), geolocation=()` and enable only what you use.';

/** Parse `feature=(allowlist), feature=*` into a Map of feature -> raw allowlist. */
export function parsePermissionsPolicy(value) {
  const map = new Map();
  for (const match of value.matchAll(/([a-z0-9-]+)\s*=\s*(\([^)]*\)|\*|[^,]+)/gi)) {
    map.set(match[1].toLowerCase(), match[2].trim());
  }
  return map;
}

export default {
  id: ID,
  title: 'Permissions policy',
  run({ headers }) {
    const value = headers.get('permissions-policy');
    if (value === undefined) {
      if (headers.has('feature-policy')) {
        return [finding(ID, 'low', 'Only the deprecated Feature-Policy header is set', headers.get('feature-policy'), RECOMMEND)];
      }
      return [finding(ID, 'low', 'Permissions-Policy header missing', '', RECOMMEND)];
    }
    const policy = parsePermissionsPolicy(value);
    const open = SENSITIVE.filter((f) => policy.get(f) === '*' || /\(\s*\*\s*\)/.test(policy.get(f) ?? ''));
    if (open.length) {
      return [finding(ID, 'medium', 'Sensitive browser features are allowed for every origin', open.join(', '), RECOMMEND)];
    }
    return [];
  },
};
