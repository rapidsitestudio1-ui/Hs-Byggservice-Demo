/** Minimal statisk server for lokal granskning:  npm run serve */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8'
};

// Servern binds till loopback nedan – den ska bara na den egna datorn.
http.createServer(async (req, res) => {
  // Netlify svarar 405 pa POST nar Forms inte ar aktiverat. Vi gor likadant
  // lokalt sa att formularets felhantering gar att testa pa riktigt.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('405 – formularinlamning hanteras av Netlify Forms i produktion');
    return;
  }
  try {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    // path.resolve + relativ kontroll: enbart startsWith(ROOT) slapper igenom
    // syskonmappar som delar namnprefix med ROOT.
    const file = path.resolve(ROOT, '.' + rel);
    const inne = path.relative(ROOT, file);
    if (inne.startsWith('..') || path.isAbsolute(inne)) { res.writeHead(403).end(); return; }
    await stat(file);
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
  }
}).listen(PORT, '127.0.0.1', () => console.log('http://localhost:' + PORT));
