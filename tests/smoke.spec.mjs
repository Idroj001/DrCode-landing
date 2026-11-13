import { test, expect, gotoReady } from './support/fixtures.mjs';

test.describe('estructura y tema', () => {
  test('carga la página con header, main y footer', async ({ page }) => {
    await gotoReady(page);
    await expect(page).toHaveTitle(/\{Dr\.Code\}/);
    await expect(page.locator('main#main h1')).toHaveText('Soluciones Digitales para tu Negocio');
    await expect(page.locator('footer .footer-copy')).toContainText('{Dr.Code}');
    await expect(page.locator('#matrix')).toBeVisible();
  });

  test('el toggle cambia el tema y persiste al recargar', async ({ page }) => {
    await gotoReady(page);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.locator('.theme-toggle-float').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.theme-toggle-float')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('drcode_theme'))).toBe('dark');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('la elección guardada gana sobre el tema del sistema', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('drcode_theme', 'light'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoReady(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('el botón de WhatsApp es un enlace con área clicable completa', async ({ page }) => {
    await gotoReady(page);
    const link = page.locator('.whatsapp-float');
    await expect(link).toHaveAttribute('href', 'https://wa.me/593999806465');
    expect(await link.evaluate(el => el.tagName)).toBe('A');
    const box = await link.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('el footer enlaza al email y al catálogo, sin WhatsApp', async ({ page }) => {
    await gotoReady(page);
    const links = page.locator('.social-links a');
    await expect(links).toHaveCount(2);

    const hrefs = await links.evaluateAll(els => els.map(el => el.getAttribute('href')));
    expect(hrefs.some(href => href.includes('wa.me'))).toBe(false);
    expect(hrefs[0]).toContain('mailto:jordy.mh_1994@hotmail.com');
    expect(hrefs[1]).toBe('https://idroj001.github.io/catalogo-drcode/');

    const catalog = links.nth(1);
    await expect(catalog).toHaveAttribute('aria-label', 'Ver catálogo');
    await expect(catalog).toHaveAttribute('target', '_blank');
    await expect(catalog).toHaveAttribute('rel', 'noopener');
  });

  test('los flotantes se detienen antes del footer', async ({ page }) => {
    await gotoReady(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const whatsapp = page.locator('.whatsapp-float');
    const theme = page.locator('.theme-toggle-float');
    await expect(whatsapp).toHaveClass(/float-above/);
    await expect(theme).toHaveClass(/float-above/);

    const whatsappBox = await whatsapp.boundingBox();
    const themeBox = await theme.boundingBox();
    const footerBox = await page.locator('footer').boundingBox();

    expect(Math.round(whatsappBox.y)).toBe(Math.round(themeBox.y));
    expect(Math.round(whatsappBox.y + whatsappBox.height))
      .toBe(Math.round(themeBox.y + themeBox.height));
    expect(Math.round(whatsappBox.y + whatsappBox.height))
      .toBeLessThanOrEqual(Math.round(footerBox.y));
    expect(Math.round(themeBox.y + themeBox.height))
      .toBeLessThanOrEqual(Math.round(footerBox.y));
  });

  test('en móvil los flotantes quedan fuera del footer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoReady(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const whatsapp = await page.locator('.whatsapp-float').boundingBox();
    const theme = await page.locator('.theme-toggle-float').boundingBox();
    const footerBox = await page.locator('footer').boundingBox();

    expect(Math.round(whatsapp.y + whatsapp.height))
      .toBeLessThanOrEqual(Math.round(footerBox.y));
    expect(Math.round(theme.y + theme.height))
      .toBeLessThanOrEqual(Math.round(footerBox.y));
  });

  test('los flotantes no se superponen entre sí en móvil angosto', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoReady(page);

    const whatsapp = await page.locator('.whatsapp-float').boundingBox();
    const theme = await page.locator('.theme-toggle-float').boundingBox();

    expect(Math.round(theme.x + theme.width)).toBeLessThanOrEqual(Math.round(whatsapp.x));
  });

  test('en móvil los íconos sociales quedan a la altura del logo', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoReady(page);

    const logo = await page.locator('.footer-logo').boundingBox();
    const social = await page.locator('.social-links').boundingBox();

    const logoCenter = Math.round(logo.y + logo.height / 2);
    const socialCenter = Math.round(social.y + social.height / 2);
    expect(Math.abs(logoCenter - socialCenter)).toBeLessThanOrEqual(2);
  });
});
