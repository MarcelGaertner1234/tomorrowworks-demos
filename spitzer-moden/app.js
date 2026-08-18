// Spitzer Moden — Demo-Interaktionen (Hero-Toggle + Beratungs-Anfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.

// Hero-Toggle „Für Sie / Für Ihn" (Referenz-DNA prada.com): wechselt Bild + Anfrage-Link,
// läuft nur auf index.html (dort existiert #hero-bild).
(() => {
  'use strict';

  const heroBild = document.querySelector('#hero-bild');
  const heroCta = document.querySelector('#hero-cta');
  const toggleButtons = document.querySelectorAll('.hero-toggle-btn');
  if (!heroBild || !toggleButtons.length) return;

  const altTexte = {
    damen: 'Editorial-Look für Damen — Beispielfoto',
    herren: 'Editorial-Look für Herren — Beispielfoto',
  };

  for (const button of toggleButtons) {
    button.addEventListener('click', () => {
      const bereich = button.dataset.bereich;
      if (!bereich) return;

      for (const anderer of toggleButtons) {
        const istAktiv = anderer === button;
        anderer.classList.toggle('is-aktiv', istAktiv);
        anderer.setAttribute('aria-selected', String(istAktiv));
      }

      const neuesBild = heroBild.dataset[`bild${bereich.charAt(0).toUpperCase()}${bereich.slice(1)}`];
      if (neuesBild) {
        heroBild.src = neuesBild;
        heroBild.alt = altTexte[bereich] ?? heroBild.alt;
      }
      if (heroCta) heroCta.href = `anfrage.html?bereich=${bereich}`;
    });
  }
})();

// Beratungs-Anfrage-Demo, läuft nur auf anfrage.html (dort existiert #anfrage-form).
(() => {
  'use strict';

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Bereich + Anlass aus ?bereich= / ?anlass= vorauswählen (Hero-, Kacheln- und Galerie-Links).
  const parameter = new URLSearchParams(window.location.search);
  for (const [gruppe, wert] of [
    ['bereich', parameter.get('bereich')],
    ['anlass', parameter.get('anlass')],
  ]) {
    if (!wert) continue;
    const radio = form.querySelector(`input[name="${gruppe}"][value="${CSS.escape(wert)}"]`);
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

  const bereichNamen = {
    damen: 'Damen',
    herren: 'Herren',
    beides: 'Beides',
  };

  const anlassNamen = {
    business: 'Business',
    festlich: 'Festlich',
    alltag: 'Alltag',
    garderobe: 'Garderoben-Auffrischung',
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
      meldung = 'Bitte wählen Sie einen Wunschtermin für die Beratung (Beispielangabe genügt).';
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
    const bereich = form.querySelector('input[name="bereich"]:checked');
    const anlass = form.querySelector('input[name="anlass"]:checked');
    const wonach = form.querySelector('#wonach').value.trim();
    const fotoAnzahl = fotoInput.files ? fotoInput.files.length : 0;
    const fotoText =
      fotoAnzahl === 0
        ? 'kein Inspirationsfoto'
        : `${fotoAnzahl} ${fotoAnzahl === 1 ? 'Foto' : 'Fotos'} ausgewählt — nicht übertragen`;
    const [jahr, monat, tag] = datum.split('-');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: Bereich ${bereichNamen[bereich?.value] ?? 'Bereich'} · ` +
        `Anlass ${anlassNamen[anlass?.value] ?? 'Anlass'} · ` +
        `Wunschtermin ${tag}.${monat}.${jahr}, ${uhrzeitNamen[uhrzeit] ?? 'Uhrzeit'} · ` +
        `${vorname} ${nachname} · Wonach: ${wonach ? 'ja' : 'nein'} · ${fotoText}`;
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
