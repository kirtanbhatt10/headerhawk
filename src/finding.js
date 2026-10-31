/** Severity levels, lowest to highest. */
export const SEVERITY = Object.freeze({ info: 0, low: 1, medium: 2, high: 3, critical: 4 });
export const SEVERITIES = Object.freeze(Object.keys(SEVERITY));

/**
 * Create a finding.
 * @param {string} check id of the check that produced it
 * @param {'info'|'low'|'medium'|'high'|'critical'} severity
 * @param {string} title one-line summary
 * @param {string} [detail] what was observed
 * @param {string} [recommendation] how to fix it
 */
export function finding(check, severity, title, detail = '', recommendation = '') {
  if (!(severity in SEVERITY)) {
    throw new TypeError(`unknown severity: ${severity}`);
  }
  return { check, severity, title, detail, recommendation };
}

/** Sort comparator: most severe first, then by check id. */
export function compareFindings(a, b) {
  return SEVERITY[b.severity] - SEVERITY[a.severity] || a.check.localeCompare(b.check);
}
