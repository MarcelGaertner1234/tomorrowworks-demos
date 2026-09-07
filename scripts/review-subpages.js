async (page) => {
  // Routing disables the HTTP cache so checks always exercise the saved files.
  await page.route('http://127.0.0.1:4173/**', route => route.continue());
 const paths=["am-waldrand/anfrage.html", "blumen-viva/anfrage.html", "clean-cut/portal.html", "clean-cut/termin.html", "durmus-gebaeudereinigung/anfrage.html", "gassert/termin.html", "glanz-und-gloria/termin.html", "jost-maler/anfrage.html", "kimberger/termin.html", "kompass-umzuege/anfrage.html", "popalpin/anfrage.html", "rubi/anfrage.html", "sml-spitzer/anfrage.html", "sml-spitzer/karriere.html", "sml-spitzer/unternehmen.html", "spitzer-moden/anfrage.html", "spitzer-moden/shop.html", "spitzer-moden/warenkorb.html", "watson-angelika-coach/kennenlernen.html"]; const results=[]; const errors=[];
 const onError=e=>errors.push(e.message); page.on('pageerror',onError);
 for(const path of paths) {
  errors.length=0;
  await page.goto(`http://127.0.0.1:4173/${path}`,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});
  const widths=[];
  for(const width of [320,390,768,1024,1440]) {
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   widths.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth})));
  }
  results.push({path,widths,errors:[...errors],...await page.evaluate(()=>({h1Count:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}))});
 }
 page.off('pageerror',onError); return results;
}