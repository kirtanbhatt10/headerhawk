import { CHECKS } from '../checks/index.js';
import { VERSION } from '../version.js';

const LEVEL = { critical: 'error', high: 'error', medium: 'warning', low: 'note', info: 'note' };

/** SARIF 2.1.0 for GitHub code scanning and other SARIF viewers. */
export function renderSarif(results) {
  const rules = CHECKS.map((c) => ({
    id: c.id,
    name: c.title.replace(/\W+/g, ''),
    shortDescription: { text: c.title },
    helpUri: 'https://github.com/kirtanbhatt10/headerhawk#checks',
  }));
  const sarifResults = results.flatMap((r) =>
    r.findings.map((f) => ({
      ruleId: f.check,
      ruleIndex: rules.findIndex((rule) => rule.id === f.check),
      level: LEVEL[f.severity],
      message: { text: [f.title, f.detail, f.recommendation && `Fix: ${f.recommendation}`].filter(Boolean).join('. ') },
      locations: [{ physicalLocation: { artifactLocation: { uri: r.source ?? r.target ?? 'headers' } } }],
      properties: { severity: f.severity },
    })),
  );
  const sarif = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{ tool: { driver: { name: 'headerhawk', version: VERSION, informationUri: 'https://github.com/kirtanbhatt10/headerhawk', rules } }, results: sarifResults }],
  };
  return JSON.stringify(sarif, null, 2);
}
