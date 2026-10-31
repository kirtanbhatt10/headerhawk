import { VERSION } from '../version.js';

const COLORS = { critical: 35, high: 31, medium: 33, low: 36, info: 90 };
const GRADE_COLORS = { 'A+': 32, A: 32, B: 32, C: 33, D: 33, F: 31 };

function paint(text, code, color) {
  return color ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export function renderText(results, { color = false } = {}) {
  const lines = [`headerhawk ${VERSION}`];
  for (const r of results) {
    lines.push('', paint(r.target ?? r.source ?? 'header input', 1, color));
    if (r.redirects?.length) {
      for (const hop of r.redirects) lines.push(`  ${hop.status} -> ${hop.to}`);
    }
    lines.push(`  Grade ${paint(r.grade, GRADE_COLORS[r.grade], color)} (${r.score}/100)  ${r.findings.length} finding(s), ${r.passed.length} check(s) passed`);
    for (const f of r.findings) {
      lines.push(`  ${paint(f.severity.toUpperCase().padEnd(8), COLORS[f.severity], color)} ${f.check.padEnd(21)} ${f.title}`);
      if (f.detail) lines.push(`  ${' '.repeat(30)} ${f.detail}`);
      if (f.recommendation) lines.push(`  ${' '.repeat(30)} fix: ${f.recommendation}`);
    }
  }
  return lines.join('\n');
}
