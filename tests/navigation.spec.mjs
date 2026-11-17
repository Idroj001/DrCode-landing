import { test, expect, gotoReady } from './support/fixtures.mjs';

test.describe('navegación', () => {
  test('el menú móvil abre, cierra con Escape y con un enlace', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page);

    const burger = page.locator('.hamburger');
    await expect(burger).toBeVisible();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');

    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.nav-menu')).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.nav-menu')).not.toHaveClass(/active/);

    await burger.click();
    await page.locator('.nav-menu a[href="#servicios"]').click();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
  });

  test('el scrollspy marca la sección visible', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.nav-link[href="#hero"]')).toHaveClass(/active/);

    await page.locator('#skills').scrollIntoViewIfNeeded();
    await expect(page.locator('.nav-link[href="#skills"]')).toHaveClass(/active/);
    await expect(page.locator('.nav-link[href="#skills"]')).toHaveAttribute('aria-current', 'page');
  });

  test('el CTA de agendar apunta a WhatsApp con mensaje', async ({ page }) => {
    await gotoReady(page);
    const cta = page.locator('.nav-cta');
    const href = await cta.getAttribute('href');
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://wa.me/593999806465');
    expect(url.searchParams.get('text')).toContain('agendar una cita');
  });
});
