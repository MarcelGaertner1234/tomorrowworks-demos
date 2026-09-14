(() => {
 'use strict';
 const farben = { original: ['Erde', '#b85c2c'], kueste: ['Küste', '#205c91'], wald: ['Wald', '#35613c'], graphit: ['Graphit', '#505557'] };
 const schriften = { klassisch: 'Klassisch · Georgia', modern: 'Klar · Arial', weich: 'Freundlich · Trebuchet' };
 const params = new URLSearchParams(location.search);
 let farbe = Object.hasOwn(farben, params.get('farbe')) ? params.get('farbe') : 'original';
 let schrift = Object.hasOwn(schriften, params.get('schrift')) ? params.get('schrift') : 'klassisch';
 const anwenden = () => {
  document.documentElement.dataset.farbe = farbe;
  document.documentElement.dataset.schrift = schrift;
 };
 anwenden();
 document.addEventListener('DOMContentLoaded', () => {
  const panel = document.createElement('details');
  panel.className = 'gestaltung';
  panel.innerHTML = `<summary>Farben & Schrift ausprobieren</summary>
   <div class="gestaltung-inhalt"><p>Wie soll Ihre Website aussehen? Wählen Sie eine Farbwelt und einen Schriftstil.</p>
   <div class="gestaltung-gruppen">
    <fieldset><legend>Farbwelt</legend><div class="gestaltung-optionen">${Object.entries(farben).map(([key, [name, hex]]) => `<button type="button" data-color="${key}" aria-pressed="false"><span class="farbpunkt" style="--probe:${hex}" aria-hidden="true"></span>${name}</button>`).join('')}</div></fieldset>
    <fieldset><legend>Schriftstil</legend><div class="gestaltung-optionen">${Object.entries(schriften).map(([key, name]) => `<button type="button" data-font="${key}" aria-pressed="false">${name}</button>`).join('')}</div></fieldset>
    <button type="button" data-reset>Zurücksetzen</button>
   </div><p class="gestaltung-status" aria-live="polite"></p></div>`;
  document.querySelector('.banner').after(panel);
  const aktualisieren = () => {
   anwenden();
   panel.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === farbe)));
   panel.querySelectorAll('[data-font]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.font === schrift)));
   panel.querySelector('.gestaltung-status').textContent = `Aktuell: ${farben[farbe][0]} · ${schriften[schrift]}. Die Auswahl wird zur Anfrageseite mitgenommen.`;
   const url = new URL(location.href);
   url.searchParams.set('farbe', farbe);
   url.searchParams.set('schrift', schrift);
   try { history.replaceState(null, '', url); } catch { /* Offline-Vorschau bleibt bedienbar. */ }
  };
  panel.addEventListener('click', event => {
   const button = event.target.closest('button');
   if (!button) return;
   if (button.dataset.color) farbe = button.dataset.color;
   if (button.dataset.font) schrift = button.dataset.font;
   if (button.hasAttribute('data-reset')) { farbe = 'original'; schrift = 'klassisch'; }
   aktualisieren();
  });
  // Nur Gestaltungswerte weitergeben. Formulareingaben bleiben auf der Seite.
  document.addEventListener('click', event => {
   const link = event.target.closest('a[href]');
   if (!link || link.getAttribute('aria-disabled') === 'true') return;
   const href = link.getAttribute('href');
   if (href.startsWith('#')) return;
   const url = new URL(href, location.href);
   if (url.origin !== location.origin || !/\/(index|anfrage)\.html$/.test(url.pathname)) return;
   url.searchParams.set('farbe', farbe);
   url.searchParams.set('schrift', schrift);
   link.href = url.href;
  }, true);
  // Initialzustand anzeigen, URL bis zur ersten Auswahl unverändert lassen.
  panel.querySelector(`[data-color="${farbe}"]`).setAttribute('aria-pressed', 'true');
  panel.querySelector(`[data-font="${schrift}"]`).setAttribute('aria-pressed', 'true');
  panel.querySelector('.gestaltung-status').textContent = `Aktuell: ${farben[farbe][0]} · ${schriften[schrift]}. Die Auswahl wird zur Anfrageseite mitgenommen.`;
 });
})();
