import { test, expect, gotoReady } from './support/fixtures.mjs';

test.describe('trabajos', () => {
  test('seis proyectos con captura de escritorio y móvil', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.work-card')).toHaveCount(6);
    await expect(page.locator('.work-card .work-frame')).toHaveCount(12);

    // Cada tarjeta arranca en la vista de escritorio
    const pressed = await page
      .locator('.work-switch-btn[data-view="pc"]')
      .evaluateAll(els => els.map(el => el.getAttribute('aria-pressed')));
    expect(pressed).toEqual(Array(6).fill('true'));

    await page.locator('#trabajos').scrollIntoViewIfNeeded();
    const image = page.locator('.work-card').first().locator('.work-frame--pc img');
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test('el selector PC/Móvil cambia la captura visible', async ({ page }) => {
    await gotoReady(page);
    const card = page.locator('.work-card').first();
    const movil = card.locator('.work-switch-btn[data-view="movil"]');

    await movil.click();
    await expect(movil).toHaveAttribute('aria-pressed', 'true');
    await expect(card.locator('.work-switch-btn[data-view="pc"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(card.locator('.work-frame--pc')).toBeHidden();
    await expect(card.locator('.work-frame--movil')).toBeVisible();
    await expect(card.locator('.work-frame--movil img')).toHaveAttribute('src', /-movil\.jpg$/);

    await card.locator('.work-switch-btn[data-view="pc"]').click();
    await expect(card.locator('.work-frame--pc')).toBeVisible();
    await expect(card.locator('.work-frame--movil')).toBeHidden();
  });

  test('solo las cinco demos públicas enlazan y avisa de las pendientes', async ({ page }) => {
    await gotoReady(page);
    const links = page.locator('.work-link[href]');
    await expect(links).toHaveCount(5);

    const hrefs = await links.evaluateAll(els => els.map(el => el.getAttribute('href')));
    expect(hrefs).toEqual([
      'https://idroj001.github.io/DrCode-landing/',
      'https://idroj001.github.io/web-drcode/',
      'https://idroj001.github.io/catalogo-drcode/',
      'https://idroj001.github.io/tarjeta-drcode/',
      'https://idroj001.github.io/web-drcode/calendario.html'
    ]);

    await expect(page.locator('.work-card .work-link--muted')).toHaveCount(1);
    await expect(page.locator('.work-note')).toContainText('demos en preparación');
  });

  test('el menú incluye Trabajos y el scrollspy lo marca', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.nav-link[href="#trabajos"]')).toHaveCount(1);

    await page.locator('#trabajos').scrollIntoViewIfNeeded();
    await expect(page.locator('.nav-link[href="#trabajos"]')).toHaveClass(/active/);
  });
});

test.describe('oferta', () => {
  test('el hero anuncia el precio de lanzamiento y no hay precio anterior', async ({ page }) => {
    await gotoReady(page);
    const note = page.locator('.hero-note');
    await expect(note).toContainText('Precio de lanzamiento');
    await expect(note).toContainText('desde');
    await expect(note).toContainText('$20');

    // La página ya no contrasta con un precio anterior
    await expect(page.locator('body')).not.toContainText('75% OFF');
    await expect(page.locator('body')).not.toContainText('antes $');
  });
});

test.describe('preguntas frecuentes', () => {
  test('seis preguntas plegables que se abren al hacer clic', async ({ page }) => {
    await gotoReady(page);
    const items = page.locator('.faq-item');
    await expect(items).toHaveCount(6);

    const first = items.first();
    expect(await first.evaluate(el => el.open)).toBe(false);

    await first.locator('summary').click();
    expect(await first.evaluate(el => el.open)).toBe(true);
    await expect(first.locator('p')).toBeVisible();
    await expect(first.locator('p')).toContainText('pago único');
  });

  test('el JSON-LD incluye la ficha del negocio y las preguntas', async ({ page }) => {
    await gotoReady(page);
    const blocks = page.locator('script[type="application/ld+json"]');
    await expect(blocks).toHaveCount(2);

    const types = await blocks.evaluateAll(els =>
      els.map(el => JSON.parse(el.textContent)['@type']));
    expect(types).toEqual(['ProfessionalService', 'FAQPage']);
  });
});
