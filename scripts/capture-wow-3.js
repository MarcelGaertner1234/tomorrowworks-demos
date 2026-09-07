async(page)=>{
 await page.route('http://127.0.0.1:4173/**',r=>r.continue());await page.emulateMedia({reducedMotion:'reduce'});
 const slugs=['mos-kebab','clean-cut','am-waldrand','gassert','kimberger','kompass-umzuege','rubi','sml-spitzer','durmus-gebaeudereinigung','watson-angelika-coach'];
 for(const slug of slugs){
  await page.setViewportSize({width:1280,height:960});await page.goto('http://127.0.0.1:4173/'+slug+'/',{waitUntil:'networkidle'});
  if(slug==='sml-spitzer'){await page.locator('[data-load-size="3-zimmer"]').click();await page.locator('[data-load-cellar]').check();}
  if(slug==='rubi')for(const task of ['renovierung','garten','reparatur'])await page.locator('[data-house-pin='+task+']').click();
  if(slug==='kompass-umzuege'){await page.locator('[data-route-from]').fill('Mosbach');await page.locator('[data-route-to]').fill('Heidelberg');await page.locator('[data-route-date]').fill('2027-04-16');await page.locator('[data-route-extra][value=packservice]').check();}
  if(slug==='watson-angelika-coach')await page.locator('[data-mind-topic=entscheidung]').click();
  await page.locator('.tw-experience img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/assets/arbeiten/'+slug+'.jpg',type:'jpeg',quality:85});
  await page.setViewportSize({width:390,height:1100});await page.locator('.tw-experience').screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/wow-3/'+slug+'-mobile-complete.png'});
 }
 await page.goto('http://127.0.0.1:4173/gassert/',{waitUntil:'networkidle'});await page.locator('[data-motor-add]').click();await page.locator('[data-motor-car=fahrzeug-2]').click();await page.locator('[data-motor-add]').click();await page.locator('[data-motor-comparison]').screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/wow-3/gassert-comparison-mobile.png'});
 await page.emulateMedia({reducedMotion:'no-preference'});return{previews:slugs.length,mobileScenes:slugs.length,comparison:true};
}
