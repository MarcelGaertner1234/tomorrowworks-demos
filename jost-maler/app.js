// Jost Maler — Demo-Interaktionen (Vorher/Nachher-Regler + Projektanfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Vorher/Nachher-Regler (Startseite): Regler steuert die Nachher-Ebene.
  const vergleich = document.querySelector('[data-vergleich]');
  if (vergleich) {
    const regler = vergleich.querySelector('[data-vergleich-regler]');
    const nachher = vergleich.querySelector('[data-ebene-nachher]');
    const linie = vergleich.querySelector('[data-vergleich-linie]');
    const anwenden = () => {
      const wert = Number(regler.value);
      nachher.style.clipPath = `inset(0 0 0 ${wert}%)`;
      linie.style.left = `${wert}%`;
    };
    regler.addEventListener('input', anwenden);
    anwenden();
  }

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Leistungsart aus ?leistung= vorauswählen (Links der Leistungs-Kacheln).
  const leistung = new URLSearchParams(window.location.search).get('leistung');
  if (leistung) {
    const radio = form.querySelector(`input[name="leistung"][value="${CSS.escape(leistung)}"]`);
    if (radio) radio.checked = true;
  }

  const fehler = form.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');
  const fotoInput = form.querySelector('#fotos');
  const fotoListe = form.querySelector('[data-foto-liste]');

  const leistungsNamen = {
    fassade: 'Fassade & Wärmedämmung',
    innenraum: 'Innenraum: Maler & Tapezier',
    stuck: 'Stuck & Schmucktechniken',
    trockenbau: 'Trockenbau & Decken',
    sanierung: 'Sanierung',
  };

  const zeitraumNamen = {
    '4-wochen': 'In den nächsten 4 Wochen',
    '1-3-monate': 'In 1–3 Monaten',
    '3-6-monate': 'In 3–6 Monaten',
    offen: 'Noch offen — erst beraten',
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

    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
    const ziffern = handy.replace(/\D/g, '');
    const ort = form.querySelector('#ort').value.trim();
    const zeitraum = form.querySelector('#zeitraum').value;

    let meldung = '';
    if (!ort) {
      meldung = 'Bitte geben Sie einen Ort oder Stadtteil an (Beispielangabe genügt).';
    } else if (!zeitraum) {
      meldung = 'Bitte wählen Sie einen Wunschzeitraum.';
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
    const gewaehlt = form.querySelector('input[name="leistung"]:checked');
    const fotoAnzahl = fotoInput.files ? fotoInput.files.length : 0;
    const fotoText =
      fotoAnzahl === 0
        ? 'keine Fotos ausgewählt'
        : `${fotoAnzahl} ${fotoAnzahl === 1 ? 'Foto' : 'Fotos'} ausgewählt — nicht übertragen`;
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${leistungsNamen[gewaehlt?.value] ?? 'Leistung'} · ` +
        `${ort} · ${zeitraumNamen[zeitraum] ?? 'Zeitraum'} · ${vorname} ${nachname} · ${fotoText}`;
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
