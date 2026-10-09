import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { apiRouter } from './api.js';

const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  if (new URL(req.url, 'http://localhost').pathname.startsWith('/api/')) {
    return apiRouter(req, res, () => { res.statusCode = 404; res.end('Nicht gefunden'); });
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; res.end(); return; }
  try {
    let file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + sep)) { res.statusCode = 403; res.end(); return; }
    if (!(await stat(file).catch(() => null))?.isFile()) file = resolve(root, 'index.html');
    const content = await readFile(file);
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.statusCode = 404; res.end('Bitte zuerst npm run build ausführen.'); }
});
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Port. production server ready'));
