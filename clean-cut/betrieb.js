(() => {
  const F=DemoFlow,C=CleanCalendar,slug='clean-cut',root=document.querySelector('[data-wf-operator-root]'),e=F.escape;
  let selected=new URLSearchParams(location.search).get('id')||F.latest(slug)?.id;
  let day=F.get(slug,selected)?.tag||'di';
  function render(){
    const records=F.list(slug),r=F.get(slug,selected);
    const rows=records.filter(p=>p.status!=='cancelled'&&p.tag===day);
    let calendar='<div class="wf-calendar"><div class="wf-calendar-head">Zeit</div>';
    C.week[day].forEach((p,i)=>{calendar+='<div class="wf-calendar-head" style="grid-column:'+(i+2)+'">'+e(p.name)+'</div><div class="wf-calendar-lane" style="grid-column:'+(i+2)+'"></div>';});
    for(let m=540;m<1110;m+=60)calendar+='<div class="wf-calendar-time" style="grid-column:1;grid-row:'+(2+(m-540)/15)+' / span 4">'+C.time(m)+'</div>';
    C.week[day].forEach((p,i)=>{
      p.eintraege.forEach(b=>{calendar+='<div class="wf-cal-event" style="grid-column:'+(i+2)+';grid-row:'+(2+(C.minutes(b.von)-540)/15)+' / span '+Math.max(1,(C.minutes(b.bis)-C.minutes(b.von))/15)+'"><strong>'+e(b.label)+'</strong>'+e(b.von)+'–'+e(b.bis)+'</div>';});
      rows.filter(b=>b.stylist===p.id).forEach(b=>{calendar+='<button type="button" class="wf-cal-event own" data-booking="'+e(b.id)+'" aria-pressed="'+(r?.id===b.id)+'" style="grid-column:'+(i+2)+';grid-row:'+(2+(C.minutes(b.zeit)-540)/15)+' / span '+b.duration/15+'"><strong>'+e(b.id)+' · '+e(b.leistung)+'</strong>'+e(b.zeit)+'–'+C.time(C.minutes(b.zeit)+b.duration)+'</button>';});
    });calendar+='</div>';
    root.innerHTML='<div class="wf-daybar"><label for="calendar-day">Beispielwoche</label><select id="calendar-day">'+Object.entries(C.days).map(([k,n])=>'<option value="'+k+'" '+(k===day?'selected':'')+'>'+n+'</option>').join('')+'</select><span class="wf-note">Grün: deine Buchungen · Grau: feste Beispielbelegung · 3 Plätze</span></div><div class="wf-calendar-scroll" role="region" aria-label="Teamkalender, auf kleinen Displays seitlich scrollbar" tabindex="0">'+calendar+'</div><nav class="wf-appointments" aria-label="Deine Demo-Termine">'+records.map(b=>'<a href="?id='+e(b.id)+'">'+e(b.id)+' · '+e(C.days[b.tag])+' '+e(b.zeit)+' · '+e(F.labels[b.status])+'</a>').join('')+'</nav>'+(r?'<div class="wf-edit-booking" id="termin-bearbeiten"><section class="wf-paper"><p class="wf-id">'+e(r.id)+'</p><h2>'+e(F.labels[r.status])+'</h2>'+F.detailHTML(slug,r)+'<a class="wf-link" href="'+F.url(slug,r.id)+'">Termin aus Kundensicht ansehen</a>'+F.historyHTML(r)+'</section><section class="wf-paper"><h2>Termin verschieben</h2><p class="wf-note">Die Dauer bleibt erhalten. Belegte Zeiten und Pausen werden geprüft.</p><form data-move-form><div class="wf-fields"><label class="wf-field" for="move-day">Beispieltag<select id="move-day">'+Object.entries(C.days).map(([k,n])=>'<option value="'+k+'" '+(r.tag===k?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label class="wf-field" for="move-person">Person<select id="move-person">'+['max','leon','lena'].map(k=>'<option value="'+k+'" '+(r.stylist===k?'selected':'')+'>'+k[0].toUpperCase()+k.slice(1)+'</option>').join('')+'</select></label><label class="wf-field full" for="move-time">Beginn<select id="move-time">'+Array.from({length:19},(_,i)=>C.time(540+i*30)).map(t=>'<option '+(r.zeit===t?'selected':'')+'>'+t+'</option>').join('')+'</select></label></div><p class="wf-error" data-move-error role="alert" hidden></p><div class="wf-actions"><button class="wf-button" type="submit" '+(r.status==='cancelled'?'disabled':'')+'>Änderung übernehmen</button><button class="wf-danger" type="button" data-cancel '+(r.status==='cancelled'?'disabled':'')+'>Termin absagen</button></div></form><p class="wf-success" data-move-result role="status"></p></section></div>':'<div class="wf-empty"><h2>Hier ist Platz für deine erste Buchung.</h2><p>Buche einen Termin auf der Kundenseite. Er erscheint als grüner Eintrag zwischen den festen Beispielterminen.</p><a class="wf-button" href="termin.html">Termin ausprobieren</a></div>');
    root.querySelector('#calendar-day').addEventListener('change',event=>{day=event.target.value;render();root.querySelector('#calendar-day').focus();});
    root.querySelectorAll('[data-booking]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.booking;history.replaceState(null,'','?id='+encodeURIComponent(selected));window.dispatchEvent(new CustomEvent('workflowchange'));render();root.querySelector('#termin-bearbeiten').scrollIntoView();root.querySelector('#move-day').focus();}));
    if(!r)return;
    root.querySelector('[data-move-form]').addEventListener('submit',event=>{
      event.preventDefault();if(r.status==='cancelled')return;
      const tag=root.querySelector('#move-day').value,stylist=root.querySelector('#move-person').value,zeit=root.querySelector('#move-time').value,error=root.querySelector('[data-move-error]');
      const conflict=C.available(stylist,tag,zeit,r.duration,r.id);
      if(conflict){F.error(error,'Dieser Zeitraum ist nicht frei: '+conflict+'. Bitte eine andere Zeit oder Person wählen.');return;}
      F.update(slug,r.id,{tag,stylist,zeit,status:'moved'},'Verschoben: '+C.days[tag]+' '+zeit+' Uhr bei '+stylist);day=tag;render();message('Termin verschoben. Der alte Platz ist wieder frei.');
    });
    root.querySelector('[data-cancel]').addEventListener('click',()=>{if(r.status==='cancelled')return;F.update(slug,r.id,{status:'cancelled'},'Termin abgesagt; Zeit wieder frei');render();message('Termin abgesagt. Die Zeit ist wieder buchbar.');});
  }
  function message(text){const el=root.querySelector('[data-move-result]');el.textContent=text;el.tabIndex=-1;el.focus();}
  render();
})();
