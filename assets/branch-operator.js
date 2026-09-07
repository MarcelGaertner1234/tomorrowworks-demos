(() => {
  'use strict';
  const F=DemoFlow,B=BranchDemo,slug=document.body.dataset.demo,c=BranchDefinitions[slug],e=F.escape;
  const root=document.querySelector('[data-branch-operator]');
  let selected=new URLSearchParams(location.search).get('id')||F.latest(slug)?.id;
  const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
  const dated=(date,days)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const duration=r=>c.kind==='treatment'?({klassik:60,'klassik-plus':75,komfort:90,'anti-aging':90,sensibelchen:60}[r.data.behandlung]||60)+15:c.kind==='coaching'?30:60;
  const allDay=['event','dispatch'].includes(c.kind);
  const isHotel=c.kind==='hotel';
  const units=c.resources;
  const defaultDate=r=>r.plan?.date||r.data.anreise||r.data.datum||r.data.termin||B.date(14);
  const inferredVolume=r=>{const n=Number.parseInt(r.data.groesse,10);return Number(r.data.volumen)||(({1:15,2:25,3:35,4:50}[n]||20)+(r.data.keller==='ja'?5:0));};
  function collision(r,p){
    const others=F.list(slug).filter(x=>x.id!==r.id&&x.status!=='cancelled'&&x.plan);
    if(isHotel)return others.some(x=>x.plan.resource===p.resource&&p.date<x.plan.end&&p.end>x.plan.date);
    const dates=p.dates||[p.date];
    return others.some(x=>x.plan.resource===p.resource&&dates.some(d=>(x.plan.dates||[x.plan.date]).includes(d))&&(allDay||minutes(p.time)<minutes(x.plan.time)+x.plan.duration&&minutes(p.time)+p.duration>minutes(x.plan.time)));
  }
  function planForm(r){
    const chosen=r.plan?.resource||units[0],day=defaultDate(r);
    const title=({hotel:'Zimmer zuordnen',event:'Auftritt einplanen',dispatch:'Team und Fahrzeug',route:'Besichtigung einplanen',property:'Arbeiten zuordnen',cleaning:'Einsatz einplanen'})[c.kind]||'Termin einplanen';
    const note=isHotel?'Zimmer und Zeitraum sind Beispiele. Überschneidungen werden beim Einplanen geprüft.':allDay?'Eine Besetzung oder ein Team übernimmt in dieser Demo einen Auftrag pro Tag.':'Beispielkalender: 10:00–11:00 Uhr ist täglich belegt. Planungszeit zwischen 08:00 und 18:00 Uhr.';
    return '<form data-branch-plan><h2>'+title+'</h2><p class="branch-help">'+note+'</p><div class="wf-fields"><label class="wf-field full" for="branch-resource">'+(isHotel?'Beispielzimmer':'Zuordnung')+'<select id="branch-resource">'+units.map(x=>'<option '+(x===chosen?'selected':'')+'>'+e(x)+'</option>').join('')+'</select></label><label class="wf-field" for="branch-date">'+(isHotel?'Anreise':'Datum')+'<input id="branch-date" type="date" value="'+e(day)+'" min="'+B.date(0)+'" required></label>'+(isHotel?'<label class="wf-field" for="branch-end">Abreise<input id="branch-end" type="date" value="'+e(r.plan?.end||r.data.abreise||dated(day,2))+'" required></label>':allDay?'':'<label class="wf-field" for="branch-time">Beginn<input id="branch-time" type="time" value="'+e(r.plan?.time||'08:00')+'" min="08:00" max="17:00" required></label>')+(c.kind==='cleaning'?'<label class="wf-field full" for="branch-repeat">Beispielserie<select id="branch-repeat"><option value="0">Ein einzelner Einsatz</option><option value="7" '+((r.plan?.repeat ?? (r.data.frequenz==='woechentlich'?7:0))===7?'selected':'')+'>Drei wöchentliche Einsätze</option><option value="2" '+((r.plan?.repeat ?? (r.data.frequenz==='mehrmals'?2:0))===2?'selected':'')+'>Drei Einsätze im Abstand von zwei Tagen</option><option value="1" '+((r.plan?.repeat ?? (r.data.frequenz==='taeglich'?1:0))===1?'selected':'')+'>Drei tägliche Einsätze</option></select></label>':'')+'</div>'+(!isHotel&&!allDay?'<p class="branch-help">'+duration(r)+' Minuten eingeplant'+(c.kind==='treatment'?' einschließlich 15 Minuten Puffer':'')+' · Beispieldauer</p>':'')+'<button class="wf-button" type="submit">'+(r.plan?'Planung ändern':'Einplanen')+'</button></form>';
  }
  function bookable(r,resource){
    const p={resource,date:defaultDate(r),end:r.plan?.end||r.data.abreise};
    return !p.end||!collision(r,p);
  }
  function specialty(r){
    const d=r.data;
    if(isHotel)return '<div class="branch-room-board">'+units.map((name,i)=>'<div class="branch-room '+(!bookable(r,name)?'busy':'')+'"><span>'+e(name)+'</span><strong>'+(r.plan?.resource===name&&r.status!=='cancelled'?'Zugeordnet':!bookable(r,name)?'Belegt':'Frei')+'</strong><small>im angefragten Zeitraum</small></div>').join('')+'</div>';
    if(['route','dispatch'].includes(c.kind))return '<div class="branch-route"><div><span>Start</span><strong>'+e(d.von||'Noch offen')+'</strong></div><span aria-hidden="true">→</span><div><span>Ziel</span><strong>'+e(d.nach||'Noch offen')+'</strong></div></div>'+(c.kind==='dispatch'?'<p class="branch-callout">Planungswert: bis '+inferredVolume(r)+' m³ · aus der gewählten Größe abgeleitet, vor Ort zu prüfen.</p>':'');
    if(c.kind==='florist')return '<div class="branch-greeting"><span>Die Worte zum Strauß</span><p>'+e(d.gruss||'Keine Grußkarte gewünscht.')+'</p></div>';
    if(c.kind==='retail'&&r.items)return '<div class="branch-stock">'+r.items.map(i=>'<div><strong>'+e(i.name)+'</strong><span>Größe '+e(i.groesse)+' · '+i.menge+' gewünscht</span><b>'+(r.stockHeld?i.menge+' für diesen Vorgang zurückgelegt':stock(r,i)+' im Beispielbestand verfügbar')+'</b></div>').join('')+'</div>';
    if(c.kind==='consult')return '<div class="branch-brief"><span>Aus der Ringgestaltung</span><p>'+e(d.nachricht||'Die Gestaltung wird beim Beratungsgespräch festgelegt.')+'</p></div>';
    if(c.kind==='event')return '<div class="branch-event"><div><span>Veranstaltung</span><strong>'+e(r.fields.find(f=>f[0]==='Anlass')?.[1]||'Anlass offen')+'</strong></div><div><span>Besetzung</span><strong>'+e(r.fields.find(f=>f[0]==='Besetzung')?.[1]||'Noch abstimmen')+'</strong></div><div><span>Technik</span><strong>'+e(r.fields.find(f=>f[0]==='Technik')?.[1]||'Noch abstimmen')+'</strong></div></div>';
    if(c.kind==='coaching')return '<blockquote class="branch-conversation">'+e(r.fields.find(f=>f[0]==='Anliegen')?.[1]||'Raum für ein erstes Gespräch')+'<small>Das Anliegen gibt dem Kennenlernen eine Richtung.</small></blockquote>';
    if(c.kind==='treatment')return '<div class="branch-duration"><strong>'+duration(r)+'<small>Minuten eingeplant</small></strong><span>Beispieldauer der gewählten Behandlung<br>mit 15 Minuten Puffer</span></div>';
    if(c.kind==='vehicle')return '<div class="branch-vehicle"><span>Fahrzeugakte</span><strong>'+e(d['probefahrt-fahrzeug']?r.fields.find(f=>f[0].includes('Probefahrt'))?.[1]||d.fahrzeug||'Gewähltes Beispielfahrzeug':d.fahrzeug||'Fahrzeug im Gespräch festlegen')+'</strong></div>';
    return '<div class="branch-object"><span>Arbeitsauftrag am Objekt</span><strong>'+e(d.objekt||r.fields.find(f=>f[0]==='Objektart')?.[1]||'Objekt zur Abstimmung')+'</strong><p>'+e(d.beschreibung||r.fields.find(f=>f[0]==='Leistung')?.[1]||'Leistungsumfang gemeinsam klären')+'</p></div>';
  }
  function stock(r,item){
    const base=['44','XXL'].includes(item.groesse)?0:3;
    return Math.max(0,base-F.list(slug).filter(x=>x.id!==r.id&&(x.stockHeld||['held','done'].includes(x.status))).reduce((n,x)=>n+(x.items||[]).filter(i=>i.productId===item.productId&&i.groesse===item.groesse).reduce((a,i)=>a+i.menge,0),0));
  }
  function actions(r){
    if(r.status==='cancelled'||r.status==='done')return '<h2>'+e(F.label(slug,r))+'</h2><p class="branch-help">Der Verlauf und die dokumentierten Angaben bleiben in der Kundensicht erhalten.</p>';
    const production=c.kind==='florist',retail=c.kind==='retail'&&r.items;
    const steps=production?'<h2>Am Bindetisch</h2><p class="branch-help">Abholung am '+e(r.data.datum)+' · '+e(r.fields.find(f=>f[0]==='Beginn / Abholzeit')?.[1]||'Zeit offen')+'</p>'+(r.status==='new'||r.status==='question'?'<button class="wf-button" data-branch-action="work">Mit dem Binden beginnen</button>':''):retail?'<h2>Auswahl zurücklegen</h2><p class="branch-help">Beispielbestand: drei Stück pro Artikel und Größe. Größe 44 und XXL sind als ausverkauft hinterlegt.</p>'+(!['held'].includes(r.status)?'<button class="wf-button" data-branch-action="held">Bestand prüfen und zurücklegen</button>':''):units.length?planForm(r):'<h2>Beratungsanfrage bearbeiten</h2>';
    const ready=production?['work','ready'].includes(r.status):retail?r.status==='held':!!r.plan||!units.length;
    return steps+(ready?'<form data-branch-finish class="branch-finish"><h3>'+e(production?'Strauß prüfen':retail?'Ausgabe vorbereiten':'Nächsten Schritt dokumentieren')+'</h3><div class="branch-checks">'+c.checks.map((t,i)=>'<label><input type="checkbox" name="check" value="'+i+'" '+(r.checked?.includes(t)?'checked':'')+'><span>'+e(t)+'</span></label>').join('')+'</div><label class="wf-field" for="branch-note">'+e(c.kind==='event'?'Ablauf und Absprachen':c.kind==='coaching'?'Vereinbarter nächster Schritt':'Rückmeldung / Notiz')+'<textarea id="branch-note" maxlength="1500" placeholder="Was wurde vereinbart?">'+e(r.note||'')+'</textarea></label><button class="wf-button" type="submit">'+(production&&r.status!=='ready'?'Als abholbereit markieren':production?'Abholung abschließen':retail?(r.data.abwicklung==='lieferung'?'Versandvorbereitung abschließen':r.data.abwicklung==='anprobe'?'Anprobe abschließen':'Abholung abschließen'):e(c.states.done))+'</button></form>':'')+'<details class="branch-exception"><summary>Rückfrage oder Absage</summary><label class="wf-field" for="branch-question">Was muss noch geklärt werden?<textarea id="branch-question" maxlength="1000" placeholder="Zum Beispiel: Bitte einen anderen Termin abstimmen."></textarea></label><button class="wf-button secondary" data-branch-action="question">Rückfrage festhalten</button><button class="wf-danger" data-branch-action="cancelled">Vorgang absagen</button></details>';
  }
  function render(){
    const r=F.get(slug,selected),records=F.list(slug);
    if(!r){root.innerHTML='<div class="wf-empty"><h2>Der nächste Vorgang beginnt beim Kunden.</h2><p>Eine Auswahl auf der Homepage wird hier zur bearbeitbaren Akte. Starte auf der Kundenseite und nutze auf Wunsch die Beispieleingabe.</p><a class="wf-button" href="'+c.start+'">Auf Kundenseite ausprobieren</a></div>';return;}
    root.innerHTML='<nav class="branch-case-list" aria-label="Vorgänge">'+records.map(x=>'<a href="?id='+e(x.id)+'" '+(x.id===r.id?'aria-current="page"':'')+'><b>'+e(x.id)+'</b><span>'+e(F.label(slug,x))+'</span></a>').join('')+'</nav><div class="branch-workspace"><section class="wf-paper branch-case"><div class="branch-case-head"><p class="wf-id">'+e(r.id)+'</p><span>'+e(F.label(slug,r))+'</span></div>'+specialty(r)+F.detailHTML(slug,r)+'<a class="wf-link" href="'+F.url(slug,r.id)+'">Diesen Vorgang aus Kundensicht ansehen</a>'+F.historyHTML(r)+'</section><aside class="branch-actions"><div class="wf-error" data-branch-error role="alert" hidden></div><p class="wf-success" data-branch-result role="status"></p>'+actions(r)+'</aside></div>';
    const fail=message=>F.error(root.querySelector('[data-branch-error]'),message);
    const commit=(patch,text)=>{try{F.update(slug,r.id,patch,text);render();const out=root.querySelector('[data-branch-result]');out.textContent=text+'. Auch in der Kundensicht sichtbar.';out.tabIndex=-1;out.focus();}catch(error){fail(error.message);}};
    root.querySelector('[data-branch-plan]')?.addEventListener('submit',event=>{
      event.preventDefault();const p={resource:root.querySelector('#branch-resource').value,date:root.querySelector('#branch-date').value};
      if(!p.date||p.date<B.date(0)){fail('Bitte ein Datum ab heute wählen.');return;}
      if(isHotel){
        p.end=root.querySelector('#branch-end').value;
        if(!p.end||p.end<=p.date){fail('Die Abreise muss nach der Anreise liegen.');return;}
        if(slug==='am-waldrand'&&Number(r.data.personen)>([1,2,4,5][units.indexOf(p.resource)]||1)){fail('Dieses Beispielzimmer ist für die Personenzahl zu klein. Bitte eine passende Zimmeroption wählen oder eine Rückfrage festhalten.');return;}
      }else{
        p.time=allDay?'08:00':root.querySelector('#branch-time').value;p.duration=allDay?600:duration(r);
        if(!allDay&&(!p.time||minutes(p.time)<480||minutes(p.time)+p.duration>1080)){fail('Der Termin muss einschließlich Puffer zwischen 08:00 und 18:00 Uhr liegen.');return;}
        if(!allDay&&minutes(p.time)<660&&minutes(p.time)+p.duration>600){fail('10:00–11:00 Uhr ist im Beispielkalender belegt. Bitte eine andere Zeit wählen.');return;}
        const repeat=Number(root.querySelector('#branch-repeat')?.value||0);p.repeat=repeat;p.dates=repeat?[p.date,dated(p.date,repeat),dated(p.date,repeat*2)]:[p.date];
        if(c.kind==='dispatch'&&inferredVolume(r)>(p.resource===units[0]?20:60)){fail('Der Planungswert übersteigt die Beispielkapazität des Fahrzeugs. Bitte ein größeres Fahrzeug wählen oder den Umfang rückfragen.');return;}
      }
      if(collision(r,p)){fail('Diese Zuordnung überschneidet sich mit einem anderen Vorgang. Bitte Datum, Uhrzeit oder Ressource ändern.');return;}
      commit({plan:p,status:'planned',checked:[]},c.states.planned+' · '+p.resource);
    });
    root.querySelectorAll('[data-branch-action]').forEach(button=>button.addEventListener('click',()=>{
      const status=button.dataset.branchAction,patch={status};
      if(status==='held'){
        patch.stockHeld=true;
        const missing=r.items.find(i=>i.menge>stock(r,i));
        if(missing){fail('Nicht ausreichend verfügbar: '+missing.name+' in Größe '+missing.groesse+'. Bitte eine Rückfrage festhalten.');return;}
      }
      if(status==='question'||status==='cancelled'){
        patch.note=root.querySelector('#branch-question').value.trim();
        if(!patch.note){fail('Bitte den Grund oder die Rückfrage eingeben, damit die Kundensicht den nächsten Schritt erklärt.');return;}
        if(status==='cancelled'){patch.plan=null;patch.stockHeld=false;}
      }
      commit(patch,F.label(slug,{status}));
    }));
    root.querySelector('[data-branch-finish]')?.addEventListener('submit',event=>{
      event.preventDefault();const checked=[...root.querySelectorAll('[name="check"]:checked')].map(i=>c.checks[Number(i.value)]);
      if(checked.length!==c.checks.length){fail('Bitte zuerst alle aufgeführten Aufgaben prüfen und abhaken.');return;}
      const note=root.querySelector('#branch-note').value.trim();
      if(['consult','coaching','event'].includes(c.kind)&&!note){fail('Bitte den vereinbarten nächsten Schritt oder Ablauf kurz festhalten.');return;}
      const status=c.kind==='florist'&&r.status!=='ready'?'ready':'done';
      commit({status,checked,note},F.label(slug,{status}));
    });
  }
  render();
})();
