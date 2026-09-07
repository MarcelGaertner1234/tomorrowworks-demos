(() => {
  'use strict';
  const hero = document.querySelector('[data-stay]');
  if (!hero) return;
  const image = hero.querySelector('.stay-image');
  const text = hero.querySelector('[data-stay-caption]');
  const rooms = {
    haus: {image:'fachwerk-fassade.jpg', title:'Ankommen in der Altstadt', copy:'Fachwerk, kleine Gassen und ein Zimmer zum Zurückziehen.', alt:'Fachwerkhaus in einer Altstadtgasse – Symbolbild'},
    renoviert: {image:'zimmer-renoviert.jpg', title:'Renoviert 2020', copy:'Helle Töne und eine klare Einrichtung. Beispielpreis ab 79 € pro Nacht.', alt:'Helles Hotelzimmer – beispielhafte Zimmeransicht'},
    landhaus: {image:'zimmer-landhaus.jpg', title:'Landhausstil', copy:'Holz und warme Materialien. Beispielpreis ab 72 € pro Nacht.', alt:'Hotelzimmer im Landhausstil – beispielhafte Zimmeransicht'},
    klimatisiert: {image:'zimmer-warm.jpg', title:'Klimatisiert · 3. Stock', copy:'Ein Rückzugsort für Ihre Auszeit. Beispielpreis ab 85 € pro Nacht.', alt:'Behagliches Hotelzimmer – beispielhafte Zimmeransicht'}
  };
  const form = document.querySelector('[data-hotel-form]');
  function show(key, sync = true) {
    const room = rooms[key]; if (!room) return;
    if (hero.dataset.view !== key) {
      image.src = 'assets/' + room.image; image.alt = room.alt;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) image.animate([{opacity:.35,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'ease-out'});
    }
    hero.dataset.view = key;
    hero.querySelectorAll('[data-stay-room]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.stayRoom === key)));
    const heading = document.createElement('strong'); heading.textContent = room.title;
    text.replaceChildren(heading, document.createTextNode(room.copy));
    if (key !== 'haus') {
      form.elements.zimmertyp.value = key;
      if (sync) document.querySelector('[data-planer-zimmer="'+key+'"]').click();
    }
  }
  hero.querySelectorAll('[data-stay-room]').forEach(b => b.addEventListener('click', () => show(b.dataset.stayRoom)));
  document.querySelectorAll('[data-planer-zimmer]').forEach(b => b.addEventListener('click', () => show(b.dataset.planerZimmer, false)));
  form.elements.zimmertyp.addEventListener('change', () => show(form.elements.zimmertyp.value));
  document.querySelector('[data-planer-cta]').addEventListener('click', () => {
    if (document.querySelector('[data-planer-cta]').getAttribute('aria-disabled') === 'true') return;
    const p = document.querySelector('[name="planer-personen"]:checked');
    form.elements.personen.value = p.value;
  });
})();
