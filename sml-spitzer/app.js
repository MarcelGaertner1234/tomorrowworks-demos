// SML Spitzer — Demo-Interaktionen (Umzugs-Anfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Umzugsart aus ?umzugsart= vorauswählen (Leistungs-Kachel-Link).
  const parameter = new URLSearchParams(window.location.search);
  const umzugsartWert = parameter.get('umzugsart');
  if (umzugsartWert) {
    const radio = form.querySelector(
      `input[name="umzugsart"][value="${CSS.escape(umzugsartWert)}"]`,
    );
    if (radio) radio.checked = true;
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

  const umzugsartNamen = {
    privatumzug: 'Privatumzug',
    bueroumzug: 'Büroumzug',
    'projekt-edv-umzug': 'Projekt-/EDV-Umzug',
    sonstiges: 'Sonstiges',
  };

  const groesseNamen = {
    besichtigung: 'Größe ermitteln wir bei der Besichtigung',
    '1-zimmer': '1-Zimmer-Wohnung',
    '2-zimmer': '2-Zimmer-Wohnung',
    '3-zimmer': '3-Zimmer-Wohnung',
    '4-plus': '4 Zimmer oder mehr',
  };

  const zeitfensterNamen = {
    vormittags: 'vormittags (Beispielzeit)',
    nachmittags: 'nachmittags (Beispielzeit)',
    ganztaegig: 'ganztägig (Beispielzeit)',
  };

  const zusatzleistungNamen = {
    packservice: 'Ein-/Auspackservice',
    moebelmontage: 'Möbelmontage',
    halteverbotszone: 'Halteverbotszone',
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
    const zeitfenster = form.querySelector('#zeitfenster').value;
    const von = form.querySelector('#von').value.trim();
    const nach = form.querySelector('#nach').value.trim();
    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
    const ziffern = handy.replace(/\D/g, '');

    let meldung = '';
    if (!datum) {
      meldung = 'Bitte wählen Sie einen Wunschtermin für den Umzug (Beispielangabe genügt).';
    } else if (datum < heuteWert) {
      meldung = 'Der Wunschtermin liegt in der Vergangenheit — bitte wählen Sie ein Datum ab heute.';
    } else if (!zeitfenster) {
      meldung = 'Bitte wählen Sie ein Zeitfenster (Beispielzeiten genügen).';
    } else if (!von || !nach) {
      meldung = 'Bitte geben Sie an, von wo nach wo der Umzug gehen soll (Beispielangabe genügt).';
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
    const umzugsart = form.querySelector('input[name="umzugsart"]:checked');
    const groesse = form.querySelector('#groesse').value;
    const zusatzleistungen = [...form.querySelectorAll('input[name="zusatzleistung"]:checked')].map(
      (feld) => zusatzleistungNamen[feld.value] ?? feld.value,
    );
    const zusatzText = zusatzleistungen.length ? zusatzleistungen.join(', ') : 'keine ausgewählt';
    const fotoAnzahl = fotoInput.files ? fotoInput.files.length : 0;
    const fotoText =
      fotoAnzahl === 0
        ? 'kein Foto'
        : `${fotoAnzahl} ${fotoAnzahl === 1 ? 'Foto' : 'Fotos'} ausgewählt — nicht übertragen`;
    const [jahr, monat, tag] = datum.split('-');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${umzugsartNamen[umzugsart?.value] ?? 'Umzugsart'} · ` +
        `${von} → ${nach} · ${groesseNamen[groesse] ?? 'Größe'} · ` +
        `Termin ${tag}.${monat}.${jahr}, ${zeitfensterNamen[zeitfenster] ?? 'Zeitfenster'} · ` +
        `Zusatzleistungen: ${zusatzText} · ${vorname} ${nachname} · ${fotoText}`;
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
