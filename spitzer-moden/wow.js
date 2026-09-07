(() => {
  'use strict';
  const root=document.querySelector('[data-lookbook]');if(!root)return;
  let active=SPITZER_LOOKS[0], fingerprint='';
  const picks=new Map();
  const photo=root.querySelector('[data-look-photo]'),items=root.querySelector('[data-look-items]'),feedback=root.querySelector('[data-look-feedback]'),submit=root.querySelector('[data-look-add]');
  function updateTotal() {
    const selected=active.products.filter(p=>picks.get(p.id).checked);
    root.querySelector('[data-look-total]').textContent=selected.length+' '+(selected.length===1?'Teil':'Teile')+' ausgewählt · Beispielsumme '+selected.reduce((sum,p)=>sum+p.preis,0)+' €';
    feedback.hidden=true; submit.textContent='Auswahl zur Anprobe vormerken';
  }
  function render() {
    const changed=root.dataset.look!==active.id;root.dataset.look=active.id;
    photo.src=active.image;photo.alt=active.alt;
    if(changed&&!matchMedia('(prefers-reduced-motion: reduce)').matches)photo.animate([{opacity:.4,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:450,easing:'ease-out'});
    root.querySelector('[data-look-title]').textContent=active.name;
    root.querySelector('[data-look-description]').textContent=active.copy;
    root.querySelectorAll('[data-look-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lookSelect===active.id)));
    const pins=root.querySelector('[data-look-pins]');pins.replaceChildren();items.replaceChildren();
    for(const product of active.products) {
      if(!picks.has(product.id)){const saved=ladeWarenkorb().find(i=>i.produktId===product.id);picks.set(product.id,{checked:true,size:saved?.groesse||''});}
      const state=picks.get(product.id),row=document.createElement('div');row.className='look-item';
      const check=document.createElement('input');check.type='checkbox';check.checked=state.checked;check.id='look-choose-'+product.id;
      const thumb=document.createElement('img');thumb.src=active.image;thumb.alt='';thumb.style.objectPosition=product.position;thumb.width=56;thumb.height=76;
      const label=document.createElement('label');label.htmlFor=check.id;label.className='look-item-label';
      const name=document.createElement('strong');name.textContent=product.name;const price=document.createElement('span');price.textContent='Beispielpreis '+product.preis+' €';label.append(name,price);
      const sizeLabel=document.createElement('label');sizeLabel.className='look-size';sizeLabel.htmlFor='look-size-'+product.id;sizeLabel.textContent='Größe';
      const size=document.createElement('select');size.id=sizeLabel.htmlFor;size.setAttribute('aria-label','Größe für '+product.name);size.append(new Option('Wählen',''));product.groessen.forEach(g=>size.append(new Option(g,g)));size.value=state.size;sizeLabel.append(size);
      check.addEventListener('change',()=>{state.checked=check.checked;updateTotal();});size.addEventListener('change',()=>{state.size=size.value;updateTotal();});
      row.append(check,thumb,label,sizeLabel);items.append(row);
      const pin=document.createElement('button');pin.type='button';pin.textContent=product.short;pin.setAttribute('aria-label',product.name+' auswählen');pin.addEventListener('click',()=>{check.checked=true;state.checked=true;updateTotal();root.querySelectorAll('.look-item').forEach(r=>delete r.dataset.highlight);row.dataset.highlight='true';size.focus();});pins.append(pin);
    }
    updateTotal();
  }
  root.querySelectorAll('[data-look-select]').forEach(b=>b.addEventListener('click',()=>{active=SPITZER_LOOKS.find(l=>l.id===b.dataset.lookSelect);render();}));
  submit.addEventListener('click',()=>{
    const selected=active.products.filter(p=>picks.get(p.id).checked);
    const show=(message,link=false)=>{feedback.replaceChildren(document.createTextNode(message));if(link){const a=document.createElement('a');a.href='warenkorb.html?anprobe=1';a.textContent='Anprobe-Anfrage im Warenkorb abschließen';feedback.append(document.createElement('br'),a);}feedback.hidden=false;};
    if(!selected.length){show('Bitte wählen Sie mindestens ein Teil aus.');return;}
    const missing=selected.find(p=>!picks.get(p.id).size);if(missing){show('Bitte wählen Sie eine Größe für '+missing.name+'.');document.getElementById('look-size-'+missing.id).focus();return;}
    const additions=selected.map(p=>({produktId:p.id,groesse:picks.get(p.id).size,menge:1}));const mark=JSON.stringify(additions);
    const cart=ladeWarenkorb();
    if(mark!==fingerprint||!additions.every(i=>cart.some(r=>r.produktId===i.produktId&&r.groesse===i.groesse))){
      for(const item of additions){const old=cart.find(r=>r.produktId===item.produktId&&r.groesse===item.groesse);if(!old)cart.push(item);}
      try{sessionStorage.setItem(WARENKORB_KEY,JSON.stringify(cart));fingerprint=mark;}catch{show('Die Auswahl konnte in diesem Browser nicht gespeichert werden. Bitte erlauben Sie lokalen Website-Speicher und versuchen Sie es erneut.');return;}
    }
    show('Ihre '+selected.length+' '+(selected.length===1?'Auswahl ist':'Teile sind')+' im Demo-Warenkorb vorgemerkt. Dort können Sie die Anprobe-Anfrage abschließen.',true);
    submit.textContent='Auswahl ist vorgemerkt';
  });
  render();
})();
