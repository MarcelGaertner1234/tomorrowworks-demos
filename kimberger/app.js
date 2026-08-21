// Kimberger Kosmetikinstitut — Demo-Interaktionen des Terminwunsch-Planers.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Anliegen-Finder (index.html): ein Klick auf das eigene Anliegen zeigt live
  // die passende Behandlung mit Original-Beschreibung + CTA zum Terminwunsch.
  const finder = document.querySelector('[data-anliegen-finder]');
  if (finder) {
    const pillen = [...finder.querySelectorAll('[data-anliegen]')];
    const titelFeld = finder.querySelector('[data-anliegen-titel]');
    const textFeld = finder.querySelector('[data-anliegen-text]');
    const cta = finder.querySelector('[data-anliegen-cta]');

    const behandlungen = {
      sensibelchen: {
        titel: 'Sensibelchen',
        text: '„Die Kraft des Meeres" — die Gesichtsbehandlung für empfindliche Haut, die vor allem eines braucht: Ruhe und eine sanfte Hand.',
      },
      klassik: {
        titel: 'Klassik',
        text: 'Der Einstieg in die regelmäßige Pflege — die klassische Gesichtsbehandlung für ein straffes, feines Hautbild.',
      },
      'klassik-plus': {
        titel: 'Klassik-Plus',
        text: 'Die erweiterte Klassik-Behandlung — mehr Vitalität für Ihre Haut und ein strahlendes Hauterlebnis.',
      },
      komfort: {
        titel: 'Komfort',
        text: 'Gesichtsbehandlung und Handpflege in einem Termin — eine Auszeit für Gesicht und Hände.',
      },
      'anti-aging': {
        titel: 'Anti-Aging',
        text: 'Zwei Anti-Aging-Behandlungen für anspruchsvolle Haut — welche zu Ihnen passt, klärt das Beratungsgespräch.',
      },
    };

    pillen.forEach((pille) => {
      pille.addEventListener('click', () => {
        pillen.forEach((p) => p.classList.remove('is-aktiv'));
        pille.classList.add('is-aktiv');
        const wert = pille.dataset.anliegen;
        const eintrag = behandlungen[wert];
        if (titelFeld) titelFeld.textContent = eintrag.titel;
        if (textFeld) textFeld.textContent = eintrag.text;
        if (cta) cta.setAttribute('href', `termin.html?behandlung=${wert}`);
      });
    });
  }

  const form = document.querySelector('#termin-form');
  if (!form) return;

  // Behandlung aus ?behandlung= vorauswählen (Links der Behandlungs-Karten).
  const behandlung = new URLSearchParams(window.location.search).get('behandlung');
  if (behandlung) {
    const radio = form.querySelector(`input[name="behandlung"][value="${CSS.escape(behandlung)}"]`);
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

  const behandlungsNamen = {
    sensibelchen: 'Sensibelchen — Die Kraft des Meeres',
    klassik: 'Klassik',
    'klassik-plus': 'Klassik-Plus',
    komfort: 'Komfort',
    'anti-aging': 'Anti-Aging',
  };

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();

    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
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
    const gewaehlt = form.querySelector('input[name="behandlung"]:checked');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${behandlungsNamen[gewaehlt?.value] ?? 'Behandlung'} · ${gewaehlterSlot} · ${vorname} ${nachname}`;
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
