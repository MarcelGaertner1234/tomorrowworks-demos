/* Form adapters only run after the original branch-specific validation succeeds. */
(() => {
  'use strict';
  const F=DemoFlow,defs=BranchDefinitions,tokens=new WeakMap();
  const contact=/^(vorname|nachname|name|email|mail|handy|telefon|demo-ok|datenschutz)$/;
  const names={anlass:'Anlass',besetzung:'Besetzung',datum:'Wunschdatum',uhrzeit:'Beginn / Abholzeit',ort:'Ort',gaeste:'Gästezahl',technik:'Technik',wuensche:'Wünsche',nachricht:'Nachricht / Wünsche',stil:'Farbwelt',umfang:'Umfang',gruss:'Grußkarte',anreise:'Anreise',abreise:'Abreise',zimmer:'Zimmerwunsch',zimmertyp:'Zimmerwunsch',personen:'Personen',zeitraum:'Wunschzeitraum',anliegen:'Anliegen',fahrzeug:'Fahrzeug',behandlung:'Behandlung',umzugsart:'Umzugsart',von:'Von',nach:'Nach',groesse:'Umfang',zeitfenster:'Zeitfenster',zusatzleistung:'Zusatzleistungen',objektarbeiten:'Gewünschte Arbeiten',objektart:'Objektart',termin:'Wunschtermin',zeit:'Wunschzeit',beschreibung:'Arbeitsbeschreibung',objekt:'Objekt',system:'System',auftragsart:'Auftragsart',leistung:'Leistung',thema:'Anliegen',format:'Gesprächsformat',abwicklung:'Abwicklung',notiz:'Notiz',flaeche:'Fläche in m²',frequenz:'Rhythmus',volumen:'Volumen in m³'};
  const clean=t=>String(t||'').trim().replace(/\s+/g,' ');
  function choice(el){
    if(el.tagName==='SELECT')return clean(el.selectedOptions[0]?.textContent);
    if(['radio','checkbox'].includes(el.type)){
      const label=el.closest('label')||document.querySelector('label[for="'+CSS.escape(el.id)+'"]');
      return clean(label?.querySelector('strong')?.textContent||label?.textContent||el.value);
    }
    return el.value.trim();
  }
  const date=days=>{const d=new Date();d.setDate(d.getDate()+days);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  function capture(form){
    const fields=new Map(),data={};
    for(const el of form.querySelectorAll('input,select,textarea')){
      const name=el.name;
      if(!name||contact.test(name)||el.disabled||el.closest('[hidden]'))continue;
      if(['radio','checkbox'].includes(el.type)&&!el.checked)continue;
      if(el.type==='file'){if(el.files.length)fields.set('Fotos',el.files.length+' ausgewählt; nicht übertragen');continue;}
      if(!el.value.trim())continue;
      const label=names[name]||clean(document.querySelector('label[for="'+CSS.escape(el.id)+'"]')?.textContent)||name;
      const value=choice(el);
      if(el.type==='checkbox'){data[name]=[...(data[name]||[]),el.value];fields.set(label,[fields.get(label),value].filter(Boolean).join(', '));}
      else{data[name]=el.value.trim();fields.set(label,value);}
    }
    const slot=form.querySelector('.slot[aria-pressed="true"],.slot.is-active');
    if(slot){data.slot=slot.dataset.slot||clean(slot.textContent);fields.set('Gewünschtes Zeitfenster',data.slot);}
    return {data,fields:[...fields]};
  }
  function notifyError(form,error){
    let el=form.querySelector('[data-branch-error]');
    if(!el){el=document.createElement('p');el.className='wf-error';el.dataset.branchError='';el.setAttribute('role','alert');form.prepend(el);}
    F.error(el,error.message);return false;
  }
  window.BranchDemo={
    date,
    accept(form,confirmation,extra={}){
      try{
        const slug=document.body.dataset.demo,c=defs[slug];
        if(form.hidden&&form.dataset.branchId){const previous=F.get(slug,form.dataset.branchId);if(previous)return previous;}
        const snapshot=capture(form);
        const d=snapshot.data;
        if(c.kind==='hotel'&&(!d.anreise||!d.abreise||d.anreise<date(0)||d.abreise<=d.anreise))throw Error('Bitte Anreise und eine spätere Abreise ab heute wählen.');
        for(const input of form.querySelectorAll('input[type=number]'))if(input.value&&!input.checkValidity())throw Error('Bitte den zulässigen Zahlenbereich bei '+(names[input.name]||input.name)+' beachten.');
        if(form.id==='warenkorb-form'&&!extra.items?.length)throw Error('Bitte zuerst einen Artikel im Shop auswählen.');
        const fingerprint=JSON.stringify({...snapshot,...extra}),prior=tokens.get(form);
        const token=prior?.fingerprint===fingerprint?prior.token:crypto.randomUUID();
        tokens.set(form,{fingerprint,token});
        const record=F.create(slug,{status:'new',...snapshot,...extra},token);
        form.dataset.branchId=record.id;form.querySelector('[data-branch-error]')?.remove();
        F.handoff(confirmation,slug,record);
        return record;
      }catch(error){return notifyError(form,error);}
    },
    details(slug,r){
      const fields=[...(r.fields||[])];
      if(r.items)fields.push(['Artikel',r.items.map(i=>i.menge+' × '+i.name+' · Größe '+i.groesse).join('\n')]);
      if(r.plan){
        fields.push(['Zugeordnet',r.plan.resource],['Eingeplant',r.plan.end?r.plan.date+' bis '+r.plan.end:r.plan.date+(['event','dispatch'].includes(defs[slug].kind)?' · Ganzer Beispieltag':' · '+r.plan.time+' Uhr')]);
        if(r.plan.duration&&!['event','dispatch'].includes(defs[slug].kind))fields.push(['Planungsdauer',r.plan.duration+' Minuten'+(defs[slug].kind==='treatment'?' einschließlich 15 Minuten Puffer':'')+' (Beispiel)']);
        if(r.plan.dates?.length>1)fields.push(['Beispielserie',r.plan.dates.join(', ')]);
      }
      if(r.checked?.length)fields.push(['Dokumentierter Arbeitsstand',r.checked.join('\n')]);
      if(r.note)fields.push([r.status==='question'?'Rückfrage des Betriebs':'Rückmeldung des Betriebs',r.note]);
      return fields;
    }
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const slug=document.body.dataset.demo,c=defs[slug];if(!c)return;
    if(slug==='blumen-viva')document.querySelectorAll('[data-wf-reset]').forEach(b=>b.addEventListener('click',()=>sessionStorage.removeItem('viva-strauss-entwurf'),true));
    if(slug==='spitzer-moden')document.querySelectorAll('[data-wf-reset]').forEach(b=>b.addEventListener('click',()=>{sessionStorage.removeItem('spitzer-warenkorb');sessionStorage.removeItem('spitzer-bestellzaehler');},true));
    const form=[...document.forms].find(f=>f.querySelector('[name="vorname"],[name="name"]'));
    if(!form)return;
    if(slug==='sml-spitzer'){
      const params=new URLSearchParams(location.search);
      const fields=document.createElement('div');fields.className='wf-fields';
      fields.innerHTML='<label class="wf-field" for="branch-volume">Planungswert in m³ (optional)<input id="branch-volume" name="volumen" type="number" min="1" max="200"></label><label class="wf-field" for="branch-cellar">Keller / Dachboden<select id="branch-cellar" name="keller"><option value="nein">Nicht zusätzlich eingeplant</option><option value="ja">Zusätzlich einplanen</option></select></label>';
      form.prepend(fields);form.elements.volumen.value=params.get('volumen')||'';if(params.get('keller')==='1')form.elements.keller.value='ja';
    }
    if(slug==='durmus-gebaeudereinigung'){
      const params=new URLSearchParams(location.search);
      const fields=document.createElement('div');fields.className='wf-fields';
      fields.innerHTML='<label class="wf-field" for="branch-flaeche">Ungefähre Fläche in m²<input id="branch-flaeche" type="number" name="flaeche" min="1" max="100000"></label><label class="wf-field" for="branch-frequenz">Gewünschter Rhythmus<select id="branch-frequenz" name="frequenz"><option value="einmalig">Einmalig</option><option value="woechentlich">Wöchentlich</option><option value="mehrmals">Mehrmals pro Woche</option><option value="taeglich">Täglich</option></select></label>';form.prepend(fields);
      form.elements.flaeche.value=params.get('flaeche')||'';if(params.has('frequenz'))form.elements.frequenz.value=params.get('frequenz');
    }
    if(slug==='goldener-hirsch'){
      const transfer=()=>{form.elements.anreise.value=document.querySelector('[data-planer-anreise]').value;form.elements.abreise.value=document.querySelector('[data-planer-abreise]').value;};
      document.querySelector('[data-planer-cta]').addEventListener('click',()=>queueMicrotask(transfer));
    }
    const box=document.createElement('div');box.className='wf-quickfill';
    box.innerHTML='<button class="wf-button secondary" type="button">Mit Beispieldaten ausfüllen</button><p>Zum Ausprobieren. Angaben prüfen und anschließend den Vorgang abschließen.</p>';form.prepend(box);
    box.querySelector('button').addEventListener('click',()=>{
      for(const input of form.querySelectorAll('input,select,textarea')){
        if(input.disabled||input.closest('[hidden]'))continue;
        if(input.type==='file')continue;
        if(input.name==='volumen'&&!input.value){input.value='20';continue;}
        if(input.type==='radio'){if(!form.querySelector('[name="'+CSS.escape(input.name)+'"]:checked'))input.checked=true;}
        else if(input.type==='checkbox'&&input.name==='demo-ok')input.checked=true;
        else if(input.type==='date'&&!input.value)input.value=date(/abreise/.test(input.name)?16:14);
        else if(input.tagName==='SELECT'&&!input.value)input.selectedIndex=[...input.options].findIndex(o=>!!o.value);
        else if(input.type==='number'&&!input.value)input.value=input.name==='flaeche'?'150':(input.min||'1');
        else if(contact.test(input.name))input.value=['email','mail'].includes(input.name)?'demo@example.test':['telefon','handy'].includes(input.name)?'01512345678':'Demo Beispiel';
        else if(input.type==='text'&&!input.value)input.value=({von:'Mosbach · Beispielort',nach:'Neckarelz · Beispielort',zeitraum:'Aufenthalt in zwei Wochen',fahrzeug:'Fahrzeug zur Beratung'})[input.name]||'Beispielangabe';
        else if(input.tagName==='TEXTAREA'&&!input.value)input.value=input.name==='gruss'?'Alles Liebe zum Geburtstag!':'Beispielwunsch zur Abstimmung.';
        input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
      }
      if(slug==='am-waldrand'&&form.querySelector('[name="zimmer"]:checked')?.value==='einzelzimmer')form.elements.personen.value='1';
      form.querySelector('.slot')?.click();
      box.querySelector('p').textContent='Beispieldaten sind eingesetzt. Bitte prüfen und unten abschließen.';
    });
    form.addEventListener('reset',()=>tokens.delete(form));
  });
})();
