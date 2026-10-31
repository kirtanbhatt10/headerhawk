// Minimal Express middleware that sets the headers headerhawk checks for,
// without any dependency other than Express itself.
export function securityHeaders(req, res, next) {
  res.set({
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  });
  res.removeHeader('X-Powered-By');
  next();
}

// Session cookies that pass the cookies check:
// res.cookie('__Host-session', token, { secure: true, httpOnly: true, sameSite: 'lax', path: '/' });
