(() => {
  const F=DemoFlow,slug='jost-maler',root=document.querySelector('[data-wf-operator-root]'),e=F.escape;
  const params=new URLSearchParams(location.search);
  const records=F.list(slug);
  let selected=params.get('id') || F.latest(slug)?.id;
  function render(){
    const r=F.get(slug,selected);
    if(!r){root.innerHTML='<div class="wf-empty"><h2>Die nächste Projektakte beginnt beim Kunden.</h2><p>Wähle die Farbidee und beschreibe einen Raum. Die Anfrage mit Fläche, Untergrund und Wunschzeitraum kommt genau hier an.</p><a class="wf-button" href="anfrage.html?leistung=innenraum&inspiration=salbei">Erstes Raumprojekt anfragen</a></div>';return;}
    root.innerHTML='<div class="wf-project-layout"><nav class="wf-project-list" aria-label="Projektakten">'+F.list(slug).map(p=>'<a href="?id='+e(p.id)+'" '+(p.id===r.id?'aria-current="page"':'')+'>'+e(p.id)+'<small>'+e(p.service)+'</small><small>'+e(F.labels[p.status])+'</small></a>').join('')+'</nav><section class="wf-paper"><p class="wf-id">'+e(r.id)+'</p><h2>'+e(r.service)+'</h2><img class="wf-room-strip" src="assets/wow-room-after.webp" alt="Generierte Raumidee in Salbeigrün"><p class="wf-note">Beispielmotiv · die Projektangaben stehen unten</p>'+F.detailHTML(slug,r)+(r.quote?'<div class="wf-quote"><h3>Leistungsentwurf</h3><p>'+e(r.quote)+'</p><small>Zur Abstimmung, noch kein Angebot.</small></div>':'')+'<a class="wf-link" href="'+F.url(slug,r.id)+'">Diesen Vorgang aus Kundensicht ansehen</a></section><aside class="wf-side"><h2>Besichtigung planen</h2><p class="wf-plan-note">Beispielkalender: 10:00–11:00 Uhr ist bereits belegt. Besichtigungen dauern hier eine Stunde, zwischen 08:00 und 17:00 Uhr.</p><form data-visit-form><div class="wf-fields"><label class="wf-field full" for="visit-date">Besichtigung am<input id="visit-date" type="date" required></label><label class="wf-field full" for="visit-time">Beginn<select id="visit-time">'+['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'].map(t=>'<option>'+t+'</option>').join('')+'</select></label></div><p class="wf-error" data-visit-error role="alert" hidden></p><button class="wf-button" type="submit">Besichtigung einplanen</button></form><p class="wf-success" data-visit-result role="status"></p><button class="wf-button secondary" data-draft '+(!r.visit?'disabled':'')+'>Leistungsentwurf vorbereiten</button><p class="wf-note" style="margin-top:12px">Nach der Terminplanung wird aus den Angaben ein Entwurf zur Abstimmung.</p>'+F.historyHTML(r)+'</aside></div>';
    const date=root.querySelector('#visit-date'),time=root.querySelector('#visit-time'),error=root.querySelector('[data-visit-error]');
    const now=new Date();now.setDate(now.getDate()+1);const iso=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    date.min=iso;date.value=r.visit?r.visit.split('T')[0]:iso;if(r.visit)time.value=r.visit.split('T')[1];
    root.querySelector('[data-visit-form]').addEventListener('submit',event=>{
      event.preventDefault();const visit=date.value+'T'+time.value;
      if(!date.value || date.value<iso){F.error(error,'Bitte einen Tag ab morgen wählen.');return;}
      if(time.value==='10:00' || F.list(slug).some(p=>p.id!==r.id && p.visit===visit)){F.error(error,'Diese Stunde ist im Beispielkalender belegt. Bitte eine andere Zeit wählen.');return;}
      try{F.update(slug,r.id,{status:'visit',visit,quote:null},'Besichtigung eingeplant: '+date.value+' um '+time.value+' Uhr');render();const result=root.querySelector('[data-visit-result]');result.textContent='Besichtigung geplant. Der Termin ist jetzt auch in der Kundensicht sichtbar.';result.tabIndex=-1;result.focus();}catch(err){F.error(error,err.message);}
    });
    root.querySelector('[data-draft]').addEventListener('click',()=>{
      const current=F.get(slug,r.id);if(!current.visit)return;
      const quote=[current.service,current.area?'Erfasste Wandfläche: '+current.area+' m²':'Aufmaß bei Besichtigung aufnehmen','Untergrund: '+(current.surface||'vor Ort prüfen'),current.notes?'Wünsche: '+current.notes:'Farbton bei Besichtigung abstimmen','Vor Ort klären: Untergrundvorbereitung, Abdeckarbeiten und genaue Ausführung.'].join('\n');
      F.update(slug,r.id,{status:'draft',quote},'Leistungsentwurf zur Abstimmung vorbereitet');render();const result=root.querySelector('[data-visit-result]');result.textContent='Leistungsentwurf vorbereitet. Er ist auch in der Kundensicht sichtbar.';result.tabIndex=-1;result.focus();
    });
  }
  render();
})();
