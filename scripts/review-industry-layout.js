async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  const errors=[],checks=[];const onError=e=>errors.push({url:page.url(),message:e.message});page.on('pageerror',onError);
  const goto=p=>page.goto('http://127.0.0.1:4173/'+p,{waitUntil:'networkidle'});
  await goto('blumen-viva/anfrage.html');await page.locator('.wf-quickfill button').click();await page.locator('form button[type=submit]').click();
  const defs=await page.evaluate(()=>BranchDefinitions);
  for(const [slug,c] of Object.entries(defs)){
    for(const file of ['betrieb.html','vorgang.html']){
      for(const width of [320,390,768,1024,1440]){
        await page.setViewportSize({width,height:1000});await goto(slug+'/'+file);
        checks.push(await page.evaluate(({slug,file,width})=>({slug,file,width,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length}),{slug,file,width}));
        if(file==='betrieb.html'&&[390,1440].includes(width))await page.screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/branchen-2/'+slug+(width===390?'-mobile.png':'-desktop.png'),fullPage:width===390});
      }
    }
  }
  page.off('pageerror',onError);return{checks:checks.length,failures:checks.filter(c=>c.overflow>0||c.h1!==1),errors};
}
