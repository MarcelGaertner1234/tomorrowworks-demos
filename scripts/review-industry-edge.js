async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  const results=[],errors=[],writes=[];
  const err=e=>errors.push(e.message),req=r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());};
  page.on('pageerror',err);page.on('request',req);
  await page.setViewportSize({width:390,height:1000});
  const goto=p=>page.goto('http://127.0.0.1:4173/'+p,{waitUntil:'networkidle'});
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const run=async(name,fn)=>{try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
  await run('Jost: Beispieleingabe, Doppelabschluss, Text sicher dargestellt, heutiger Tag abgelehnt',async()=>{
    await goto('jost-maler/anfrage.html');
    await page.locator('.wf-quickfill button').click();await page.locator('#nachricht').fill('<img src=x onerror="window.demoInjected=true"> Salbei');
    const before=await page.evaluate(()=>DemoFlow.list('jost-maler').length);
    await page.locator('#anfrage-form button[type=submit]').click();
    await page.locator('#anfrage-form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    assert(await page.evaluate(()=>DemoFlow.list('jost-maler').length)===before+1,'Doppelter Vorgang');
    await page.locator('[data-flow-handoff] a').first().click();await page.waitForLoadState('networkidle');
    assert(!await page.evaluate(()=>window.demoInjected),'HTML ausgeführt');
    assert((await page.locator('.wf-details').innerText()).includes('<img'),'Text fehlt');
    const today=await page.evaluate(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');});
    await page.locator('#visit-date').fill(today);await page.locator('[data-visit-form] button').click();
    assert(await page.locator('[data-visit-error]').isVisible(),'Heutiger Tag akzeptiert');
    await page.locator('[data-wf-reset]').click();await page.waitForLoadState('networkidle');
    assert(await page.evaluate(()=>DemoFlow.list('jost-maler').length)===0,'Reset fehlgeschlagen');
  });
  await run('Clean Cut: schneller Einstieg, Dienstdauer am Tagesende, Reset und Freigabe',async()=>{
    await goto('clean-cut/termin.html');await page.locator('.wf-quickfill button').click();
    await page.locator('[data-confirm]').click();
    const record=await page.evaluate(()=>DemoFlow.latest('clean-cut'));
    await page.locator('[data-flow-handoff] a').first().click();await page.waitForLoadState('networkidle');
    await page.locator('#move-day').selectOption('sa');await page.locator('#move-time').selectOption('14:00');
    await page.locator('[data-move-form] button[type=submit]').click();assert(await page.locator('[data-move-error]').isVisible(),'Dauer über Schließzeit angenommen');
    await page.locator('[data-wf-reset]').click();await page.waitForLoadState('networkidle');
    assert(await page.evaluate(()=>DemoFlow.list('clean-cut').length)===0,'Salon-Reset fehlgeschlagen');
    await goto('clean-cut/termin.html');assert(await page.locator('[data-slot="'+record.zeit+'"]').getAttribute('aria-disabled')!=='true','Reset gibt Platz nicht frei');
  });
  async function order(){
    await goto('mos-kebab/');
    await page.locator('[data-warenkorb-plus]').first().click();await page.locator('[data-warenkorb-toggle]').click();await page.locator('[data-warenkorb-abschliessen]').click();await page.locator('[data-flow-slots] .slot-pille').first().click();
    await page.locator('.wf-quickfill button').click();await page.locator('[data-flow-weiter]').click();
  }
  await run('MOS: Kapazität, Absage und ausschließlich durch Küche geänderter Status',async()=>{
    await order();await order();await order();await order();
    assert(await page.locator('[data-flow-fehler]').isVisible(),'Vierte aktive Bestellung zur selben Zeit akzeptiert');
    await page.waitForTimeout(13000);
    const active=await page.evaluate(()=>DemoFlow.list('mos-kebab').filter(r=>!['collected','cancelled'].includes(r.status)));
    assert(active.length===3&&active.every(r=>r.status==='received'),'Status ohne Küchenaktion geändert');
    await goto('mos-kebab/kueche.html');await page.locator('[data-next="cancelled"]').first().click();
    const cancelled=await page.evaluate(()=>DemoFlow.list('mos-kebab').find(r=>r.status==='cancelled'));
    await goto('mos-kebab/vorgang.html?id='+cancelled.id);
    assert((await page.locator('[data-wf-customer]').innerText()).includes('nicht verfügbar'),'Absagegrund fehlt');
    await order();assert(await page.locator('[data-flow-handoff]').isVisible(),'Kapazität nach Absage nicht frei');
    await goto('mos-kebab/kueche.html');await page.locator('[data-wf-reset]').click();await page.waitForLoadState('networkidle');
    assert(await page.evaluate(()=>DemoFlow.list('mos-kebab').length)===0,'Küchen-Reset fehlgeschlagen');
    await goto('mos-kebab/vorgang.html?id=unbekannt');
    assert(await page.locator('.wf-empty').isVisible(),'Fremder Vorgang angezeigt');
  });
  page.off('pageerror',err);page.off('request',req);
  return {results,errors,writes};
}
