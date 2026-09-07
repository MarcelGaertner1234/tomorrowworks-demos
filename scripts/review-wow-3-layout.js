async(page)=>{
 await page.route('http://127.0.0.1:4173/**',r=>r.continue());
 const slugs=['mos-kebab','clean-cut','am-waldrand','gassert','kimberger','kompass-umzuege','rubi','sml-spitzer','durmus-gebaeudereinigung','watson-angelika-coach'],results=[],errors=[];
 const onError=e=>errors.push({url:page.url(),message:e.message});page.on('pageerror',onError);
 for(const slug of slugs){
  await page.setViewportSize({width:1440,height:1100});await page.goto('http://127.0.0.1:4173/'+slug+'/',{waitUntil:'networkidle'});
  await page.locator('.tw-experience img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
  await page.screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/wow-3/'+slug+'-desktop.png'});
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1100});
   const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,overflow:[...document.querySelectorAll('.tw-experience button,.tw-experience input,.tw-experience select,.tw-experience a,.tw-experience h1,.tw-experience h2,.tw-experience p')].filter(e=>!e.closest('[hidden]')&&e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1}).map(e=>e.outerHTML.slice(0,140)),broken:[...document.querySelectorAll('.tw-experience img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));results.push({slug,...layout});
   if(width===390)await page.screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/wow-3/'+slug+'-mobile.png'});
  }
 }
 page.off('pageerror',onError);return{results,errors};
}
