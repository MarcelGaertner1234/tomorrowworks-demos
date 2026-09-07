async (page) => {
  // Routing disables the HTTP cache so checks always exercise the saved files.
  await page.route('http://127.0.0.1:4173/**', route => route.continue());
  const results = [], writes = [], errors = [];
  const request = r => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url()); };
  const pageerror = e => errors.push(e.message);
  page.on('request', request); page.on('pageerror', pageerror);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  const goto = path => page.goto(`http://127.0.0.1:4173/${path}`, {waitUntil:'networkidle'});
  const assert = (condition, label) => { if (!condition) throw Error(label); };
  const run = async (name, fn) => { try { await fn(); results.push({name,pass:true}); } catch(e) { results.push({name,pass:false,error:e.message}); } };
  const date = offset => { const d=new Date(); d.setDate(d.getDate()+offset); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  await run('Clean Cut: konkrete Uhrzeit erforderlich, Bestätigung und Belegung', async () => {
    await goto('clean-cut/termin.html');
    await page.locator('[data-day="Dienstag"]').click();
    await page.locator('[data-time="09:30"]').click();
    await page.locator('#vorname').fill('Demo'); await page.locator('#nachname').fill('Beispiel'); await page.locator('#handy').fill('01512345678');
    assert(await page.locator('[data-confirm]').isDisabled(),'Abschluss ohne Uhrzeit möglich');
    const slot=page.locator('[data-slot][aria-pressed="false"]').first(); const time=await slot.getAttribute('data-slot');
    await slot.click(); await page.locator('[data-confirm]').click();
    assert(await page.locator('[data-confirm-panel]').isVisible(),'Keine Bestätigung');
    assert((await page.locator('[data-sum-code]').innerText()).includes('B-11'),'Kein Buchungscode');
    assert(await page.locator(`[data-slot="${time}"]`).getAttribute('aria-disabled')==='true','Slot bleibt frei');
  });
  await run('MOS: Mengen ändern, Abholzeit, Pflichtfelder, Bestätigung', async () => {
    await goto('mos-kebab/');
    await page.locator('[data-warenkorb-plus]').first().click();
    await page.locator('[data-warenkorb-toggle]').click();
    await page.locator('[data-warenkorb-plus-zeile]').click();
    assert((await page.locator('[data-warenkorb-anzahl]').innerText()).includes('2'),'Menge 2 fehlt');
    await page.locator('[data-warenkorb-minus]').click();
    assert((await page.locator('[data-warenkorb-anzahl]').innerText()).includes('1'),'Menge 1 fehlt');
    await page.locator('[data-warenkorb-abschliessen]').click();
    await page.locator('[data-flow-slots] .slot-pille').first().click();
    await page.locator('[data-flow-weiter]').click();
    assert(await page.locator('[data-flow-fehler]').isVisible(),'Leerer Kontakt angenommen');
    await page.locator('[name="flow-name"]').fill('Demo Beispiel'); await page.locator('[name="flow-telefon"]').fill('01512345678');
    await page.locator('[data-flow-weiter]').click();
    assert(await page.locator('[data-flow-bestaetigung]').isVisible(),'Keine Bestätigung');
    assert((await page.locator('[data-flow-artikel]').innerText()).includes('Döner'),'Artikel fehlt');
    assert((await page.locator('[data-flow-zeit]').innerText()).includes('17:00'),'Abholzeit fehlt');
  });
  await run('Spitzer: Tastatur-Tab, Produkt, Größe, Menge, Warenkorb, Abschluss', async () => {
    await goto('spitzer-moden/shop.html');
    await page.locator('[data-bereich="damen"]').focus(); await page.keyboard.press('ArrowRight');
    assert(await page.locator('[data-bereich="herren"]').getAttribute('aria-selected')==='true','Bereichwechsel fehlt');
    await page.locator('.produkt-kachel-btn').first().click();
    const name=await page.locator('#produkt-detail-name').innerText();
    await page.locator('[name="produkt-groesse"]').nth(1).check();
    const size=await page.locator('[name="produkt-groesse"]:checked').inputValue();
    await page.locator('#produkt-detail-menge-select').selectOption('2');
    await page.locator('#produkt-detail-hinzufuegen').click();
    assert(await page.locator('#warenkorb-zaehler').innerText()==='2','Warenkorbmenge falsch');
    await goto('spitzer-moden/warenkorb.html');
    assert((await page.locator('#warenkorb-liste').innerText()).includes(name),'Artikel nicht übertragen');
    const submit=page.locator('#warenkorb-form button[type="submit"]');
    await submit.click(); assert(await page.locator('[data-fehler]').isVisible(),'Leerer Kontakt angenommen');
    await page.locator('#vorname').fill('Demo'); await page.locator('#nachname').fill('Beispiel'); await page.locator('#telefon').fill('01512345678');
    await submit.click();
    assert(await page.locator('[data-bestaetigung]').isVisible(),'Keine Bestätigung');
    const items=await page.locator('[data-bestell-artikel]').innerText();
    assert(items.includes(name)&&items.includes(size)&&items.includes('Menge 2'),'Auswahl fehlt in Bestätigung');
  });
  await run('Goldener Hirsch: Preis, Datumsgrenzen, Anfrage, Bearbeiten', async () => {
    await goto('goldener-hirsch/');
    await page.locator('[data-planer-anreise]').fill(date(14)); await page.locator('[data-planer-abreise]').fill(date(16));
    const price=await page.locator('[data-planer-rechnung]').innerText();
    assert(price.includes('158')&&price.includes('Frühstück inklusive'),'Preis oder Frühstück falsch: '+price);
    await page.locator('[data-planer-anreise]').fill('2020-01-01');
    assert(await page.locator('[data-planer-cta]').getAttribute('aria-disabled')==='true','Vergangene Anreise angenommen');
    await page.locator('[data-planer-anreise]').fill(date(14));
    await page.locator('[data-planer-cta]').click();
    const period=await page.locator('#anfrage-zeitraum').inputValue(); assert(period.length>10,'Zeitraum fehlt');
    await page.locator('#anfrage-name').fill('Demo Beispiel'); await page.locator('#anfrage-email').fill('demo@example.test');
    await page.locator('[data-hotel-form] button[type="submit"]').click();
    assert((await page.locator('[data-zusammenfassung]').innerText()).includes(period),'Zeitraum fehlt in Vorschau');
    await page.locator('[data-hotel-bearbeiten]').click();
    assert(await page.locator('#anfrage-zeitraum').inputValue()===period,'Bearbeiten verliert Auswahl');
  });
  await run('Blumen: Straußkonfigurator überträgt alle Wünsche', async () => {
    await goto('blumen-viva/');
    for(const s of ['[data-konf-anlass="hochzeit"]','[data-konf-stil="wildwiese"]','[data-konf-umfang="ueppig"]']) await page.locator(s).click();
    const href=await page.locator('[data-konf-cta]').getAttribute('href');
    assert(['anlass=hochzeit','stil=wildwiese','umfang=ueppig'].every(v=>href.includes(v)),'Auswahl fehlt im Link');
    await page.locator('[data-konf-cta]').click();
    assert(await page.locator('[name="anlass"]:checked').inputValue()==='hochzeit','Anlass nicht übernommen');
  });
  await run('Glanz: Ringkonfigurator überträgt Material, Breite und Oberfläche', async () => {
    await goto('glanz-und-gloria/');
    for(const s of ['[data-ring-material="platin"]','[data-ring-breite="breit"]','[data-ring-oberflaeche="mattiert"]']) await page.locator(s).click();
    const href=decodeURIComponent(await page.locator('[data-ring-cta]').getAttribute('href')).toLowerCase();
    assert(['platin','breit','mattiert'].every(v=>href.includes(v)),'Ringwünsche fehlen');
  });
  await run('Gassert: kombinierte Fahrzeugfilter und Auswahlzustände', async () => {
    await goto('gassert/');
    await page.locator('[data-filter-marke="renault"]').click(); await page.locator('[data-filter-zustand="neuwagen"]').click();
    assert(await page.locator('[data-filter-marke="renault"]').getAttribute('aria-pressed')==='true','Filterzustand fehlt');
    const cards=await page.locator('.fahrzeug-karte:visible').allTextContents();
    assert(cards.length>0&&cards.every(t=>/renault/i.test(t)),'Markenfilter falsch');
  });
  await run('Kimberger: Behandlungsfinder aktualisiert Terminwunsch', async () => {
    await goto('kimberger/'); await page.locator('[data-anliegen="komfort"]').click();
    assert(await page.locator('[data-anliegen="komfort"]').getAttribute('aria-pressed')==='true','Auswahlzustand fehlt');
    assert((await page.locator('[data-anliegen-cta]').getAttribute('href')).includes('komfort'),'Behandlung fehlt');
  });
  await run('Jost: Farbansicht reagiert auf Auswahl', async () => {
    await goto('jost-maler/'); await page.locator('button[data-ton="salbeigruen"]').click();
    assert(await page.locator('[data-farb-overlay]').getAttribute('data-ton')==='salbeigruen','Farbvorschau unverändert');
  });
  await run('PopAlpin: Termincheck und Fehlerzustand', async () => {
    await goto('popalpin/'); await page.locator('#check-datum').fill(date(14));
    await page.locator('#check-anlass').selectOption({index:1});
    const occasion=await page.locator('#check-anlass').inputValue();
    await page.locator('form:has(#check-datum) button[type="submit"]').click();
    assert(await page.evaluate(() => new URL(location.href).searchParams.get('datum'))===date(14),'Datum nicht übertragen');
    assert(await page.locator('[name="anlass"]:checked').inputValue()===occasion,'Anlass nicht übernommen');
    await page.locator('form button[type="submit"]').click();
    assert(await page.locator('[data-fehler]').isVisible(),'Fehler nicht sichtbar');
  });
  await run('Kompass: Umzugszeitplan berechnet Etappen', async () => {
    await goto('kompass-umzuege/'); await page.locator('#zeitplan-datum').fill(date(60));
    await page.locator('[data-zeitplan] button[type="submit"]').click();
    assert(await page.locator('[data-zeitplan-ergebnis]').isVisible(),'Zeitplan fehlt');
    assert(await page.locator('[data-zeitplan-route] li').count()>=4,'Etappen fehlen');
  });
  await run('Watson: Themenkompass überträgt Auswahl', async () => {
    await goto('watson-angelika-coach/'); await page.locator('[data-thema="neustart"]').click();
    assert((await page.locator('[data-kompass-cta]').getAttribute('href')).includes('thema=neustart'),'Thema fehlt');
  });
  await run('Am Waldrand: Datumsgrenzen und langer Aufenthalt', async () => {
    await goto('am-waldrand/');
    await page.locator('[data-planer-anreise]').fill(date(14)); await page.locator('[data-planer-abreise]').fill(date(16));
    assert((await page.locator('[data-planer-text]').innerText()).includes('2 Nächte'),'Nächte falsch');
    await page.locator('[data-planer-anreise]').fill('2020-01-01');
    assert(await page.locator('[data-planer-cta]').getAttribute('aria-disabled')==='true','Vergangene Anreise angenommen');
    await page.locator('[data-planer-anreise]').fill(date(14)); await page.locator('[data-planer-abreise]').fill(date(44));
    assert((await page.locator('[data-planer-text]').innerText()).includes('30 Nächte'),'Langer Aufenthalt falsch');
    assert(await page.locator('[data-planer-naechte] > *').count()===15,'Unbegrenzte Datumskarten');
  });
  page.off('request',request); page.off('pageerror',pageerror);
  await page.emulateMedia({reducedMotion:'no-preference'});
  return {results,writes,errors};
}
