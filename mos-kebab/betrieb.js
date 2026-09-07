(() => {
  const F=DemoFlow,slug='mos-kebab',root=document.querySelector('[data-wf-operator-root]'),e=F.escape;
  function render(){
    const records=F.list(slug);
    if(!records.length){root.innerHTML='<div class="wf-empty"><h2>Die Küche wartet auf deinen ersten Bon.</h2><p>Stell dein Essen zusammen und wähle eine Abholzeit. Hier bearbeitest du danach genau diese Bestellung.</p><a class="wf-button" href="index.html#speisekarte">Bestellung ausprobieren</a></div>';return;}
    root.innerHTML='<p class="wf-success" data-kitchen-result role="status"></p><div class="wf-kitchen">'+['received','cooking','ready'].map(status=>{
      const orders=records.filter(r=>r.status===status);
      return '<section class="wf-kitchen-column"><h2>'+F.labels[status]+'<span>'+orders.length+'</span></h2>'+(!orders.length?'<p class="wf-ticket-empty">Hier ist gerade kein Bon.</p>':orders.map(r=>'<article class="wf-ticket" id="'+e(r.id)+'"><p class="wf-id">'+e(r.id)+'</p><p class="wf-ticket-time"><span>Abholung</span><strong>'+e(r.time)+' Uhr</strong></p><ul class="wf-ticket-items">'+r.items.map(i=>'<li><b>'+i.quantity+'×</b><span>'+e(i.name)+'</span></li>').join('')+'</ul>'+(r.notes?'<p class="wf-ticket-note">'+e(r.notes)+'</p>':'')+'<button class="wf-button" type="button" data-order="'+e(r.id)+'" data-next="'+({received:'cooking',cooking:'ready',ready:'collected'})[status]+'">'+({received:'Zubereitung starten',cooking:'Abholbereit melden',ready:'Als abgeholt abschließen'})[status]+'</button><a class="wf-link" href="'+F.url(slug,r.id)+'">Kundenstatus ansehen</a>'+(status==='received'?'<button class="wf-danger" data-order="'+e(r.id)+'" data-next="cancelled" type="button" style="display:block;font-size:12px">Nicht verfügbar: Bestellung absagen</button>':'')+'</article>').join(''))+'</section>';
    }).join('')+'</div><div class="wf-archive"><h3>Abgeschlossen / abgesagt</h3>'+records.filter(r=>['collected','cancelled'].includes(r.status)).map(r=>'<a href="'+F.url(slug,r.id)+'">'+e(r.id)+' · '+e(F.labels[r.status])+'</a>').join('')+'</div>';
    root.querySelectorAll('[data-order]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.order,r=F.get(slug,id),next=b.dataset.next;
      const allowed={received:['cooking','cancelled'],cooking:['ready'],ready:['collected']};
      if(!allowed[r.status]?.includes(next))return;
      history.replaceState(null,'','?id='+encodeURIComponent(id));
      F.update(slug,id,{status:next},next==='cancelled'?'Bestellung abgesagt: in diesem Beispiel nicht verfügbar':F.labels[next]);render();
      const out=root.querySelector('[data-kitchen-result]');out.textContent=id+' · '+F.labels[next]+'. Der Kundenstatus ist aktualisiert.';out.tabIndex=-1;out.focus();
    }));
  }
  render();
})();
