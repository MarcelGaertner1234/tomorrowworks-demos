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

  // Lokales Datum als YYYY-MM-DD (für <input type="date"> und die Schnellwahl-Chips).
  const toISO = (datum) =>
    [
      datum.getFullYear(),
      String(datum.getMonth() + 1).padStart(2, '0'),
      String(datum.getDate()).padStart(2, '0'),
    ].join('-');

  // Wunschtermin: Minimum ist heute.
  const datumFeld = form.querySelector('#datum');
  const heute = new Date();
  const heuteWert = toISO(heute);
  datumFeld.min = heuteWert;

  const fehler = form.querySelector('[data-fehler]');
  const bestellBestaetigung = document.querySelector('[data-bestell-bestaetigung]');
  const bestellNummerFeld = document.querySelector('[data-bestell-nummer]');
  const zfAnlass = document.querySelector('[data-zf-anlass]');
  const zfStil = document.querySelector('[data-zf-stil]');
  const zfUmfang = document.querySelector('[data-zf-umfang]');
  const zfAbholung = document.querySelector('[data-zf-abholung]');
  const zfGruss = document.querySelector('[data-zf-gruss]');
  const zfKontakt = document.querySelector('[data-zf-kontakt]');
  const zfFoto = document.querySelector('[data-zf-foto]');
  const ersteFieldset = form.querySelector('fieldset');
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

  // --- Grußkarten-Live-Vorschau: der getippte Text erscheint sofort auf der Beispiel-Karte. ---
  const KARTE_PLATZHALTER = 'Ihr Grußtext erscheint hier';
  const grussFeld = form.querySelector('#gruss');
  const karteText = document.querySelector('[data-karte-text]');
  const karteAktualisieren = () => {
    if (!karteText) return;
    const text = grussFeld.value.trim();
    karteText.textContent = text === '' ? KARTE_PLATZHALTER : text;
    karteText.classList.toggle('ist-platzhalter', text === '');
  };
  if (grussFeld) grussFeld.addEventListener('input', karteAktualisieren);

  // --- Datum-Schnellwahl (03 Abholung): drei Chips setzen den Wunschtermin ohne Tippen. ---
  const schnellwahlKnoepfe = [
    ...document.querySelectorAll('[data-datum-schnellwahl] [data-schnellwahl]'),
  ];
  // „Nächster Samstag" liegt immer in der Zukunft — ist heute bereits Samstag, zählt der
  // darauffolgende (sonst würde die Chip-Auswahl scheinbar nichts verändern).
  const naechsterSamstag = (basis) => {
    const ziel = new Date(basis);
    const tageBisSamstag = (6 - ziel.getDay() + 7) % 7 || 7;
    ziel.setDate(ziel.getDate() + tageBisSamstag);
    return ziel;
  };
  const schnellwahlZiel = {
    morgen: () => {
      const ziel = new Date(heute);
      ziel.setDate(ziel.getDate() + 1);
      return ziel;
    },
    uebermorgen: () => {
      const ziel = new Date(heute);
      ziel.setDate(ziel.getDate() + 2);
      return ziel;
    },
    samstag: () => naechsterSamstag(heute),
  };
  const chipsZuruecksetzen = () => {
    for (const knopf of schnellwahlKnoepfe) knopf.setAttribute('aria-pressed', 'false');
  };
  for (const knopf of schnellwahlKnoepfe) {
    knopf.addEventListener('click', () => {
      const berechnen = schnellwahlZiel[knopf.dataset.schnellwahl];
      if (!berechnen) return;
      datumFeld.value = toISO(berechnen());
      chipsZuruecksetzen();
      knopf.setAttribute('aria-pressed', 'true');
    });
  }
  // Manuelles Ändern des Datumsfelds (Tippen oder Kalender-Picker) hebt die Chip-Markierung auf.
  datumFeld.addEventListener('input', chipsZuruecksetzen);

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

  // Beispiel-Bestellnummern ab BV-2026-101 — der Zähler bleibt über einen Neustart hinweg
  // erhalten (die zweite Demo-Anfrage in derselben Sitzung bekommt BV-2026-102).
  let bestellZaehler = 100;

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
    const abholungText = `${tag}.${monat}.${jahr}, ${uhrzeitNamen[uhrzeit] ?? 'Uhrzeit'}`;

    bestellZaehler += 1;
    const bestellNummer = `BV-2026-${bestellZaehler}`;

    // Wizard-Regel: erst das Formular verstecken (kein Doppel-Abschluss — der Submit-Button
    // verschwindet mit ihm), dann die Bestätigung zeigen, DANACH befüllen, zuletzt fokussieren.
    form.hidden = true;
    if (bestellBestaetigung) {
      bestellBestaetigung.hidden = false;
      if (bestellNummerFeld) bestellNummerFeld.textContent = bestellNummer;
      if (zfAnlass) zfAnlass.textContent = anlassNamen[anlass?.value] ?? 'Anlass';
      if (zfStil) zfStil.textContent = stilNamen[stil?.value] ?? 'Farbwelt';
      if (zfUmfang) zfUmfang.textContent = umfangNamen[umfang] ?? 'Umfang';
      if (zfAbholung) zfAbholung.textContent = abholungText;
      if (zfGruss) zfGruss.textContent = gruss ? 'ja' : 'nein';
      if (zfKontakt) zfKontakt.textContent = `${vorname} ${nachname}`;
      if (zfFoto) zfFoto.textContent = fotoText;
      bestellBestaetigung.focus();
    }
  });

  const neustart = document.querySelector('[data-neustart]');
  if (neustart) {
    neustart.addEventListener('click', () => {
      if (bestellBestaetigung) bestellBestaetigung.hidden = true;
      form.hidden = false;
      form.reset();
      fotoAnzeige();
      chipsZuruecksetzen();
      karteAktualisieren();
      if (ersteFieldset) ersteFieldset.focus();
      window.scrollTo({ top: 0 });
    });
  }
})();
