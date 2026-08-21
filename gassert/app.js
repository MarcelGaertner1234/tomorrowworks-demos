// Autohaus Gassert — Demo-Interaktionen des Terminwunsch-Planers.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Fahrzeugbestand-Filter (index.html): Marke + Zustand → live gefilterte Beispielkarten.
  const fahrzeugFilter = document.querySelector('[data-fahrzeug-filter]');
  const fahrzeugGrid = document.querySelector('[data-fahrzeug-grid]');
  if (fahrzeugFilter && fahrzeugGrid) {
    const karten = [...fahrzeugGrid.querySelectorAll('.fahrzeug-karte')];
    const status = fahrzeugFilter.querySelector('[data-filter-status]');
    const leerHinweis = document.querySelector('[data-fahrzeug-leer]');
    let markeAktiv = 'alle';
    let zustandAktiv = 'alle';

    const anwenden = () => {
      let sichtbar = 0;
      karten.forEach((karte) => {
        const passtMarke = markeAktiv === 'alle' || karte.dataset.marke === markeAktiv;
        const passtZustand = zustandAktiv === 'alle' || karte.dataset.zustand === zustandAktiv;
        const treffer = passtMarke && passtZustand;
        karte.hidden = !treffer;
        if (treffer) sichtbar += 1;
      });
      if (status) status.textContent = `${sichtbar} von ${karten.length} Beispielfahrzeugen`;
      if (leerHinweis) leerHinweis.hidden = sichtbar > 0;
    };

    fahrzeugFilter.querySelectorAll('[data-filter-marke]').forEach((knopf) => {
      knopf.addEventListener('click', () => {
        fahrzeugFilter.querySelectorAll('[data-filter-marke]').forEach((k) => k.classList.remove('is-aktiv'));
        knopf.classList.add('is-aktiv');
        markeAktiv = knopf.dataset.filterMarke;
        anwenden();
      });
    });
    fahrzeugFilter.querySelectorAll('[data-filter-zustand]').forEach((knopf) => {
      knopf.addEventListener('click', () => {
        fahrzeugFilter.querySelectorAll('[data-filter-zustand]').forEach((k) => k.classList.remove('is-aktiv'));
        knopf.classList.add('is-aktiv');
        zustandAktiv = knopf.dataset.filterZustand;
        anwenden();
      });
    });
  }

  const form = document.querySelector('#termin-form');
  if (!form) return;

  // Anliegen aus ?anliegen= vorauswählen (Links der Leistungs-Karten).
  const anliegen = new URLSearchParams(window.location.search).get('anliegen');
  if (anliegen) {
    const radio = form.querySelector(`input[name="anliegen"][value="${CSS.escape(anliegen)}"]`);
    if (radio) radio.checked = true;
  }

  // Wunschzeit-Auswahl (rein visuell, Beispielzeiten).
  const slotAnzeige = document.querySelector('[data-slot-anzeige]');
  const slotWert = document.querySelector('[data-slot-wert]');
  let gewaehlterSlot = '';
  form.querySelectorAll('.slot').forEach((knopf) => {
    knopf.addEventListener('click', () => {
      form.querySelectorAll('.slot').forEach((k) => {
        k.classList.remove('is-active');
        k.removeAttribute('aria-pressed');
      });
      knopf.classList.add('is-active');
      knopf.setAttribute('aria-pressed', 'true');
      gewaehlterSlot = knopf.dataset.slot ?? '';
      if (slotWert) slotWert.textContent = gewaehlterSlot;
      if (slotAnzeige) slotAnzeige.hidden = false;
    });
  });

  const fehler = form.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');

  const anliegenNamen = {
    service: 'Service- / Inspektionsanfrage',
    reparatur: 'Reparatur-Anfrage',
    gebrauchtwagen: 'Gebrauchtwagen-Besichtigung',
    neuwagen: 'Neuwagen-Beratung',
  };

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();

    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
    const fahrzeug = form.querySelector('#fahrzeug').value.trim();
    const ziffern = handy.replace(/\D/g, '');

    let meldung = '';
    if (!vorname || !nachname) {
      meldung = 'Bitte Vor- und Nachnamen angeben.';
    } else if (ziffern.length < 7) {
      meldung = 'Bitte eine Handynummer mit mindestens 7 Ziffern angeben.';
    } else if (!gewaehlterSlot) {
      meldung = 'Bitte eine Wunschzeit auswählen (Beispielzeiten).';
    }

    if (meldung) {
      if (fehler) {
        fehler.textContent = meldung;
        fehler.hidden = false;
      }
      return;
    }

    if (fehler) fehler.hidden = true;
    const gewaehlt = form.querySelector('input[name="anliegen"]:checked');
    if (zusammenfassung) {
      const teile = [
        anliegenNamen[gewaehlt?.value] ?? 'Anliegen',
        gewaehlterSlot,
        `${vorname} ${nachname}`,
      ];
      if (fahrzeug) teile.push(fahrzeug);
      zusammenfassung.textContent = `Demo-Zusammenfassung: ${teile.join(' · ')}`;
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
      gewaehlterSlot = '';
      if (slotAnzeige) slotAnzeige.hidden = true;
      form.querySelectorAll('.slot').forEach((k) => {
        k.classList.remove('is-active');
        k.removeAttribute('aria-pressed');
      });
      window.scrollTo({ top: 0 });
    });
  }
})();
