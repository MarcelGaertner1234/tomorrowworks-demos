/* Local, per-tab demonstration records. No network writes or stored contact fields. */
(() => {
  'use strict';
  const config = {
    'jost-maler': {name:'Jost',prefix:'J-',operator:'betrieb.html',start:'anfrage.html?leistung=innenraum&inspiration=salbei',heading:'Ihr Raumprojekt',noun:'Projekt'},
    'clean-cut': {name:'Clean Cut',prefix:'B-',operator:'portal.html',start:'termin.html',heading:'Dein Salontermin',noun:'Termin'},
    'mos-kebab': {name:'MOS Kebap',prefix:'MK-',operator:'kueche.html',start:'index.html#speisekarte',heading:'Deine Bestellung',noun:'Bestellung'}
  };
  const key = slug => 'tw-workflow-v1:' + slug;
  const read = slug => {
    try {
      const data = JSON.parse(sessionStorage.getItem(key(slug)));
      if (data && Array.isArray(data.records) && Number.isSafeInteger(data.next)) return data;
    } catch (_) {}
    return {next:1100,records:[],latest:null};
  };
  const save = (slug,data) => {
    try { sessionStorage.setItem(key(slug),JSON.stringify(data)); }
    catch (_) { throw Error('Die Browser-Sitzung kann nicht gespeichert werden. Bitte Sitzungsspeicher erlauben und erneut versuchen.'); }
    window.dispatchEvent(new CustomEvent('workflowchange',{detail:{slug}}));
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {new:'Anfrage eingegangen',visit:'Besichtigung geplant',draft:'Angebotsentwurf vorbereitet',booked:'Termin reserviert',moved:'Termin verschoben',cancelled:'Abgesagt',received:'Eingegangen',cooking:'In Zubereitung',ready:'Abholbereit',collected:'Abgeholt'};
  const api = window.DemoFlow = {
    config,escape,labels,
    label: (slug,r) => config[slug].states?.[r.status] || labels[r.status] || r.status,
    list: slug => read(slug).records,
    get: (slug,id) => read(slug).records.find(r=>r.id===id),
    latest: slug => { const d=read(slug);return d.records.find(r=>r.id===d.latest); },
    create(slug,payload,token) {
      const d=read(slug);
      const prior=token && d.records.find(r=>r.token===token);
      if(prior)return prior;
      const record={...payload,id:config[slug].prefix+(++d.next),token,history:[{text:config[slug].states?.[payload.status]||labels[payload.status]||payload.status,at:new Date().toISOString()}]};
      d.records.push(record);d.latest=record.id;save(slug,d);return record;
    },
    update(slug,id,patch,note) {
      const d=read(slug),r=d.records.find(r=>r.id===id);
      if(!r)throw Error('Dieser Vorgang ist nicht mehr in dieser Sitzung. Bitte neu starten.');
      Object.assign(r,patch);
      r.history.push({text:note||api.label(slug,r),at:new Date().toISOString()});
      d.latest=id;save(slug,d);return r;
    },
    reset(slug) { sessionStorage.removeItem(key(slug));if(slug==='kompass-umzuege')sessionStorage.removeItem('tw-wow-kompass');location.href='index.html'; },
    url(slug,id,operator=false) {return (operator?config[slug].operator:'vorgang.html')+'?id='+encodeURIComponent(id);},
    handoff(container,slug,record) {
      let box=container.querySelector('[data-flow-handoff]');
      if(!box){box=document.createElement('div');box.dataset.flowHandoff='';box.className='wf-handoff';container.append(box);}
      box.innerHTML='<strong>'+escape(record.id)+' · '+escape(api.label(slug,record))+'</strong><p>Der Vorgang bleibt in diesem Browser-Tab. So geht es im Betrieb weiter:</p><div class="wf-actions"><a class="wf-button" href="'+api.url(slug,record.id,true)+'">Diesen Vorgang im Betrieb ansehen</a><a class="wf-link" href="'+api.url(slug,record.id)+'">Kundenstatus ansehen</a></div>';
    },
    details(slug,r) {
      if(config[slug].extended)return BranchDemo.details(slug,r);
      if(slug==='jost-maler')return [['Leistung',r.service],['Ort',r.place],['Wunschzeitraum',r.period],['Fläche',r.area?r.area+' m²':'Vor Ort klären'],['Untergrund',r.surface||'Vor Ort klären'],['Farbidee / Nachricht',r.notes||'Noch offen'],['Fotos',r.photos?r.photos+' ausgewählt; nicht übertragen':'Keine Fotos'],['Besichtigung',r.visit?r.visit.replace('T',' · ')+' Uhr':'Noch nicht geplant']];
      if(slug==='clean-cut')return [['Leistung',r.leistung],['Beispieltag',({mo:'Montag',di:'Dienstag',mi:'Mittwoch',do:'Donnerstag',fr:'Freitag',sa:'Samstag'})[r.tag]],['Person',({max:'Max',leon:'Leon',lena:'Lena'})[r.stylist]],['Uhrzeit',r.zeit+' Uhr'],['Dauer',r.duration+' Minuten (Beispiel)']];
      return [['Abholzeit',r.time+' Uhr · Beispielabend'],['Bestellung',r.items.map(i=>i.quantity+' × '+i.name).join('\n')],['Sonderwunsch',r.notes||'Keine Sonderwünsche'],['Summe',r.total.toLocaleString('de-DE',{style:'currency',currency:'EUR'})+' · Beispielpreise']];
    },
    detailHTML(slug,r) {return '<dl class="wf-details">'+api.details(slug,r).map(([k,v])=>'<div><dt>'+escape(k)+'</dt><dd>'+escape(v)+'</dd></div>').join('')+'</dl>';},
    historyHTML(r) {return '<ol class="wf-history">'+r.history.map(h=>'<li>'+escape(h.text)+'</li>').join('')+'</ol>';},
    error(el,message) {el.hidden=false;el.textContent=message;el.tabIndex=-1;el.focus();}
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const slug=document.body.dataset.demo,c=config[slug];
    if(!c)return;
    const operator=document.body.hasAttribute('data-wf-operator');
    const bar=document.querySelector('.demo-toolbar-actions');
    if(bar){
      const nav=document.createElement('nav');nav.className='wf-perspectives';nav.setAttribute('aria-label','Perspektive der Branchenlösung');
      const updateNav=()=>{
        const id=new URLSearchParams(location.search).get('id');
        const latest=(id&&api.get(slug,id))||api.latest(slug);
        nav.innerHTML='<a '+(!operator?'aria-current="page" ':'')+'href="'+(latest?api.url(slug,latest.id):c.start)+'">Kundensicht</a><a '+(operator?'aria-current="page" ':'')+'href="'+(latest?api.url(slug,latest.id,true):c.operator)+'">Betriebsansicht</a>';
      };
      updateNav();window.addEventListener('workflowchange',updateNav);
      bar.prepend(nav);
    }
    if(!document.body.classList.contains('workflow-page')){
      const main=document.querySelector('main');
      if(main){
        const hint=document.createElement('aside');hint.className='wf-invitation';
        hint.innerHTML='<div><strong>'+escape(c.invitation||({ 'jost-maler':'Vom Raumwunsch zur Projektakte','clean-cut':'Von der Buchung in den Teamkalender','mos-kebab':'Von der Bestellung auf den Küchenbon'})[slug])+'</strong><span>Branchenlösung ausprobieren · Beispieldaten nur in diesem Browser-Tab</span></div><a href="'+c.operator+'">Im Betrieb ansehen</a>';
        main.append(hint);
      }
    }
    document.querySelectorAll('[data-wf-reset]').forEach(b=>b.addEventListener('click',()=>api.reset(slug)));
    const form=slug==='jost-maler'?document.querySelector('#anfrage-form'):slug==='clean-cut'?document.querySelector('[data-planner]'):document.querySelector('[data-flow-kontakt]');
    if(form){
      const box=document.createElement('div');box.className='wf-quickfill';
      box.innerHTML='<button class="wf-button secondary" type="button">Mit Beispieldaten ausfüllen</button><p>Zum schnellen Ausprobieren. Du kannst alle Angaben anschließend ändern.</p>';
      form.prepend(box);
      box.querySelector('button').addEventListener('click',()=>{
        const fill=(selector,value)=>{const input=form.querySelector(selector);if(input){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}};
        if(slug==='jost-maler'){
          form.querySelector('[name="leistung"][value="innenraum"]').checked=true;
          fill('#ort','Mosbach · Beispielprojekt');fill('#zeitraum','1-3-monate');fill('#projekt-flaeche','48');fill('#projekt-untergrund','Gestrichener Putz');fill('#nachricht','Innenanstrich in Salbeigrün, mit Ausbesserung kleiner Risse.');
        }
        if(slug==='clean-cut'){
          form.querySelector('[data-day="Dienstag"]').click();form.querySelector('[data-time="09:30"]').click();form.querySelector('[data-tag="di"]').click();
          form.querySelector('[data-slot][aria-pressed="false"]')?.click();
        }
        fill('#vorname','Demo');fill('#nachname','Beispiel');fill('#handy','01512345678');fill('[name="flow-name"]','Demo');fill('[name="flow-telefon"]','01512345678');
        box.querySelector('p').textContent='Beispieldaten eingesetzt. Prüfe die Angaben und schließe den Vorgang unten ab.';
      });
    }
    const root=document.querySelector('[data-wf-customer]');
    if(!root)return;
    function render(){
      const requested=new URLSearchParams(location.search).get('id');
      const r=requested?api.get(slug,requested):api.latest(slug);
      if(!r){root.innerHTML='<div class="wf-empty"><h2>Noch kein Vorgang in diesem Tab.</h2><p>Starte auf der Kundenseite. Deine Auswahl erscheint anschließend hier und im Betrieb.</p><a class="wf-button" href="'+c.start+'">Jetzt ausprobieren</a></div>';return;}
      root.innerHTML='<div class="wf-customer-record"><section class="wf-paper"><p class="wf-id">'+escape(r.id)+'</p><h2>'+escape(api.label(slug,r))+'</h2><p class="wf-status-copy">'+escape(c.copies?.[r.status]||({visit:'Der Betrieb hat eine Besichtigung eingeplant. Der Termin steht unten in deiner Projektübersicht.',draft:'Der Betrieb hat einen Leistungsentwurf vorbereitet. Das ist noch kein verbindliches Angebot.',moved:'Der Salon hat deinen Beispieltermin geändert. Die neuen Angaben findest du hier.',ready:'Die Küche hat deine Bestellung als abholbereit markiert.',cooking:'Die Küche bearbeitet jetzt deinen Bestellbon.',cancelled:'Dieser Beispielvorgang wurde abgesagt.',collected:'Diese Beispielbestellung wurde abgeholt.'})[r.status]||'Deine Auswahl ist angekommen. Öffne die Betriebsansicht und bearbeite genau diesen Vorgang.')+'</p>'+api.detailHTML(slug,r)+(r.quote?'<div class="wf-quote"><h3>Vorbereiteter Leistungsumfang</h3><p>'+escape(r.quote)+'</p><small>Entwurf zur Abstimmung · kein verbindlicher Preis</small></div>':'')+'</section><aside class="wf-side"><h2>So geht es weiter</h2>'+api.historyHTML(r)+'<a class="wf-button" href="'+api.url(slug,r.id,true)+'">Im Betrieb weiterbearbeiten</a><a class="wf-link" href="'+c.start+'">Weiteren Vorgang ausprobieren</a></aside></div>';
    }
    render();window.addEventListener('pageshow',render);window.addEventListener('workflowchange',render);
  });
  window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
})();
