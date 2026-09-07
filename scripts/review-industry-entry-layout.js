async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  const checks=[],errors=[];const onError=e=>errors.push({url:page.url(),message:e.message});page.on('pageerror',onError);
  await page.goto('http://127.0.0.1:4173/glanz-und-gloria/',{waitUntil:'networkidle'});
  const defs=await page.evaluate(()=>BranchDefinitions);
  const paths=new Set(['projekte.html','spitzer-moden/warenkorb.html','spitzer-moden/anfrage.html']);
  for(const [slug,c] of Object.entries(defs)){paths.add(slug+'/');if(c.start!=='index.html#anfrage')paths.add(slug+'/'+c.start);}
  for(const path of paths){
    for(const width of [320,768,1440]){
      await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4173/'+path,{waitUntil:'networkidle'});
      checks.push(await page.evaluate(({path,width})=>({path,width,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length}),{path,width}));
    }
  }
  page.off('pageerror',onError);
  return {checks:checks.length,failures:checks.filter(c=>c.overflow>0||c.h1!==1),errors};
}
