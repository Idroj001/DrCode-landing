import { test, expect, gotoReady } from './support/fixtures.mjs';

test.describe('demostraciones', () => {
  test('seis tarjetas muestran solo la información por defecto', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.work-card')).toHaveCount(6);
    await expect(page.locator('.work-card img')).toHaveCount(0);
    await expect(page.locator('.work-demo')).toHaveCount(6);
    await expect(page.locator('.work-demo').first()).toHaveText('Vista previa');
    await expect(page.locator('.work-demo[aria-expanded="false"]')).toHaveCount(6);
    await expect(page.locator('.work-modal')).toBeHidden();
    await expect(page.locator('.work-link[href]')).toHaveCount(5);
  });

  test('en escritorio la grilla es angosta y el contenido va centrado', async ({ page }) => {
    await gotoReady(page);

    const grid = await page.locator('.work-grid').evaluate(el => {
      const style = getComputedStyle(el);
      return {
        columns: style.gridTemplateColumns.split(' ').length,
        gap: parseFloat(style.columnGap),
        width: el.getBoundingClientRect().width,
      };
    });
    expect(grid.columns).toBe(2);
    expect(grid.gap).toBeGreaterThanOrEqual(30);
    expect(grid.width).toBeLessThanOrEqual(900.5);

    await expect(page.locator('.work-body').first()).toHaveCSS('text-align', 'center');

    const actions = await page.locator('.work-actions').first().evaluate(el => {
      const box = el.getBoundingClientRect();
      const demo = el.querySelector('.work-demo').getBoundingClientRect();
      const link = el.querySelector('.work-link').getBoundingClientRect();
      return {
        justify: getComputedStyle(el).justifyContent,
        leftGap: demo.left - box.left,
        rightGap: box.right - link.right,
      };
    });
    expect(actions.justify).toBe('space-between');
    expect(actions.leftGap).toBeLessThan(2);
    expect(actions.rightGap).toBeLessThan(2);
  });

  test('«Vista previa» abre la captura y el clic sobre ella no la cierra', async ({ page }) => {
    await gotoReady(page);
    const card = page.locator('.work-card').first();
    const button = card.locator('.work-demo');
    const modal = page.locator('.work-modal');

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(modal).toBeHidden();

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.work-modal-close')).toBeFocused();

    const image = modal.locator('.work-modal-img--pc');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', /landing-pc\.jpg$/);
    await expect(image).toHaveAttribute('alt', 'Landing page en escritorio');
    await expect(modal.locator('.work-modal-img--movil')).toBeHidden();

    // La X es el único elemento enfocable: el Tab no escapa del diálogo
    const close = modal.locator('.work-modal-close');
    await expect(close).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();

    // La captura no cierra el visor: solo la X, Escape o el fondo
    await image.click();
    await expect(modal).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await close.click();
    await expect(modal).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('el visor cierra con la X, con Escape y con el fondo', async ({ page }) => {
    await gotoReady(page);
    const button = page.locator('.work-card').first().locator('.work-demo');
    const modal = page.locator('.work-modal');

    await button.click();
    await expect(modal).toBeVisible();
    await modal.locator('.work-modal-close').click();
    await expect(modal).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await page.mouse.click(8, 8);
    await expect(modal).toBeHidden();
    await expect(button).toBeFocused();

    // La tecla Escape también cierra con el foco dentro del diálogo
    await button.click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('la captura del visor sigue al viewport', async ({ page }) => {
    await gotoReady(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.work-card').first().locator('.work-demo').click();

    const modal = page.locator('.work-modal');
    const pc = modal.locator('.work-modal-img--pc');
    const movil = modal.locator('.work-modal-img--movil');
    await expect(modal).toBeVisible();
    await expect(movil).toBeVisible();
    await expect(movil).toHaveAttribute('src', /landing-movil\.jpg$/);
    await expect(pc).toBeHidden();

    const box = await movil.boundingBox();
    expect(box.width).toBeLessThanOrEqual(390);
    expect(box.height).toBeLessThanOrEqual(844);
  });

  test('el destello enmarca el texto y no la captura', async ({ page }) => {
    await gotoReady(page);
    const card = page.locator('.work-card').first();

    // El artículo ya no es la tarjeta: no tiene borde ni destello propios
    const wrapper = await card.evaluate(el => ({
      border: getComputedStyle(el).borderTopWidth,
      before: getComputedStyle(el, '::before').content,
    }));
    expect(wrapper.border).toBe('0px');
    expect(wrapper.before).toBe('none');

    // El marco del bloque de texto sí gira, y más despacio que el resto
    const body = await card.locator('.work-body').evaluate(el => {
      const style = getComputedStyle(el, '::before');
      return {
        name: style.animationName,
        duration: style.animationDuration,
        mask: style.maskComposite || style.webkitMaskComposite,
      };
    });
    expect(body.name).toBe('card-shine');
    expect(body.duration).toBe('8s');
    expect(body.mask).toMatch(/exclude|xor/);

    const delays = await page
      .locator('.work-body')
      .evaluateAll(els => els.map(el => getComputedStyle(el, '::before').animationDelay));
    expect(new Set(delays).size).toBe(6);
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

    await expect(links.first()).toHaveText(/Visitar sitio/);
    await expect(page.locator('.work-card .work-link--muted')).toHaveCount(1);
    await expect(page.locator('.work-note')).toContainText('demos en preparación');
  });

  test('el menú incluye Demostraciones y el scrollspy lo marca', async ({ page }) => {
    await gotoReady(page);
    const link = page.locator('.nav-link[href="#demostraciones"]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText('Demostraciones');

    await page.locator('#demostraciones').scrollIntoViewIfNeeded();
    await expect(link).toHaveClass(/active/);
  });
});

test.describe('oferta', () => {
  test('el hero anuncia el precio de lanzamiento y el descuento es visible', async ({ page }) => {
    await gotoReady(page);
    const note = page.locator('.hero-note');
    await expect(note).toContainText('Precio de lanzamiento');
    await expect(note).toContainText('desde');
    await expect(note).toContainText('$20');

    // El 75% vive en el badge y en el precio tachado, no en un botón al catálogo
    await expect(page.locator('.term-badge').first()).toHaveText('LANZAMIENTO 75% OFF');
    await expect(page.locator('.term-price-old')).toHaveCount(11);
    await expect(page.locator('.term-cta')).toHaveCount(0);
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
