async (page) => {
  // Routing disables the HTTP cache so checks always exercise the saved files.
  await page.route('http://127.0.0.1:4173/**', route => route.continue());
  const paths = ['am-waldrand/anfrage.html', 'blumen-viva/anfrage.html', 'durmus-gebaeudereinigung/anfrage.html', 'gassert/termin.html', 'glanz-und-gloria/termin.html', 'jost-maler/anfrage.html', 'kimberger/termin.html', 'kompass-umzuege/anfrage.html', 'popalpin/anfrage.html', 'rubi/anfrage.html', 'sml-spitzer/anfrage.html', 'spitzer-moden/anfrage.html', 'watson-angelika-coach/kennenlernen.html', 'goldener-hirsch/index.html'];
  const results = [];
  const writes = [];
  const onRequest = (request) => { if (!['GET', 'HEAD'].includes(request.method())) writes.push({ url: request.url(), method: request.method() }); };
  page.on('request', onRequest);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of paths) {
    await page.goto(`http://127.0.0.1:4173/${path}`, { waitUntil: 'networkidle' });
    const form = page.locator('form:has(button[type="submit"])').first();
    const submit = form.locator('button[type="submit"]').first();
    await submit.click();
    const blankRejected = await page.locator('[data-fehler]').evaluate((element) => !element.hidden && !!element.getClientRects().length && !!element.textContent.trim());
    await form.evaluate((element) => {
      const iso = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
      element.querySelectorAll('input, select, textarea').forEach((field) => {
        if (field.disabled || !field.getClientRects().length) return;
        if (field.tagName === 'SELECT') {
          if (!field.value) field.value = [...field.options].find((option) => option.value && !option.disabled)?.value || '';
        } else if (field.type === 'date') field.value = iso(/abreise/.test(field.id) ? 16 : 14);
        else if (field.type === 'email') field.value = 'demo@example.test';
        else if (field.type === 'tel') field.value = '01512345678';
        else if (field.type === 'text') field.value = /zeitraum/.test(field.id) ? '02.–04. Oktober 2027' : /nachname/.test(field.id) ? 'Beispiel' : 'Demo';
        else if (field.type === 'checkbox' && (field.required || field.name === 'demo-ok')) field.checked = true;
        else if (field.type === 'radio' && !element.querySelector(`input[name="${CSS.escape(field.name)}"]:checked`)) field.checked = true;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    const slot = form.locator('.slot:visible').first();
    if (await slot.count()) await slot.click();
    let pastDateRejected = null;
    const date = form.locator('input[type="date"]').first();
    if (await date.count()) {
      const validDate = await date.inputValue();
      await date.fill('2020-01-01');
      await submit.click();
      pastDateRejected = await date.getAttribute('aria-invalid') === 'true' && await form.isVisible();
      await date.fill(validDate);
    }
    await submit.click();
    const outcome = await page.evaluate(() => {
      const visible = (element) => !element.hidden && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
      const confirmations = [...document.querySelectorAll('[data-bestaetigung], [data-bestell-bestaetigung]')].filter(visible);
      const errors = [...document.querySelectorAll('[data-fehler], .demo-field-error')].filter(visible).map((element) => element.textContent.trim()).filter(Boolean);
      return { confirmed: confirmations.length > 0, errors, focused: document.activeElement?.getAttribute('data-bestaetigung') !== null || document.activeElement?.hasAttribute('data-bestell-bestaetigung') };
    });
    results.push({ path, blankRejected, pastDateRejected, ...outcome });
  }
  page.off('request', onRequest);
  return { results, writes };
}
