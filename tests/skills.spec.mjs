import { test, expect, gotoReady } from './support/fixtures.mjs';

test.describe('carrusel de skills', () => {
  test('genera ocho slides y avanza automáticamente', async ({ page }) => {
    await page.clock.install();
    await gotoReady(page);

    await expect(page.locator('.carousel-slide')).toHaveCount(8);
    await expect(page.locator('.carousel-dot')).toHaveCount(8);
    await expect(page.locator('.carousel-slide.active .carousel-name')).toHaveText('HTML5');
    await expect(page.locator('.carousel-dot.active')).toHaveCount(1);

    await page.clock.fastForward(3600);
    await expect(page.locator('.carousel-slide.active .carousel-name')).toHaveText('CSS3');

    await page.clock.fastForward(3600);
    await expect(page.locator('.carousel-slide.active .carousel-name')).toHaveText('JavaScript');
  });

  test('los puntos se sincronizan con la skill activa', async ({ page }) => {
    await page.clock.install();
    await gotoReady(page);

    await expect(page.locator('.carousel-dot').nth(0)).toHaveClass(/active/);

    await page.clock.fastForward(3600);
    await expect(page.locator('.carousel-dot').nth(0)).not.toHaveClass(/active/);
    await expect(page.locator('.carousel-dot').nth(1)).toHaveClass(/active/);
  });

  test('salta a una skill al hacer clic en su punto', async ({ page }) => {
    await gotoReady(page);

    await page.locator('.carousel-dot').nth(2).click();
    await expect(page.locator('.carousel-slide.active .carousel-name')).toHaveText('JavaScript');
    await expect(page.locator('.carousel-dot').nth(2)).toHaveClass(/active/);
  });

  test('se pausa al pasar el ratón', async ({ page }) => {
    await page.clock.install();
    await gotoReady(page);

    await page.locator('#skills-carousel').hover();
    await page.clock.fastForward(4000);
    await expect(page.locator('.carousel-slide.active .carousel-name')).toHaveText('HTML5');
  });
});
