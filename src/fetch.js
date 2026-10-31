import { HeaderSet } from './headers.js';
import { VERSION } from './version.js';

/**
 * Fetch a URL and return the final response's headers plus the redirect chain.
 * Redirects are followed manually so every hop is recorded.
 */
export async function fetchHeaders(url, { timeout = 10000, maxRedirects = 5, userAgent = `headerhawk/${VERSION}` } = {}) {
  const start = new URL(url);
  if (start.protocol !== 'http:' && start.protocol !== 'https:') {
    throw new TypeError(`only http and https URLs are supported: ${url}`);
  }
  const redirects = [];
  let current = start;
  for (;;) {
    let response;
    try {
      response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(timeout),
        headers: { 'user-agent': userAgent, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      });
    } catch (error) {
      const reason = error.name === 'TimeoutError' ? `timed out after ${timeout} ms` : (error.cause?.message ?? error.message);
      throw new Error(`could not fetch ${current.href}: ${reason}`);
    }
    await response.body?.cancel();
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      if (redirects.length >= maxRedirects) throw new Error(`too many redirects (more than ${maxRedirects})`);
      const next = new URL(location, current);
      redirects.push({ from: current.href, to: next.href, status: response.status });
      current = next;
      continue;
    }
    return { url: start.href, finalUrl: current.href, status: response.status, headers: HeaderSet.fromFetch(response.headers), redirects };
  }
}
