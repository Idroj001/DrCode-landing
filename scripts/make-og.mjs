// Genera assets/og-image.png (1200x630) para previews en redes sociales.
// Uso: node scripts/make-og.mjs  (requiere chromium de Playwright instalado)
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=VT323&display=swap">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: 'VT323', 'Courier New', monospace;
    background: radial-gradient(ellipse at 50% 120%, #10150f 0%, #0e110f 55%, #090b0a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .cols {
    position: absolute; inset: 0;
    display: flex; justify-content: space-between;
    padding: 0 40px; opacity: 0.14;
    font-size: 22px; line-height: 1.15; letter-spacing: 2px;
    color: #39ff75;
    pointer-events: none;
  }
  .cols div { white-space: pre; }
  .brand {
    font-size: 150px;
    letter-spacing: 0.05em;
    z-index: 1;
  }
  .brand .braces { color: #39ff75; text-shadow: 0 0 30px rgba(57, 255, 117, 0.8); }
  .brand .text { color: #e8ece9; }
  .brand .dot { color: #39ff75; text-shadow: 0 0 30px rgba(57, 255, 117, 0.8); }
  .tagline {
    font-size: 52px;
    color: #bcc5bf;
    letter-spacing: 0.05em;
    margin-top: 0.5rem;
    z-index: 1;
  }
  .tags {
    display: flex; gap: 1rem; margin-top: 2.2rem; z-index: 1;
  }
  .tags span {
    font-size: 28px;
    color: #39ff75;
    border: 2px solid rgba(57, 255, 117, 0.45);
    border-radius: 0.5rem;
    padding: 0.2rem 1rem;
    background: rgba(57, 255, 117, 0.07);
  }
</style>
</head>
<body>
  <div class="cols" aria-hidden="true"><div>10110
01101
11010
00111
10101</div><div>01001
10110
01101
10011
01010</div><div>11010
00101
01011
10100
01110</div><div>00111
11010
10001
01101
00010</div><div>10101
01011
11001
00101
10110</div><div>01101
10010
01010
10111
00101</div></div>
  <div class="brand"><span class="braces">{</span><span class="text">Dr</span><span class="dot">.</span><span class="text">Code</span><span class="braces">}</span></div>
  <div class="tagline">Soluciones Digitales para tu Negocio</div>
  <div class="tags"><span>webs</span><span>landings</span><span>carritos</span><span>automatización</span></div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'assets', 'og-image.png') });
await browser.close();
console.log('og-image.png generado');
