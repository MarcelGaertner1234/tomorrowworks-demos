async (page) => {
  // Routing disables the HTTP cache so checks always exercise the saved files.
  await page.route('http://127.0.0.1:4173/**', route => route.continue());
  const demos = ['am-waldrand', 'blumen-viva', 'clean-cut', 'durmus-gebaeudereinigung', 'gassert', 'glanz-und-gloria', 'goldener-hirsch', 'jost-maler', 'kimberger', 'kompass-umzuege', 'mos-kebab', 'popalpin', 'rubi', 'sml-spitzer', 'spitzer-moden', 'watson-angelika-coach'];
  const results = [];
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on('pageerror', onError);
  for (const name of demos) {
    errors.length = 0;
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`http://127.0.0.1:4173/${name}/`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
    });
    const desktop = await page.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      brokenImages: [...document.images].filter((image) => !image.naturalWidth).map((image) => image.getAttribute('src')),
      robots: document.querySelector('meta[name="robots"]')?.content,
    }));

    const widths = [];
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      widths.push(await page.evaluate(() => ({
        width: innerWidth,
        overflow: document.documentElement.scrollWidth - innerWidth,
        navReachable: [...document.querySelectorAll('nav[aria-label="Hauptnavigation"] a')].some((link) => link.getClientRects().length) || !!document.querySelector('.demo-menu-toggle')?.getClientRects().length,
      })));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('.demo-menu-toggle');
    await menu.click();
    const open = await page.locator('[data-demo-nav]').isVisible();
    const mobileLinks = await page.locator('[data-demo-nav] a:visible').count();
    await page.keyboard.press('Escape');
    const closed = !(await page.locator('[data-demo-nav]').isVisible());
    const focusReturned = await menu.evaluate((element) => document.activeElement === element);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    results.push({ name, desktop, widths, menu: { open, closed, focusReturned, mobileLinks }, errors: [...errors] });
  }
  page.off('pageerror', onError);
  return results;
}
