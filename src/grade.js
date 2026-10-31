export const PENALTY = Object.freeze({ critical: 40, high: 20, medium: 10, low: 4, info: 0 });
export const GRADES = Object.freeze(['F', 'D', 'C', 'B', 'A', 'A+']);

/** 100 minus severity penalties, never below 0. */
export function score(findings) {
  return Math.max(0, 100 - findings.reduce((sum, f) => sum + PENALTY[f.severity], 0));
}

/** Letter grade for a score. A+ is reserved for a perfect 100. */
export function grade(value) {
  if (value >= 100) return 'A+';
  if (value >= 90) return 'A';
  if (value >= 80) return 'B';
  if (value >= 70) return 'C';
  if (value >= 60) return 'D';
  return 'F';
}

/** True if `actual` is the same as or better than `minimum`. */
export function meetsGrade(actual, minimum) {
  const a = GRADES.indexOf(actual);
  const m = GRADES.indexOf(String(minimum).toUpperCase());
  if (m === -1) throw new RangeError(`unknown grade: ${minimum}`);
  return a >= m;
}
