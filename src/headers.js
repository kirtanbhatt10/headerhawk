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
