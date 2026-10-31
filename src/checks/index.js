import contentTypeOptions from './content-type-options.js';
import csp from './csp.js';
import framing from './framing.js';
import hsts from './hsts.js';
import referrerPolicy from './referrer-policy.js';

/** All checks in the order they are reported. */
export const CHECKS = Object.freeze([
  hsts,
  csp,
  framing,
  contentTypeOptions,
  referrerPolicy,
]);
