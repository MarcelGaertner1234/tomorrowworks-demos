async (page) => {
  await page.route('http://127.0.0.1:4173/**', route => route.continue());
  await page.setViewportSize({width:390,height:844});
  const results=[], errors=[], writes=[];
  const onError=e=>errors.push(e.message);
  const onRequest=r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());};
  page.on('pageerror',onError);page.on('request',onRequest);
  const assert=(condition,message)=>{if(!condition)throw Error(message);};
  const run=async(name,test)=>{try{await test();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
  const goto=path=>page.goto(`http://127.0.0.1:4173/${path}`,{waitUntil:'networkidle'});
  await run('Ring: Materialfotos, Gravur, Paar-Konfiguration und Anfrage',async()=>{
    await goto('glanz-und-gloria/');
    for(const [metal,image]of [['weissgold','white'],['roségold','rose'],['gelbgold','gold']]){
      await page.locator(`[data-atelier-metal="${metal}"]`).click();
      await page.locator('[data-atelier-image]').evaluate(i=>i.decode());
      assert((await page.locator('[data-atelier-image]').getAttribute('src')).includes(image),'Materialfoto falsch');
      assert(await page.locator(`[data-ring-material="${metal}"]`).getAttribute('aria-pressed')==='true','Detailauswahl nicht synchron');
    }
    await page.locator('#atelier-gravur').fill('Du & ich.');
    assert(await page.locator('#gravur-1').inputValue()==='Du & ich.','Gravur nicht synchron');
    assert(await page.locator('[data-atelier-engraving-text]').textContent()==='Du & ich.','Gravur nicht sichtbar');
    await page.locator('.atelier-details').click();
    await page.locator('[data-ansicht="paar"]').click();
    await page.locator('[data-ring-tab="2"]').click();
    await page.locator('[data-ring-material="platin"]').click();
    await page.locator('#gravur-2').fill('Gemeinsam.');
    assert(await page.locator('[data-atelier-metal="gelbgold"]').getAttribute('aria-pressed')==='true','Ring 2 überschreibt Ring 1');
    await page.locator('[data-atelier-request]').click();
    const wish=await page.locator('#nachricht').inputValue();
    assert(['Ring 1','Gelbgold','Du & ich.','Ring 2','Platin','Gemeinsam.'].every(t=>wish.includes(t)),'Wünsche nicht übertragen');
    await page.locator('#vorname').fill('Demo');await page.locator('#nachname').fill('Beispiel');await page.locator('#handy').fill('01512345678');
    await page.locator('.slot').first().click();await page.locator('form button[type=submit]').click();
    assert(await page.locator('[data-bestaetigung]').isVisible(),'Bestätigung fehlt');
    assert((await page.locator('[data-zusammenfassung]').innerText()).includes('Gemeinsam.'),'Wunsch fehlt im Abschluss');
  });
  await run('Jost: Maus, Tastatur, Endpunkte und Anfrage mit Farbidee',async()=>{
    await goto('jost-maler/');
    const slider=page.locator('#paint-slider');
    await slider.focus();await page.keyboard.press('Home');assert(await slider.inputValue()==='0','Home fehlt');
    await page.keyboard.press('End');assert(await slider.inputValue()==='100','End fehlt');
    await page.locator('[data-paint-position="52"]').click();
    await slider.scrollIntoViewIfNeeded();
    const box=await slider.boundingBox();
    await page.mouse.move(box.x+box.width*.52,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.82,box.y+box.height*.5,{steps:8});await page.mouse.up();
    assert(Number(await slider.inputValue())>75,'Ziehen verändert das Bild nicht');
    assert((await page.locator('[data-paint-comparison]').getAttribute('style')).includes(await slider.inputValue()+'%'),'Bild nicht mit Regler synchron');
    await page.locator('[data-paint-position="0"]').click();assert(await page.locator('.paint-state--after').isHidden(),'Nachher-Label bei 0 sichtbar');
    await page.locator('[data-paint-position="100"]').click();assert(await page.locator('.paint-state--before').isHidden(),'Vorher-Label bei 100 sichtbar');
    await page.locator('.transformation-intro a').click();
    assert(await page.locator('[name=leistung]:checked').inputValue()==='innenraum','Leistung fehlt');
    assert((await page.locator('#nachricht').inputValue()).includes('Salbeigrün'),'Farbidee fehlt');
    await page.locator('#ort').fill('Beispielort');await page.locator('#zeitraum').selectOption('offen');
    await page.locator('#vorname').fill('Demo');await page.locator('#nachname').fill('Beispiel');await page.locator('#handy').fill('01512345678');
    await page.locator('form button[type=submit]').click();
    assert(await page.locator('[data-bestaetigung]').isVisible(),'Bestätigung fehlt');
    assert((await page.locator('[data-zusammenfassung]').innerText()).includes('Salbeigrün'),'Farbidee fehlt im Abschluss');
  });
  await run('PopAlpin: Licht, alle Stimmungen, manueller Anlass und Datum',async()=>{
    await goto('popalpin/');
    const power=page.locator('[data-stage-power]');
    assert(await power.getAttribute('aria-pressed')==='false','Licht nicht aus');
    await power.focus();await page.keyboard.press('Enter');assert(await power.getAttribute('aria-pressed')==='true','Tastatur schaltet nicht');
    for(const mood of ['gala','hochzeit','party']){
      await page.locator(`[data-stage-choice="${mood}"]`).click();
      assert(await page.locator('[data-stage]').getAttribute('data-stage-mood')===mood,'Stimmung falsch');
      assert(await page.locator('#check-anlass').inputValue()===mood,'Anlass fehlt');
    }
    await page.locator('#check-anlass').selectOption('geburtstag');
    await power.click();await power.click();
    assert(await page.locator('#check-anlass').inputValue()==='geburtstag','Licht verändert manuellen Anlass');
    await page.locator('[data-stage-choice="party"]').click();
    await page.locator('#check-datum').fill('2027-10-10');
    await page.locator('.stage-booking button[type=submit]').click();
    assert(await page.locator('[name=anlass]:checked').inputValue()==='party','Party nicht übertragen');
    assert(await page.locator('#datum').inputValue()==='2027-10-10','Datum nicht übertragen');
    await page.locator('form').evaluate(form=>{
      for(const field of form.querySelectorAll('input,select')){
        if(field.type==='text')field.value='Demo Beispiel';
        else if(field.type==='email')field.value='demo@example.test';
        else if(field.type==='tel')field.value='01512345678';
        else if(field.type==='checkbox')field.checked=true;
        else if(field.tagName==='SELECT'&&!field.value)field.selectedIndex=1;
        else if(field.type==='radio'&&!form.querySelector(`[name="${field.name}"]:checked`))field.checked=true;
        field.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
    await page.locator('form button[type=submit]').click();
    assert(await page.locator('[data-bestaetigung]').isVisible(),'Band-Bestätigung fehlt');
    assert((await page.locator('[data-zusammenfassung]').innerText()).includes('Party'),'Party fehlt im Abschluss');
  });
  await run('Reduzierte Bewegung: Bühnenlicht bleibt direkt bedienbar',async()=>{
    await page.emulateMedia({reducedMotion:'reduce'});await goto('popalpin/');
    await page.locator('[data-stage-power]').click();
    assert(await page.locator('[data-stage-power]').getAttribute('aria-pressed')==='true','Licht schaltet nicht');
    assert(await page.locator('.stage-beams').evaluate(e=>getComputedStyle(e).transitionDuration)==='0s','Lichtübergang nicht reduziert');
    await page.emulateMedia({reducedMotion:'no-preference'});
  });
  page.off('pageerror',onError);page.off('request',onRequest);
  return {results,errors,writes};
}
