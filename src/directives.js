/**
 * Parse a semicolon-separated header like CSP or HSTS into a Map of
 * lower-cased directive name -> array of values (first occurrence wins).
 */
export function parseDirectives(value) {
  const directives = new Map();
  for (const part of String(value ?? '').split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;
    const name = tokens[0].toLowerCase();
    if (!directives.has(name)) directives.set(name, tokens.slice(1));
  }
  return directives;
}
