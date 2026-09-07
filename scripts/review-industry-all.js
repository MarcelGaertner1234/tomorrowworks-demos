async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  await page.setViewportSize({width:1440,height:1050});
  const results=[],errors=[],writes=[];
  const onError=e=>errors.push(e.message),onRequest=r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());};
  page.on('pageerror',onError);page.on('request',onRequest);
  const goto=p=>page.goto('http://127.0.0.1:4173/'+p,{waitUntil:'networkidle'});
  const assert=(v,m)=>{if(!v)throw Error(m);};
  await goto('glanz-und-gloria/');
  const definitions=await page.evaluate(()=>BranchDefinitions);
  for(const [slug,c] of Object.entries(definitions)){
    try{
      await goto(slug+'/');await page.evaluate(s=>{sessionStorage.removeItem('tw-workflow-v1:'+s);if(s==='spitzer-moden')sessionStorage.removeItem('spitzer-warenkorb');},slug);
      await goto(slug+'/'+c.start);
      if(slug==='spitzer-moden'){
        await page.locator('.produkt-kachel-btn').first().click();
        await page.locator('[name="produkt-groesse"]').first().check();
        await page.locator('#produkt-detail-hinzufuegen').click();
        await goto(slug+'/warenkorb.html');
      }
      await page.locator('.wf-quickfill button').click();
      const form=page.locator('form').filter({has:page.locator('.wf-quickfill')});
      await form.locator('button[type=submit]').click();
      await page.locator('[data-flow-handoff]').waitFor({state:'visible',timeout:4000});
      const r=await page.evaluate(s=>DemoFlow.latest(s),slug);
      assert(r&&r.fields.length>0,'Fachliche Angaben fehlen');
      assert(!JSON.stringify(r).includes('01512345678')&&!JSON.stringify(r).includes('demo@example.test'),'Kontaktfelder gespeichert');
      await page.locator('[data-flow-handoff] a').first().click();await page.waitForLoadState('networkidle');
      assert((await page.locator('[data-branch-operator]').innerText()).includes(r.id),'Vorgang nicht in Betriebsansicht');
      if(c.kind==='florist')await page.locator('[data-branch-action="work"]').click();
      else if(c.kind==='retail')await page.locator('[data-branch-action="held"]').click();
      else{
        if(slug==='am-waldrand')await page.locator('#branch-resource').selectOption({index:0});
        await page.locator('[data-branch-plan] button[type=submit]').click();
      }
      await page.locator('[data-branch-finish]').waitFor({state:'visible',timeout:4000});
      await page.locator('[data-branch-finish] button[type=submit]').click();
      assert(await page.locator('[data-branch-error]').isVisible(),'Ungeprüfte Aufgaben akzeptiert');
      for(const checkbox of await page.locator('[name="check"]').all())await checkbox.check();
      await page.locator('#branch-note').fill('Beispiel: Angaben abgestimmt, nächster Schritt vorbereitet.');
      await page.locator('[data-branch-finish] button[type=submit]').click();
      if(c.kind==='florist')await page.locator('[data-branch-finish] button[type=submit]').click();
      await page.reload({waitUntil:'networkidle'});
      assert(await page.evaluate(s=>DemoFlow.latest(s).status,slug)==='done','Abschluss nicht erhalten');
      await page.setViewportSize({width:1440,height:1050});await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/branchen-2/'+slug+'-desktop.png'});
      await page.locator('.branch-case > a.wf-link').click();await page.waitForLoadState('networkidle');
      assert((await page.locator('[data-wf-customer]').innerText()).includes('nächster Schritt vorbereitet'),'Rückmeldung nicht in Kundensicht');
      assert((await page.locator('[data-wf-customer]').innerText()).includes(r.id),'Vorgangsnummer geändert');
      results.push({slug,pass:true,id:r.id,fields:r.fields.length});
    }catch(error){results.push({slug,pass:false,error:error.message});}
  }
  page.off('pageerror',onError);page.off('request',onRequest);
  return{results,errors,writes};
}
