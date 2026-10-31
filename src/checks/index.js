import contentTypeOptions from './content-type-options.js';
import cookies from './cookies.js';
import crossOrigin from './cross-origin.js';
import csp from './csp.js';
import framing from './framing.js';
import hsts from './hsts.js';
import permissionsPolicy from './permissions-policy.js';
import referrerPolicy from './referrer-policy.js';

/** All checks in the order they are reported. */
export const CHECKS = Object.freeze([
  hsts,
  csp,
  framing,
  contentTypeOptions,
  referrerPolicy,
  permissionsPolicy,
  crossOrigin,
  cookies,
]);
