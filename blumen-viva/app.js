// Blumen Viva – lokale Anfrage und Grußkartenvorschau.
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

  if (parameter.get('entwurf') === 'strauss') {
    try {
      const draft = JSON.parse(sessionStorage.getItem('viva-strauss-entwurf') || 'null');
      if (draft && typeof draft.gruss === 'string') grussFeld.value = draft.gruss.slice(0, 240);
    } catch { /* A missing draft still permits an ordinary inquiry. */ }
  }
  karteAktualisieren();

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

    if (!BranchDemo.accept(form, bestellBestaetigung)) return;
    bestellZaehler += 1;
    const bestellNummer = form.dataset.branchId;

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
