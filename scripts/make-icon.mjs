/* Genera assets/apple-touch-icon.png (180×180) con el wordmark de la marca.
   Uso: node scripts/make-icon.mjs (necesita red para cargar VT323). */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SIZE = 180;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });

await page.setContent(`
  <style>
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
    html, body { margin: 0; }
    body {
      width: ${SIZE}px;
      height: ${SIZE}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0e110f;
      font-family: 'VT323', 'Courier New', monospace;
      font-size: 44px;
      letter-spacing: 0.02em;
      color: #e8ece9;
      text-shadow: 0 0 12px rgba(57, 255, 117, 0.55);
    }
    .braces { color: #39ff75; }
    .dot { color: #39ff75; }
  </style>
  <div><span class="braces">{</span>Dr<span class="dot">.</span>Code<span class="braces">}</span></div>
`);

await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const buffer = await page.screenshot({ type: 'png' });
await writeFile(join(ROOT, 'assets', 'apple-touch-icon.png'), buffer);

await browser.close();
console.log(`apple-touch-icon.png listo (${(buffer.length / 1024).toFixed(0)} KB)`);
