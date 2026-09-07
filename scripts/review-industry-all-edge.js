async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  await page.setViewportSize({width:390,height:1000});
  const results=[],errors=[],writes=[];
  const error=e=>errors.push(e.message),request=r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());};
  page.on('pageerror',error);page.on('request',request);
  const goto=p=>page.goto('http://127.0.0.1:4173/'+p,{waitUntil:'networkidle'});
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const run=async(name,fn)=>{try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
  async function submit(){await page.locator('.wf-quickfill button').click();await page.locator('form').filter({has:page.locator('.wf-quickfill')}).locator('button[type=submit]').click();await page.locator('[data-flow-handoff]').waitFor({state:'visible'});}
  async function operator(){await page.locator('[data-flow-handoff] a').first().click();await page.waitForLoadState('networkidle');}
  await goto('glanz-und-gloria/');
  const defs=await page.evaluate(()=>BranchDefinitions);
  for(const [slug,c] of Object.entries(defs).filter(([,c])=>c.resources.length)){
    await run(c.name+': Überschneidung abgefangen, alternative Planung möglich',async()=>{
      await goto(slug+'/');await page.evaluate(s=>sessionStorage.removeItem('tw-workflow-v1:'+s),slug);
      await goto(slug+'/'+c.start);await submit();await operator();await page.locator('[data-branch-plan] button').click();
      await goto(slug+'/'+c.start);await submit();await operator();
      await page.locator('[data-branch-plan] button').click();
      assert(await page.locator('[data-branch-error]').isVisible(),'Überbuchung erlaubt');
      if(c.kind==='hotel'||c.kind==='dispatch')await page.locator('#branch-resource').selectOption({index:1});
      else if(c.kind==='event'){
        const old=await page.locator('#branch-date').inputValue();
        const next=await page.evaluate(d=>{const a=new Date(d+'T12:00:00');a.setDate(a.getDate()+1);return a.getFullYear()+'-'+String(a.getMonth()+1).padStart(2,'0')+'-'+String(a.getDate()).padStart(2,'0');},old);
        await page.locator('#branch-date').fill(next);
      }else await page.locator('#branch-time').fill('13:00');
      await page.locator('[data-branch-plan] button').click();
      assert((await page.locator('[data-branch-result]').innerText()).includes('sichtbar'),'Alternative blockiert');
    });
  }
  await run('Spitzer Moden: ausverkaufte Größe und Rückfrage erhalten',async()=>{
    await goto('spitzer-moden/shop.html');await page.locator('.produkt-kachel-btn').first().click();await page.locator('[name="produkt-groesse"][value="44"]').check();await page.locator('#produkt-detail-hinzufuegen').click();await goto('spitzer-moden/warenkorb.html');await submit();await operator();
    await page.locator('[data-branch-action="held"]').click();assert(await page.locator('[data-branch-error]').isVisible(),'Ausverkaufte Größe zurückgelegt');
    await page.locator('.branch-exception summary').click();await page.locator('#branch-question').fill('Größe 44 ist nicht verfügbar. Eine andere Größe abstimmen.');
    await page.locator('[data-branch-action="question"]').click();await page.locator('.branch-case > a').click();await page.waitForLoadState('networkidle');
    assert((await page.locator('[data-wf-customer]').innerText()).includes('Größe 44 ist nicht verfügbar'),'Rückfrage fehlt beim Kunden');
  });
  await run('Blumen: Grußkarte unverändert, kein doppelter Bindebon, Reset isoliert',async()=>{
    await goto('blumen-viva/anfrage.html');await page.locator('.wf-quickfill button').click();await page.locator('#gruss').fill('<script>window.branchInjected=true</script> Liebe Grüße!');
    const before=await page.evaluate(()=>DemoFlow.list('blumen-viva').length);
    await page.locator('form button[type=submit]').click();await page.locator('form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    assert(await page.evaluate(()=>DemoFlow.list('blumen-viva').length)===before+1,'Doppelter Bindebon');
    await operator();assert((await page.locator('.branch-greeting').innerText()).includes('<script>'),'Grußtext verändert');assert(!await page.evaluate(()=>window.branchInjected),'Grußtext als HTML ausgeführt');
    const keep=await page.evaluate(()=>DemoFlow.list('popalpin').length);
    await page.locator('[data-wf-reset]').click();await page.waitForLoadState('networkidle');
    assert(await page.evaluate(()=>DemoFlow.list('blumen-viva').length)===0,'Reset fehlgeschlagen');assert(await page.evaluate(()=>DemoFlow.list('popalpin').length)===keep,'Andere Branche gelöscht');
  });
  await run('SML: Rechner mit Kellerzuschlag, Kapazität und Fahrzeugwahl',async()=>{
    await goto('sml-spitzer/');await page.locator('[data-groesse="3-zimmer"]').click();await page.locator('[data-rechner-keller]').check();await page.locator('[data-rechner-cta]').click();await page.waitForLoadState('networkidle');
    assert(await page.locator('[name="volumen"]').inputValue()==='40','Kellerzuschlag nicht übertragen');await submit();await operator();
    await page.locator('[data-branch-plan] button').click();assert((await page.locator('[data-branch-error]').innerText()).toLowerCase().includes('kapazität'),'Zu kleines Fahrzeug zugeteilt');
  });
  await run('Durmus: Fläche, Rhythmus und drei geplante Einsätze',async()=>{
    await goto('durmus-gebaeudereinigung/');
    await page.locator('[data-rechner-flaeche]').fill('300');await page.locator('[data-rechner-frequenz][value="taeglich"]').check();await page.locator('[data-rechner-cta]').click();await page.waitForLoadState('networkidle');
    assert(await page.locator('[name="flaeche"]').inputValue()==='300','Fläche fehlt');assert(await page.locator('[name="frequenz"]').inputValue()==='taeglich','Rhythmus fehlt');await submit();await operator();
    await page.locator('#branch-resource').selectOption({index:1});await page.locator('#branch-time').fill('15:00');await page.locator('[data-branch-plan] button').click();
    assert(await page.evaluate(()=>DemoFlow.latest('durmus-gebaeudereinigung').plan.dates.length)===3,'Wiederholung nicht geplant');
  });
  page.off('pageerror',error);page.off('request',request);return{results,errors,writes};
}
