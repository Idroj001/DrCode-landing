import { test, expect, gotoReady, openedWhatsAppText } from './support/fixtures.mjs';

test.describe('servicios', () => {
  test('hay seis servicios con vista previa', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.service-card--detailed')).toHaveCount(6);
    // 6 de servicios + 3 de la sección de proyectos reales
    await expect(page.locator('.service-preview img')).toHaveCount(9);
    await expect(page.locator('.project-card')).toHaveCount(3);
  });

  test('Solicitar preselecciona el servicio y lleva al formulario', async ({ page }) => {
    await gotoReady(page);
    await page.locator('[data-service="menu"]').click();

    await expect(page.locator('#service')).toHaveValue('menu');
    await expect(page.locator('#name')).toBeFocused();
    await expect(page.locator('#contacto')).toBeInViewport({ ratio: 0.1 });
  });
});

test.describe('contacto', () => {
  test('muestra errores visibles al enviar vacío', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#contactForm button[type="submit"]').click();

    await expect(page.locator('.form-group.has-error').first()).toBeVisible();
    await expect(page.locator('.field-error').first()).toBeVisible();
    await expect(page.locator('#name')).toBeFocused();
  });

  test('envía la solicitud a WhatsApp con el servicio elegido', async ({ page }) => {
    await gotoReady(page);
    await page.fill('#name', 'Ana Torres');
    await page.fill('#email', 'ana@example.com');
    await page.fill('#phone', '0999999999');
    await page.selectOption('#service', 'web');
    await page.fill('#message', 'Necesito una página web.');
    await page.locator('#contactForm button[type="submit"]').click();

    const text = await openedWhatsAppText(page);
    expect(text).toContain('*Nombre:* Ana Torres');
    expect(text).toContain('*Email:* ana@example.com');
    expect(text).toContain('*Servicio:* Página Web');
    expect(text).toContain('*Mensaje:* Necesito una página web.');
    await expect(page.locator('.toast')).toContainText('WhatsApp');
  });
});
