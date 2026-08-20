// PopAlpin — Demo-Interaktionen („Bühne frei").
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  document.documentElement.classList.add('hat-js');

  // Sanfte Reveals — sofort sichtbar bei reduced motion oder ohne IO.
  const reveals = document.querySelectorAll('.reveal');
  const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduziert || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('sichtbar'));
  } else {
    const io = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (eintrag.isIntersecting) {
            eintrag.target.classList.add('sichtbar');
            io.unobserve(eintrag.target);
          }
        }
      },
      { rootMargin: '0px 0px 18% 0px', threshold: 0.05 },
    );
    reveals.forEach((el) => io.observe(el));
    // Sicherheitsnetz: nach 2,5 s ist alles sichtbar (Lehre aus der Ist-Analyse
    // der bestehenden Website — hängende Scroll-Reveals wirken kaputt).
    window.setTimeout(() => reveals.forEach((el) => el.classList.add('sichtbar')), 2500);
  }

  // Header verdichtet sich beim Scrollen.
  const headerZustand = () => {
    document.documentElement.classList.toggle('geschrumpft', window.scrollY > 12);
  };
  headerZustand();
  window.addEventListener('scroll', headerZustand, { passive: true });

  // Statement-Zahlen zählen hoch, sobald sie sichtbar werden — anders als die
  // hängenden Zähler der bestehenden Website: schnell, robust, mit Endwert im
  // Markup als No-JS-/reduced-motion-Fallback.
  const zaehler = document.querySelectorAll('[data-zaehler]');
  if (zaehler.length > 0 && !reduziert && 'IntersectionObserver' in window) {
    const zaehlen = (el) => {
      const ziel = Number(el.getAttribute('data-zaehler'));
      const endtext = el.getAttribute('data-endtext') || String(ziel);
      const suffix = endtext.replace(/^\d+/, '');
      const dauer = 1100;
      const start = performance.now();
      const schritt = (jetzt) => {
        const t = Math.min((jetzt - start) / dauer, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ziel * eased) + suffix;
        if (t < 1) requestAnimationFrame(schritt);
        else el.textContent = endtext.replace('&nbsp;', ' ');
      };
      requestAnimationFrame(schritt);
    };
    const zahlenIo = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (eintrag.isIntersecting) {
            zaehlen(eintrag.target);
            zahlenIo.unobserve(eintrag.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    zaehler.forEach((el) => zahlenIo.observe(el));
  }

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Vorauswahl aus Query-Params (?anlass=, ?besetzung=, ?datum=).
  const parameter = new URLSearchParams(window.location.search);
  for (const feldName of ['anlass', 'besetzung']) {
    const wert = parameter.get(feldName);
    if (!wert) continue;
    const radio = form.querySelector(
      `input[name="${feldName}"][value="${CSS.escape(wert)}"]`,
    );
    if (radio) radio.checked = true;
  }

  const datumFeld = form.querySelector('#datum');
  const heute = new Date();
  const heuteWert = [
    heute.getFullYear(),
    String(heute.getMonth() + 1).padStart(2, '0'),
    String(heute.getDate()).padStart(2, '0'),
  ].join('-');
  datumFeld.min = heuteWert;
  const datumParam = parameter.get('datum');
  if (datumParam && /^\d{4}-\d{2}-\d{2}$/.test(datumParam)) {
    datumFeld.value = datumParam;
  }

  const fehlerBox = document.querySelector('[data-fehler]');
  const fehlerListe = document.querySelector('[data-fehler-liste]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');

  const anlassNamen = {
    hochzeit: 'Hochzeit',
    gala: 'Gala-Abend',
    geburtstag: 'Geburtstag',
    fastnacht: 'Fastnacht',
    festzelt: 'Festzelt',
    vereinsfest: 'Vereinsfest',
  };
  const besetzungNamen = {
    dj: 'DJ',
    duo: 'Duo',
    trio: 'Trio',
    band: 'Komplette Band',
    offen: 'Noch unsicher — Beratung gewünscht',
  };
  const gaesteNamen = {
    'bis-50': 'bis 50 Gäste',
    '50-100': '50–100 Gäste',
    '100-300': '100–300 Gäste',
    'ueber-300': 'über 300 Gäste',
  };
  const technikNamen = {
    band: 'Komplett von der Band',
    location: 'Location hat Technik',
    offen: 'Noch unklar',
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const daten = new FormData(form);
    const probleme = [];

    const anlass = daten.get('anlass');
    if (!anlass) probleme.push('Bitte wählen Sie einen Anlass (Schritt 1).');

    const datum = String(daten.get('datum') || '');
    if (!datum) {
      probleme.push('Bitte geben Sie einen Wunschtermin an (Schritt 2).');
    } else if (datum < heuteWert) {
      probleme.push('Der Wunschtermin liegt in der Vergangenheit (Schritt 2).');
    }

    const name = String(daten.get('name') || '').trim();
    if (!name) probleme.push('Bitte geben Sie Ihren Namen an (Schritt 5).');

    const mail = String(daten.get('mail') || '').trim();
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      probleme.push('Bitte geben Sie eine gültige E-Mail-Adresse an (Schritt 5).');
    }

    if (!daten.get('demo-ok')) {
      probleme.push('Bitte bestätigen Sie den Demo-Hinweis (Schritt 5).');
    }

    if (probleme.length > 0) {
      fehlerListe.replaceChildren(
        ...probleme.map((text) => {
          const li = document.createElement('li');
          li.textContent = text;
          return li;
        }),
      );
      fehlerBox.classList.add('aktiv');
      bestaetigung.classList.remove('aktiv');
      fehlerBox.focus();
      return;
    }

    fehlerBox.classList.remove('aktiv');

    const zeilen = [
      ['Anlass', anlassNamen[anlass] || '—'],
      ['Termin', datum.split('-').reverse().join('.')],
      ['Beginn', daten.get('uhrzeit') ? `ca. ${daten.get('uhrzeit')} Uhr (Beispiel)` : 'Noch offen'],
      ['Ort', String(daten.get('ort') || '').trim() || 'Noch offen'],
      ['Besetzung', besetzungNamen[daten.get('besetzung')] || 'Noch offen'],
      ['Gästezahl', gaesteNamen[daten.get('gaeste')] || 'Noch offen'],
      ['Technik', technikNamen[daten.get('technik')] || 'Noch offen'],
      ['Wünsche', String(daten.get('wuensche') || '').trim() || '—'],
      ['Kontakt', `${name} · ${mail}`],
    ];
    zusammenfassung.replaceChildren(
      ...zeilen.flatMap(([begriff, wert]) => {
        const dt = document.createElement('dt');
        dt.textContent = begriff;
        const dd = document.createElement('dd');
        dd.textContent = wert;
        return [dt, dd];
      }),
    );

    bestaetigung.classList.add('aktiv');
    bestaetigung.scrollIntoView({ behavior: reduziert ? 'auto' : 'smooth', block: 'start' });
  });
})();
