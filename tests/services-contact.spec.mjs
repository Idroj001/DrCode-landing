import { test, expect, gotoReady, openedWhatsAppText } from './support/fixtures.mjs';

test.describe('servicios', () => {
  test('cuatro paneles terminal con once servicios sin enlaces', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.term-panel')).toHaveCount(4);
    await expect(page.locator('.term-panel--wide')).toHaveCount(2);
    await expect(page.locator('.term-panel--single')).toHaveCount(2);
    await expect(page.locator('.term-item')).toHaveCount(9);
    await expect(page.locator('.term-price')).toHaveCount(11);
    await expect(page.locator('.term-badge')).toHaveCount(4);

    // Los servicios y los títulos no navegan: solo el botón final enlaza al catálogo
    await expect(page.locator('.term-panels a')).toHaveCount(0);
    const itemTags = await page.locator('.term-item').evaluateAll(els => els.map(el => el.tagName));
    for (const tag of itemTags) expect(tag).toBe('DIV');
    const titleTags = await page.locator('.term-caption-title').evaluateAll(els => els.map(el => el.tagName));
    for (const tag of titleTags) expect(tag).toBe('SPAN');
  });

  test('en móvil los nombres de servicio se leen completos', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page);

    const clipped = await page.locator('.term-name').evaluateAll(els =>
      els.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
    expect(clipped).toEqual([]);

    // Se oculta la flecha para ganar ancho, pero el precio anterior sigue a la vista
    await expect(page.locator('.term-price-old').first()).toBeVisible();
    await expect(page.locator('.term-price-arrow').first()).toBeHidden();
  });

  test('cada línea muestra el precio anterior tachado y el precio final', async ({ page }) => {
    await gotoReady(page);
    const tarjeta = page.locator('.term-item').filter({ hasText: 'tarjeta-digital' });
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).toContainText('$20');
    await expect(tarjeta.locator('.term-price-old')).toHaveText('$80');

    const prices = await page.locator('.term-price').allTextContents();
    expect(prices).toHaveLength(11);
    for (const price of prices) {
      expect(price).toMatch(/^\$\d+$/);
    }

    // 75% de descuento: el precio anterior siempre es 4x el final
    const old = await page.locator('.term-price-old').allTextContents();
    expect(old).toHaveLength(11);
    old.forEach((text, index) => {
      expect(Number(text.slice(1))).toBe(Number(prices[index].slice(1)) * 4);
    });

    const crossed = await page.locator('.term-price-old').first().evaluate(el =>
      getComputedStyle(el).textDecorationLine);
    expect(crossed).toBe('line-through');
  });

  test('cada servicio tiene un botón + que abre y minimiza sus detalles', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.term-toggle')).toHaveCount(11);
    await expect(page.locator('.term-more')).toHaveCount(11);
    await expect(page.locator('.term-more:visible')).toHaveCount(0);

    const toggle = page.locator('.term-toggle[aria-controls="svc-landing"]');
    const details = page.locator('#svc-landing');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(details).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(details).toBeVisible();
    await expect(details).toContainText('Una sola página');
    await expect(details).toContainText('Precio fijo');
    await expect(details).not.toContainText('extras');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(details).toBeHidden();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(details).toBeVisible();

    const chatbot = page.locator('.term-toggle[aria-controls="svc-chatbot"]');
    await chatbot.click();
    await expect(page.locator('#svc-chatbot')).toBeVisible();
    await expect(page.locator('#svc-chatbot')).toContainText('24 horas');
  });

  test('los servicios no tienen enlaces salientes', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.term-panels a')).toHaveCount(0);
    await expect(page.locator('#servicios a')).toHaveCount(0);
    await expect(page.locator('.term-cta')).toHaveCount(0);
    await expect(page.locator('.term-badge').first()).toHaveText('LANZAMIENTO 75% OFF');
  });

  test('el bloque de qué incluye el precio tiene cinco puntos', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.includes-title')).toHaveText('¿Qué incluye el precio?');
    await expect(page.locator('.includes-list li')).toHaveCount(5);
    await expect(page.locator('.includes-list')).toContainText('enviados a tu correo');
    await expect(page.locator('.includes-list')).toContainText('sin mensualidades');
    await expect(page.locator('.includes-list')).toContainText('Dominio propio opcional');
  });
});

test.describe('contacto', () => {
  test('muestra errores visibles al enviar vacío', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#contactForm button[type="submit"]').click();

    await expect(page.locator('.form-group.has-error').first()).toBeVisible();
    await expect(page.locator('.field-error').first()).toBeVisible();
    await expect(page.locator('#name')).toBeFocused();

    // Mensaje en español y campo asociado al error para lectores de pantalla
    await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#name')).toHaveAttribute('aria-describedby', 'name-error');
    await expect(page.locator('#name-error')).toHaveText(/Escribe tu nombre/);

    // En error el destello verde se oculta para que mande el rojo
    const shine = await page.locator('.form-group.has-error .field-frame').first().evaluate(el =>
      getComputedStyle(el, '::before').display);
    expect(shine).toBe('none');

    await page.fill('#name', 'Ana Torres');
    await expect(page.locator('#name')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('.field-error')).toHaveCount(0);
  });

  test('valida el correo y el teléfono con mensajes en español', async ({ page }) => {
    await gotoReady(page);
    await page.fill('#name', 'Ana Torres');
    await page.fill('#email', 'no-es-un-correo');
    await page.fill('#phone', 'abc');
    await page.locator('#contactForm button[type="submit"]').click();

    await expect(page.locator('#email-error')).toHaveText(/correo válido/);
    await expect(page.locator('#phone-error')).toHaveText(/solo números/);
  });

  test('envía la solicitud a WhatsApp con el servicio elegido', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('#service option')).toHaveCount(13);
    await page.fill('#name', 'Ana Torres');
    await page.fill('#email', 'ana@example.com');
    await page.fill('#phone', '0999999999');
    await page.selectOption('#service', 'catalogo');
    await page.fill('#message', 'Necesito un catálogo.');
    await page.locator('#contactForm button[type="submit"]').click();

    const text = await openedWhatsAppText(page);
    expect(text).toContain('*Nombre:* Ana Torres');
    expect(text).toContain('*Email:* ana@example.com');
    expect(text).toContain('*Servicio:* Catálogo WhatsApp');
    expect(text).toContain('*Mensaje:* Necesito un catálogo.');
    await expect(page.locator('.toast')).toContainText('WhatsApp');
  });
});
