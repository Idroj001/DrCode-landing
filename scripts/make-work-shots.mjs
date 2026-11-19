/* Genera las capturas de escritorio y móvil de la sección "Trabajos".
   Uso: node scripts/make-work-shots.mjs
   Levanta un servidor local por cada repo, captura con Chromium y reduce
   las imágenes a JPEG para no inflar el peso de la página. */

import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const LANDING = fileURLToPath(new URL('../', import.meta.url));
const WORKSPACE = fileURLToPath(new URL('../../', import.meta.url));
const OUT_DIR = join(LANDING, 'assets', 'trabajos');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Una entrada por captura: nombre del archivo, repo que se sirve y página.
const SITES = [
  { name: 'landing', root: LANDING, page: 'index.html', port: 4281, hideFloats: true },
  { name: 'web', root: join(WORKSPACE, 'web'), page: 'servicios.html', port: 4282, hideFloats: true },
  { name: 'agenda', root: join(WORKSPACE, 'web'), page: 'calendario.html', port: 4283, hideFloats: true },
  { name: 'catalogo', root: join(WORKSPACE, 'catalogo'), page: 'index.html', port: 4284 },
  { name: 'tarjeta', root: join(WORKSPACE, 'tarjeta'), page: 'index.html', port: 4285 },
  {
    name: 'dashboard',
    root: join(WORKSPACE, 'Dashboard'),
    page: 'dashboard.html',
    port: 4286,
    seed: () => localStorage.setItem('drcode_dashboard_v1', JSON.stringify({
      view: 'herramientas',
      tools: { selected: ['web', 'landing'], clientName: '', businessName: '', salesMessage: '' },
    })),
  },
];

// Las capturas se muestran a 800×500 (escritorio) y 300×650 (móvil).
const DEVICES = [
  { suffix: 'pc', viewport: { width: 1280, height: 800 }, target: { width: 800, height: 500 } },
  { suffix: 'movil', viewport: { width: 390, height: 844 }, target: { width: 300, height: 650 }, mobile: true },
];

function serve(root, port) {
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = normalize(join(root, rel));
    const relToRoot = relative(root, file);

    if (relToRoot.startsWith('..') || isAbsolute(relToRoot)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function shrink(browser, buffer, { width, height }) {
  const page = await browser.newPage();
  const src = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  const dataUrl = await page.evaluate(async ({ src, width, height }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.82);
  }, { src, width, height });
  await page.close();
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function capture(browser, site, url, device) {
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    isMobile: Boolean(device.mobile),
    hasTouch: Boolean(device.mobile),
  });
  const page = await context.newPage();

  // Todos los repos comparten la clave de tema; el Dashboard es oscuro por defecto.
  await page.addInitScript((seedSource) => {
    try {
      localStorage.setItem('drcode_theme', 'dark');
      localStorage.removeItem('drcode_cart');
      if (seedSource) new Function(`return (${seedSource})`)()();
    } catch {}
  }, site.seed ? site.seed.toString() : '');

  await page.goto(url, { waitUntil: 'load', timeout: 45000 });

  if (site.hideFloats) {
    await page.addStyleTag({ content: '.whatsapp-float, .theme-toggle-float { display: none !important; }' });
  }

  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  // Margen para que terminen las animaciones de entrada y el canvas matrix.
  await page.waitForTimeout(1500);

  const raw = await page.screenshot({ type: 'jpeg', quality: 92 });
  await context.close();
  return shrink(browser, raw, device.target);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const servers = [];
  for (const site of SITES) {
    servers.push(await serve(site.root, site.port));
  }

  const browser = await chromium.launch();

  try {
    for (const site of SITES) {
      for (const device of DEVICES) {
        const url = `http://127.0.0.1:${site.port}/${site.page}`;
        const file = join(OUT_DIR, `${site.name}-${device.suffix}.jpg`);
        const buffer = await capture(browser, site, url, device);
        await writeFile(file, buffer);
        console.log(`${site.name}-${device.suffix}.jpg  ${(buffer.length / 1024).toFixed(0)} KB`);
      }
    }
  } finally {
    await browser.close();
    for (const server of servers) server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
