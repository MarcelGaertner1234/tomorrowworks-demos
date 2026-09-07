async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  await page.setViewportSize({width:390,height:1000});
  const results=[],errors=[],writes=[];
  const onError=e=>errors.push(e.message),onRequest=r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());};
  page.on('pageerror',onError);page.on('request',onRequest);
  const goto=path=>page.goto('http://127.0.0.1:4173/'+path,{waitUntil:'networkidle'});
  const assert=(yes,why)=>{if(!yes)throw Error(why);};
  const run=async(name,fn)=>{try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
  const quick=async()=>page.locator('.wf-quickfill button').click();
  const send=async()=>{await page.locator('form').filter({has:page.locator('.wf-quickfill')}).locator('button[type=submit]').click();await page.locator('[data-flow-handoff]').waitFor({state:'visible'});};
  const operate=async()=>{await page.locator('[data-flow-handoff] a').first().click();await page.waitForLoadState('networkidle');};
  const finish=async()=>{for(const check of await page.locator('[data-branch-finish] [name=check]').all())await check.check();await page.locator('#branch-note').fill('Beispiel: persönlich abgestimmt.');await page.locator('[data-branch-finish] button[type=submit]').click();};
  const customer=async()=>{await page.locator('.branch-case > a').click();await page.waitForLoadState('networkidle');};
  await goto('goldener-hirsch/');
  await page.evaluate(()=>{for(const key of ['goldener-hirsch','blumen-viva','spitzer-moden'])sessionStorage.removeItem('tw-workflow-v1:'+key);sessionStorage.removeItem('spitzer-warenkorb');sessionStorage.removeItem('viva-strauss-entwurf');});
  await run('Hotel: drei Zimmeransichten, Tastatur und Übernahme in den Aufenthalt',async()=>{
    for(const [room,image]of [['renoviert','renoviert'],['landhaus','landhaus'],['klimatisiert','warm']]){
      await page.locator('[data-stay-room="'+room+'"]').click();await page.locator('.stay-image').evaluate(i=>i.decode());
      assert((await page.locator('.stay-image').getAttribute('src')).includes(image),'Falsche Zimmeransicht');
      assert(await page.locator('[data-planer-zimmer="'+room+'"]').getAttribute('aria-pressed')==='true','Planer nicht synchron');
      assert(await page.locator('[name=zimmertyp]').inputValue()===room,'Formular nicht synchron');
    }
    await page.locator('[data-stay-room=landhaus]').focus();await page.keyboard.press('Enter');
    await page.locator('[data-planer-anreise]').fill('2027-03-10');await page.locator('[data-planer-abreise]').fill('2027-03-09');await page.locator('[data-planer-abreise]').dispatchEvent('change');
    assert(await page.locator('[data-planer-cta]').getAttribute('aria-disabled')==='true','Ungültiger Zeitraum zugelassen');
    await page.locator('[data-planer-abreise]').fill('2027-03-12');await page.locator('[data-planer-abreise]').dispatchEvent('change');await page.locator('[name=planer-personen][value="1"]').check();await page.locator('[data-planer-extra]').check();await page.locator('[data-planer-cta]').click();
    assert(await page.locator('[name=anreise]').inputValue()==='2027-03-10','Anreise fehlt');assert(await page.locator('[name=abreise]').inputValue()==='2027-03-12','Abreise fehlt');assert(await page.locator('[name=personen]').inputValue()==='1','Personenzahl fehlt');
    assert((await page.locator('[name=nachricht]').inputValue()).includes('Landhausstil'),'Zimmerwunsch fehlt');
    await quick();await send();await operate();
    assert((await page.locator('.branch-case').innerText()).includes('Landhausstil'),'Zimmerstil fehlt im Betrieb');
    await page.locator('#branch-resource').selectOption({index:1});await page.locator('[data-branch-plan] button').click();await finish();await customer();
    assert((await page.locator('[data-wf-customer]').innerText()).includes('Landhausstil'),'Wunsch fehlt beim Kunden');await page.reload({waitUntil:'networkidle'});assert((await page.locator('[data-wf-customer]').innerText()).includes('2027-03-12'),'Aufenthalt fehlt nach Neuladen');
  });
  await run('Floristik: vier Bildwelten, Größen und sichere Grußkarte bis zur Abholung',async()=>{
    await goto('blumen-viva/');
    for(const color of ['zart','sonnig','wildwiese','weissgruen']){await page.locator('.bloom-controls [data-konf-stil="'+color+'"]').click();await page.locator('[data-konf-bild]').evaluate(i=>i.decode());assert((await page.locator('[data-konf-bild]').getAttribute('src')).includes(color),'Farbwelt falsch');}
    for(const size of ['kleiner-gruss','klassisch','ueppig']){await page.locator('[data-konf-umfang="'+size+'"]').click();assert(await page.locator('[data-konf-huelle]').getAttribute('data-size')===size,'Größe fehlt');}
    await page.locator('.bloom-controls [data-konf-stil=wildwiese]').focus();await page.keyboard.press('Enter');await page.locator('[data-konf-anlass=hochzeit]').click();
    const greeting='Für euch beide! <script>window.vivaInjected=true</script>';
    await page.locator('[data-bloom-message]').fill(greeting);assert(await page.locator('[data-bloom-card]').innerText()===greeting,'Grußkarte verändert');
    const link=await page.locator('[data-konf-cta]').getAttribute('href');assert(!link.includes('script')&&!link.includes('gruss'),'Grußtext in URL');
    await page.reload({waitUntil:'networkidle'});assert(await page.locator('[data-bloom-message]').inputValue()===greeting,'Entwurf verloren');
    await page.locator('[data-konf-cta]').click();await page.waitForLoadState('networkidle');
    assert(await page.locator('#gruss').inputValue()===greeting,'Gruß nicht übertragen');assert(await page.locator('[name=stil]:checked').inputValue()==='wildwiese','Farbe nicht übertragen');assert(await page.locator('#umfang').inputValue()==='ueppig','Umfang nicht übertragen');
    await quick();await send();await operate();assert((await page.locator('.branch-greeting').innerText()).includes(greeting),'Gruß fehlt im Bindebon');assert(!await page.evaluate(()=>window.vivaInjected),'Gruß als Code ausgeführt');
    await page.locator('[data-branch-action=work]').click();await finish();await finish();await customer();assert((await page.locator('[data-wf-customer]').innerText()).includes(greeting),'Gruß fehlt beim Kunden');
  });
  await run('Lookbook: Größenvalidierung, Bildmarkierungen, zwei Looks und keine doppelten Artikel',async()=>{
    await goto('spitzer-moden/');await page.locator('[data-look-add]').click();assert((await page.locator('[data-look-feedback]').innerText()).includes('Größe'),'Größen fehlen ohne Fehler');
    await page.locator('#look-size-atelier-blazer').selectOption('38');await page.locator('#look-size-atelier-hose').selectOption('40');await page.locator('[data-look-add]').click();await page.locator('[data-look-add]').click();
    assert(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('spitzer-warenkorb')).length)===2,'Doppelte Look-Artikel');
    await page.locator('[data-look-select=abend]').focus();await page.keyboard.press('Enter');await page.locator('[data-look-photo]').evaluate(i=>i.decode());
    assert((await page.locator('[data-look-photo]').getAttribute('src')).includes('abend'),'Lookfoto fehlt');
    await page.locator('[data-look-pins] button').first().click();assert(await page.locator('#look-size-abend-anzug').evaluate(e=>e===document.activeElement),'Bildmarkierung führt nicht zur Größe');
    await page.locator('#look-size-abend-anzug').selectOption('50');await page.locator('#look-choose-abend-hemd').uncheck();
    await page.locator('[data-look-select=stadt]').click();assert(await page.locator('#look-size-atelier-hose').inputValue()==='40','Größe beim Lookwechsel verloren');
    await page.locator('[data-look-select=abend]').click();await page.locator('[data-look-add]').click();
    const cart=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('spitzer-warenkorb')));assert(cart.length===3,'Vorherige Auswahl überschrieben');
    await page.locator('[data-look-feedback] a').click();await page.waitForLoadState('networkidle');await quick();await send();await operate();
    const record=await page.evaluate(()=>DemoFlow.latest('spitzer-moden'));assert(record.items.length===3,'Auswahl fehlt im Betrieb');assert(record.data.abwicklung==='anprobe','Anprobe nicht als Abwicklung übernommen');assert(record.items.find(i=>i.productId==='atelier-hose').groesse==='40','Größe fehlt im Betrieb');assert(record.total===567,'Summe stimmt nicht');
    await page.locator('[data-branch-action=held]').click();await finish();await customer();assert((await page.locator('[data-wf-customer]').innerText()).includes('Hose „Stadt“')||(await page.locator('[data-wf-customer]').innerText()).includes('Hose „Stadt"'),'Teile fehlen beim Kunden');
  });
  await run('Neue Beispielteile: Shopdetails zeigen keine fehlenden Galerieansichten',async()=>{
    await goto('spitzer-moden/shop.html');await page.locator('[data-produkt=atelier-blazer] button').click();
    assert(await page.locator('.produkt-galerie-thumb').count()===1,'Nicht vorhandene Ansichten angeboten');await page.locator('#produkt-detail-bild').evaluate(i=>i.decode());
  });
  await run('Reduzierte Bewegung: alle drei neuen Einstiege bleiben bedienbar',async()=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await goto('goldener-hirsch/');await page.locator('[data-stay-room=renoviert]').click();assert(await page.locator('.stay-image').evaluate(e=>e.getAnimations().length)===0,'Zimmerbewegung aktiv');
    await goto('blumen-viva/');await page.locator('[data-konf-umfang=ueppig]').click();assert(await page.locator('.bloom-bouquet').evaluate(e=>getComputedStyle(e).transitionDuration)==='0s','Straußbewegung aktiv');
    await goto('spitzer-moden/');await page.locator('[data-look-select=abend]').click();assert(await page.locator('.look-photo').evaluate(e=>e.getAnimations().length)===0,'Lookbewegung aktiv');await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await run('Floristik-Reset entfernt auch den lokalen Grußkartenentwurf',async()=>{
    await goto('blumen-viva/betrieb.html');await page.locator('[data-wf-reset]').click();await page.waitForLoadState('networkidle');assert(await page.evaluate(()=>{const draft=JSON.parse(sessionStorage.getItem('viva-strauss-entwurf')||'null');return !draft||(draft.gruss===''&&draft.anlass==='geburtstag'&&draft.stil==='zart'&&draft.umfang==='klassisch');}),'Persönlicher Grußentwurf bleibt nach Reset');
  });
  page.off('pageerror',onError);page.off('request',onRequest);return{results,errors,writes};
}
