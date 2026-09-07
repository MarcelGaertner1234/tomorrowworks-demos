(() => {
  'use strict';
  const root = document.querySelector('[data-konfigurator]'); if (!root) return;
  const key = 'viva-strauss-entwurf';
  const names = {anlass:{geburtstag:'zum Geburtstag','liebe-danke':'für Liebe & Danke',hochzeit:'zur Hochzeit',trauer:'für einen stillen Abschied'},stil:{zart:'Zart & Pastell',sonnig:'Warm & Sonnig',wildwiese:'Wildwiese bunt',weissgruen:'Weiß & Grün'},umfang:{'kleiner-gruss':'klein und fein',klassisch:'klassisch',ueppig:'üppig'}};
  let choice = {anlass:'geburtstag',stil:'zart',umfang:'klassisch',gruss:''};
  try {
    const saved = JSON.parse(sessionStorage.getItem(key)||'null');
    if (saved) { for (const group of ['anlass','stil','umfang']) if (names[group][saved[group]]) choice[group] = saved[group]; if (typeof saved.gruss === 'string') choice.gruss = saved.gruss.slice(0,240); }
  } catch { /* The workbench also works without a saved draft. */ }
  const message = root.querySelector('[data-bloom-message]'); message.value = choice.gruss;
  const photo = root.querySelector('[data-konf-bild]');
  const preview = root.querySelector('[data-konf-huelle]');
  const cta = root.querySelector('[data-konf-cta]');
  function save() { try { sessionStorage.setItem(key,JSON.stringify(choice)); return true; } catch { return false; } }
  function update() {
    for (const group of ['anlass','stil','umfang']) root.querySelectorAll('[data-konf-'+group+']').forEach(b => {const active=b.getAttribute('data-konf-'+group)===choice[group]; b.setAttribute('aria-pressed',String(active));b.classList.toggle('is-aktiv',active);});
    const src = 'assets/wow-bouquet-'+choice.stil+'.webp';
    if (photo.getAttribute('src') !== src) {photo.src=src;photo.alt='KI-Blumenillustration: '+names.stil[choice.stil];}
    preview.dataset.color=choice.stil;preview.dataset.size=choice.umfang;
    root.querySelector('[data-bloom-name]').textContent=names.stil[choice.stil];
    root.querySelector('[data-konf-satz]').textContent='Ihr Strauß: '+names.umfang[choice.umfang]+', '+names.stil[choice.stil]+', '+names.anlass[choice.anlass]+'.';
    root.querySelector('[data-bloom-card]').textContent=choice.gruss.trim()||'Ein paar Worte machen ihn zu Ihrem Strauß.';
    const saved=save();
    cta.href='anfrage.html?'+new URLSearchParams({anlass:choice.anlass,stil:choice.stil,umfang:choice.umfang,...(saved?{entwurf:'strauss'}:{})});
    root.querySelector('.bloom-handoff').textContent=saved?'Ihre Auswahl und Grußkarte kommen mit in die Anfrage.':'Ihre Auswahl kommt mit. Bitte den Grußtext auf der nächsten Seite erneut eingeben.';
  }
  for (const group of ['anlass','stil','umfang']) root.querySelectorAll('[data-konf-'+group+']').forEach(b=>b.addEventListener('click',()=>{choice[group]=b.getAttribute('data-konf-'+group);update();}));
  message.addEventListener('input',()=>{choice.gruss=message.value;update();});
  document.querySelector('[data-wf-reset]')?.addEventListener('click',()=>sessionStorage.removeItem(key));
  update();
})();
