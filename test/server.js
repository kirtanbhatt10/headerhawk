import { createServer } from 'node:http';

/** Start a throwaway HTTP server with a few routes for fetch tests. */
export async function startServer() {
  const server = createServer((req, res) => {
    if (req.url === '/redirect') {
      res.writeHead(301, { Location: '/final' });
      return res.end();
    }
    if (req.url === '/loop') {
      res.writeHead(302, { Location: '/loop' });
      return res.end();
    }
    if (req.url === '/slow') {
      setTimeout(() => res.end('late'), 500);
      return;
    }
    res.setHeader('Set-Cookie', ['a=1; HttpOnly', 'b=2; SameSite=Lax']);
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>ok</h1>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((resolve) => server.close(resolve)) };
}
