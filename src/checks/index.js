import csp from './csp.js';
import hsts from './hsts.js';

/** All checks in the order they are reported. */
export const CHECKS = Object.freeze([
  hsts,
  csp,
]);
