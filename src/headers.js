/**
 * A case-insensitive, multi-value collection of response headers.
 * Set-Cookie values are kept separate because they cannot be comma-joined.
 */
export class HeaderSet {
  constructor() {
    this.map = new Map();
  }

  add(name, value) {
    const key = String(name).trim().toLowerCase();
    if (!key) return this;
    const list = this.map.get(key) ?? [];
    list.push(String(value).trim());
    this.map.set(key, list);
    return this;
  }

  has(name) {
    return this.map.has(name.toLowerCase());
  }

  /** All values joined with ", " (how HTTP combines repeated headers). */
  get(name) {
    const values = this.map.get(name.toLowerCase());
    return values ? values.join(', ') : undefined;
  }

  getAll(name) {
    return [...(this.map.get(name.toLowerCase()) ?? [])];
  }

  names() {
    return [...this.map.keys()];
  }

  toObject() {
    return Object.fromEntries([...this.map].map(([k, v]) => [k, v.length === 1 ? v[0] : [...v]]));
  }

  /** Build from a plain object whose values are strings or arrays of strings. */
  static fromObject(object) {
    const set = new HeaderSet();
    for (const [name, value] of Object.entries(object ?? {})) {
      for (const v of Array.isArray(value) ? value : [value]) set.add(name, v);
    }
    return set;
  }

  /** Build from a WHATWG fetch Headers object. */
  static fromFetch(headers) {
    const set = new HeaderSet();
    for (const [name, value] of headers) {
      if (name.toLowerCase() !== 'set-cookie') set.add(name, value);
    }
    for (const cookie of headers.getSetCookie?.() ?? []) set.add('set-cookie', cookie);
    return set;
  }
}

/**
 * Parse a raw header dump such as the output of `curl -sI` or browser devtools.
 * With several responses (e.g. `curl -sIL`), the last one is used.
 * @returns {{status: number|null, headers: HeaderSet}}
 */
export function parseRaw(text) {
  const blocks = String(text).replace(/\r\n?/g, '\n').split(/\n\s*\n/).filter((b) => b.trim());
  const responseBlocks = blocks.filter((b) => /^HTTP\/[\d.]+\s+\d{3}/i.test(b.trimStart()));
  const block = (responseBlocks.length ? responseBlocks.at(-1) : blocks[0]) ?? '';
  const headers = new HeaderSet();
  let status = null;
  let last = null;
  for (const line of block.split('\n')) {
    const statusMatch = line.match(/^HTTP\/[\d.]+\s+(\d{3})/i);
    if (statusMatch) {
      status = Number(statusMatch[1]);
      continue;
    }
    if (/^[ \t]/.test(line) && last) {
      // obsolete line folding: continuation of the previous header
      const values = headers.map.get(last);
      values[values.length - 1] += ` ${line.trim()}`;
      continue;
    }
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    last = line.slice(0, idx).trim().toLowerCase();
    headers.add(last, line.slice(idx + 1));
  }
  return { status, headers };
}
