// Blumen Viva — Demo-Interaktionen (Strauß-Konfigurator + Strauß-Anfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.

// --- Strauß-Konfigurator (Startseite) ---
// Anlass + Farbwelt + Umfang ergeben live ein Vorschau-Foto, einen Satz und den
// Anfrage-Link. Es werden ausschließlich die vorhandenen Farbwelten-Fotos getauscht.
(() => {
  'use strict';

  const konfigurator = document.querySelector('[data-konfigurator]');
  if (!konfigurator) return;

  const bild = konfigurator.querySelector('[data-konf-bild]');
  const huelle = konfigurator.querySelector('[data-konf-huelle]');
  const satz = konfigurator.querySelector('[data-konf-satz]');
  const cta = konfigurator.querySelector('[data-konf-cta]');
  if (!bild || !huelle || !satz || !cta) return;

  const anlaesse = {
    geburtstag: { auftakt: 'Ihr Strauß', schluss: 'zum Geburtstag', cta: 'Diesen Strauß anfragen' },
    'liebe-danke': { auftakt: 'Ihr Strauß', schluss: 'für Liebe & Danke', cta: 'Diesen Strauß anfragen' },
    hochzeit: { auftakt: 'Ihr Strauß', schluss: 'zur Hochzeit', cta: 'Diesen Strauß anfragen' },
    trauer: {
      auftakt: 'Ihr Strauß',
      schluss: 'für einen stillen Abschied',
      cta: 'Diesen Strauß anfragen',
      still: true,
    },
    pflanzen: { auftakt: 'Ihre Pflanzen', schluss: 'fürs Zuhause', cta: 'Diese Auswahl anfragen' },
  };

  const farbwelten = {
    zart: {
      name: 'Zart & Pastell',
      bild: 'assets/farbwelt-zart.jpg',
      alt: 'Strauß in zarten Pastelltönen — Beispielfoto',
    },
    sonnig: {
      name: 'Warm & Sonnig',
      bild: 'assets/farbwelt-sonnig.jpg',
      alt: 'Warmer Strauß in Gelb- und Orangetönen — Beispielfoto',
    },
    wildwiese: {
      name: 'Wildwiese bunt',
      bild: 'assets/farbwelt-wildwiese.jpg',
      alt: 'Bunter Wiesenstrauß mit Gräsern — Beispielfoto',
    },
    weissgruen: {
      name: 'Weiß & Grün',
      bild: 'assets/farbwelt-weissgruen.jpg',
      alt: 'Strauß in Weiß und Grün — Beispielfoto',
    },
  };

  const umfaenge = {
    'kleiner-gruss': 'klein und fein',
    klassisch: 'klassisch',
    ueppig: 'üppig',
  };

  const wahl = { anlass: 'geburtstag', stil: 'zart', umfang: 'klassisch' };
  const gruppen = [
    ['anlass', 'data-konf-anlass'],
    ['stil', 'data-konf-stil'],
    ['umfang', 'data-konf-umfang'],
  ];

  const aktualisieren = () => {
    const anlass = anlaesse[wahl.anlass];
    const farbwelt = farbwelten[wahl.stil];
    if (bild.getAttribute('src') !== farbwelt.bild) {
      bild.src = farbwelt.bild;
      bild.alt = farbwelt.alt;
    }
    huelle.classList.toggle('ist-still', anlass.still === true);
    // aria-live: nur bei echter Änderung neu schreiben, sonst meldet der Screenreader
    // schon beim Laden einen „neuen" Satz.
    const neuerSatz =
      `${anlass.auftakt}: ${umfaenge[wahl.umfang]}, ${farbwelt.name}, ${anlass.schluss}.`;
    if (satz.textContent.trim() !== neuerSatz) satz.textContent = neuerSatz;
    // Bei Trauer nimmt sich auch der CTA zurück (wie in der Trauer-Sektion).
    cta.classList.toggle('btn--voll', anlass.still !== true);
    cta.classList.toggle('btn--still', anlass.still === true);
    if (cta.textContent.trim() !== anlass.cta) cta.textContent = anlass.cta;
    cta.href = `anfrage.html?anlass=${wahl.anlass}&stil=${wahl.stil}&umfang=${wahl.umfang}`;
  };

  for (const [gruppe, attribut] of gruppen) {
    const knoepfe = [...konfigurator.querySelectorAll(`[${attribut}]`)];
    for (const knopf of knoepfe) {
      knopf.addEventListener('click', () => {
        wahl[gruppe] = knopf.getAttribute(attribut);
        for (const geschwister of knoepfe) {
          const aktiv = geschwister === knopf;
          geschwister.classList.toggle('is-aktiv', aktiv);
          geschwister.setAttribute('aria-pressed', String(aktiv));
        }
        aktualisieren();
      });
    }
  }

  aktualisieren();
})();

// --- Strauß-Anfrage (anfrage.html) ---
(() => {
  'use strict';

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Anlass + Farbwelt aus ?anlass= / ?stil= vorauswählen (Kachel- und Farbwelten-Links).
  const parameter = new URLSearchParams(window.location.search);
  for (const [gruppe, wert] of [
    ['anlass', parameter.get('anlass')],
    ['stil', parameter.get('stil')],
  ]) {
    if (!wert) continue;
    const radio = form.querySelector(`input[name="${gruppe}"][value="${CSS.escape(wert)}"]`);
    if (radio) radio.checked = true;
  }

  // Umfang aus dem Strauß-Konfigurator übernehmen (?umfang=), nur bekannte Optionen.
  const umfangFeld = form.querySelector('#umfang');
  const umfangWunsch = parameter.get('umfang');
  if (umfangFeld && umfangWunsch) {
    const option = [...umfangFeld.options].find((eintrag) => eintrag.value === umfangWunsch);
    if (option) umfangFeld.value = umfangWunsch;
  }

  // Wunschtermin: Minimum ist heute (lokales Datum, Format YYYY-MM-DD).
  const datumFeld = form.querySelector('#datum');
  const heute = new Date();
  const heuteWert = [
    heute.getFullYear(),
    String(heute.getMonth() + 1).padStart(2, '0'),
    String(heute.getDate()).padStart(2, '0'),
  ].join('-');
  datumFeld.min = heuteWert;

  const fehler = form.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');
  const fotoInput = form.querySelector('#fotos');
  const fotoListe = form.querySelector('[data-foto-liste]');

  const anlassNamen = {
    geburtstag: 'Geburtstag',
    'liebe-danke': 'Liebe & Danke',
    hochzeit: 'Hochzeit & Feste',
    trauer: 'Trauer',
    pflanzen: 'Pflanzen',
    abo: 'Blumen-Abo',
  };

  const stilNamen = {
    zart: 'Zart & Pastell',
    sonnig: 'Warm & Sonnig',
    wildwiese: 'Wildwiese bunt',
    weissgruen: 'Weiß & Grün',
    offen: 'Überraschen Sie mich',
  };

  const umfangNamen = {
    beratung: 'Umfang besprechen wir bei der Beratung',
    'kleiner-gruss': 'Kleiner Gruß',
    klassisch: 'Klassisch',
    ueppig: 'Üppig',
  };

  const uhrzeitNamen = {
    vormittags: 'vormittags (Beispielzeit)',
    nachmittags: 'nachmittags (Beispielzeit)',
    telefon: 'Uhrzeit am Telefon',
  };

  // Foto-Attrappe: Dateinamen NUR clientseitig anzeigen, nichts übertragen.
  const fotoAnzeige = () => {
    const dateien = [...(fotoInput.files ?? [])];
    fotoListe.textContent = '';
    fotoListe.hidden = dateien.length === 0;
    for (const datei of dateien) {
      const eintrag = document.createElement('li');
      eintrag.textContent = `${datei.name} — bleibt auf Ihrem Gerät`;
      fotoListe.append(eintrag);
    }
  };
  fotoInput.addEventListener('change', fotoAnzeige);

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();

    const datum = datumFeld.value;
    const uhrzeit = form.querySelector('#uhrzeit').value;
    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
    const ziffern = handy.replace(/\D/g, '');

    let meldung = '';
    if (!datum) {
      meldung = 'Bitte wählen Sie einen Wunschtermin für die Abholung (Beispielangabe genügt).';
    } else if (datum < heuteWert) {
      meldung = 'Der Wunschtermin liegt in der Vergangenheit — bitte wählen Sie ein Datum ab heute.';
    } else if (!uhrzeit) {
      meldung = 'Bitte wählen Sie eine Uhrzeit (Beispielzeiten genügen).';
    } else if (!vorname || !nachname) {
      meldung = 'Bitte geben Sie Ihren Vor- und Nachnamen an.';
    } else if (ziffern.length < 7) {
      meldung = 'Bitte geben Sie eine Handynummer mit mindestens 7 Ziffern an.';
    }

    if (meldung) {
      if (fehler) {
        fehler.textContent = meldung;
        fehler.hidden = false;
      }
      return;
    }

    if (fehler) fehler.hidden = true;
    const anlass = form.querySelector('input[name="anlass"]:checked');
    const stil = form.querySelector('input[name="stil"]:checked');
    const umfang = form.querySelector('#umfang').value;
    const gruss = form.querySelector('#gruss').value.trim();
    const fotoAnzahl = fotoInput.files ? fotoInput.files.length : 0;
    const fotoText =
      fotoAnzahl === 0
        ? 'kein Inspirationsfoto'
        : `${fotoAnzahl} ${fotoAnzahl === 1 ? 'Foto' : 'Fotos'} ausgewählt — nicht übertragen`;
    const [jahr, monat, tag] = datum.split('-');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${anlassNamen[anlass?.value] ?? 'Anlass'} · ` +
        `${stilNamen[stil?.value] ?? 'Farbwelt'} · ${umfangNamen[umfang] ?? 'Umfang'} · ` +
        `Abholung ${tag}.${monat}.${jahr}, ${uhrzeitNamen[uhrzeit] ?? 'Uhrzeit'} · ` +
        `${vorname} ${nachname} · Grußkarte: ${gruss ? 'ja' : 'nein'} · ${fotoText}`;
    }
    form.hidden = true;
    if (bestaetigung) {
      bestaetigung.hidden = false;
      bestaetigung.scrollIntoView({ block: 'start' });
    }
  });

  const neustart = document.querySelector('[data-neustart]');
  if (neustart) {
    neustart.addEventListener('click', () => {
      if (bestaetigung) bestaetigung.hidden = true;
      form.hidden = false;
      form.reset();
      fotoAnzeige();
      window.scrollTo({ top: 0 });
    });
  }
})();
