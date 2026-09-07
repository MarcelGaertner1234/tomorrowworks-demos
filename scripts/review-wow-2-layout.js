async(page)=>{
  await page.route('http://127.0.0.1:4173/**',r=>r.continue());
  const checks=[],errors=[],missing=[];const onError=e=>errors.push(e.message),onResponse=r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()});};page.on('pageerror',onError);page.on('response',onResponse);
  const paths=['goldener-hirsch/','goldener-hirsch/betrieb.html','goldener-hirsch/vorgang.html','blumen-viva/','blumen-viva/anfrage.html','blumen-viva/betrieb.html','blumen-viva/vorgang.html','spitzer-moden/','spitzer-moden/shop.html','spitzer-moden/warenkorb.html','spitzer-moden/anfrage.html','spitzer-moden/betrieb.html','spitzer-moden/vorgang.html'];
  for(const path of paths){
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:1100});await page.goto('http://127.0.0.1:4173/'+path,{waitUntil:'networkidle'});
      checks.push(await page.evaluate(({path,width})=>({path,width,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),outside:[...document.querySelectorAll('button,input,select,textarea,form,h1,h2,h3,p')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]')&&!e.closest('details:not([open])')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.x>-1000&&(r.x< -2||r.right>innerWidth+2);}).map(e=>e.id||e.className)}),{path,width}));
      if(path.endsWith('/')&&[390,1440].includes(width))await page.screenshot({path:'/Users/marcelgaertner/neuwerk/.worktrees/tomorrowworks-demos/output/wow-2/'+path.slice(0,-1)+(width===390?'-mobile.png':'-desktop.png'),fullPage:width===390});
    }
  }
  page.off('pageerror',onError);page.off('response',onResponse);return{checks:checks.length,failures:checks.filter(c=>c.overflow>0||c.h1!==1||c.brokenImages.length||c.outside.length),errors,missing};
}
