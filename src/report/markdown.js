const ICON = { critical: '🟣', high: '🔴', medium: '🟠', low: '🔵', info: '⚪' };

function cell(text) {
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/** Markdown report, handy for PR comments and $GITHUB_STEP_SUMMARY. */
export function renderMarkdown(results) {
  const out = ['# headerhawk report', ''];
  for (const r of results) {
    out.push(`## ${r.target ?? r.source ?? 'header input'} — grade **${r.grade}** (${r.score}/100)`, '');
    if (!r.findings.length) {
      out.push('No findings. ✅', '');
      continue;
    }
    out.push('| Severity | Check | Finding | Fix |', '| --- | --- | --- | --- |');
    for (const f of r.findings) {
      out.push(`| ${ICON[f.severity]} ${f.severity} | \`${f.check}\` | ${cell(f.title)} | ${cell(f.recommendation)} |`);
    }
    out.push('', `Passed: ${r.passed.map((id) => `\`${id}\``).join(', ') || 'none'}`, '');
  }
  return out.join('\n');
}
