// Am Waldrand — Demo-Interaktionen der Zimmeranfrage.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Schwebende Anfrage-Pill (Startseite): erscheint erst nach dem Kopfbereich.
  const pill = document.querySelector('[data-pill]');
  if (pill) {
    const aktualisieren = () => {
      pill.classList.toggle('is-sichtbar', window.scrollY > 480);
    };
    window.addEventListener('scroll', aktualisieren, { passive: true });
    aktualisieren();
  }

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Zimmertyp aus ?zimmer= vorauswählen (Links der Zimmer-Karten).
  const zimmer = new URLSearchParams(window.location.search).get('zimmer');
  if (zimmer) {
    const radio = form.querySelector(`input[name="zimmer"][value="${CSS.escape(zimmer)}"]`);
    if (radio) radio.checked = true;
  }

  const fehler = form.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');

  const zimmerNamen = {
    einzelzimmer: 'Einzelzimmer',
    doppelzimmer: 'Doppelzimmer',
    familienzimmer: 'Familienzimmer',
    chalet: 'Chalet',
  };

  // yyyy-mm-dd → dd.mm.yyyy (reine Textformatierung, keine Zeitzonen-Logik).
  const formatDatum = (wert) => {
    const [jahr, monat, tag] = wert.split('-');
    return `${tag}.${monat}.${jahr}`;
  };

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();

    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
    const ziffern = handy.replace(/\D/g, '');
    const anreise = form.querySelector('#anreise').value;
    const abreise = form.querySelector('#abreise').value;
    const personen = Number.parseInt(form.querySelector('#personen').value, 10);

    let meldung = '';
    if (!vorname || !nachname) {
      meldung = 'Bitte gib deinen Vor- und Nachnamen an.';
    } else if (ziffern.length < 7) {
      meldung = 'Bitte gib eine Handynummer mit mindestens 7 Ziffern an.';
    } else if (!anreise || !abreise) {
      meldung = 'Bitte wähle Anreise und Abreise (Beispieldaten genügen).';
    } else if (abreise <= anreise) {
      meldung = 'Die Abreise muss nach der Anreise liegen.';
    } else if (!Number.isInteger(personen) || personen < 1 || personen > 17) {
      meldung = 'Bitte gib eine Personenzahl zwischen 1 und 17 an.';
    }

    if (meldung) {
      if (fehler) {
        fehler.textContent = meldung;
        fehler.hidden = false;
      }
      return;
    }

    if (fehler) fehler.hidden = true;
    const gewaehlt = form.querySelector('input[name="zimmer"]:checked');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${zimmerNamen[gewaehlt?.value] ?? 'Zimmer'} · ` +
        `${formatDatum(anreise)} – ${formatDatum(abreise)} · ` +
        `${personen} ${personen === 1 ? 'Gast' : 'Gäste'} · ${vorname} ${nachname}`;
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
      window.scrollTo({ top: 0 });
    });
  }
})();
