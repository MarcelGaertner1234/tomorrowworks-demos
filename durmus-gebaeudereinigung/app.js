// Durmus Berkant Gebäudereinigung — Demo-Interaktionen (Reinigungs-Anfrage-Formular).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  const form = document.querySelector('[data-anfrage-form]');
  if (!form) return;

  // Leistungsart aus ?leistung= vorauswählen (Links der Leistungs-Kacheln).
  const params = new URLSearchParams(window.location.search);
  const leistung = params.get('leistung');
  if (leistung) {
    const radio = form.querySelector(`input[name="leistung"][value="${CSS.escape(leistung)}"]`);
    if (radio) radio.checked = true;
  }

  // System aus ?system= vorauswählen (Links der Systeme-Kacheln).
  const system = params.get('system');
  if (system) {
    const radio = form.querySelector(`input[name="system"][value="${CSS.escape(system)}"]`);
    if (radio) radio.checked = true;
  }

  const fehlerPanel = form.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');
  const neustart = document.querySelector('[data-neustart]');

  // Wunschtermin darf nicht in der Vergangenheit liegen.
  // Lokales Datum statt toISOString() (UTC) — sonst zwischen 00:00–02:00 CEST
  // ein Tag zu früh (off-by-one, siehe Final-Review-Fund #9).
  const heute = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const datumFeld = form.querySelector('#datum');
  if (datumFeld) datumFeld.min = heute;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fehler = [];
    const daten = new FormData(form);

    const datum = daten.get('datum');
    if (!datum) {
      fehler.push('Bitte wählen Sie einen Wunschtermin.');
    } else if (datum < heute) {
      fehler.push('Der Wunschtermin darf nicht in der Vergangenheit liegen.');
    }

    const telefon = (daten.get('telefon') || '').replace(/\D/g, '');
    if (telefon.length < 7) {
      fehler.push('Bitte geben Sie eine gültige Telefonnummer an (mindestens 7 Ziffern).');
    }

    if (!daten.get('vorname') || !daten.get('nachname')) {
      fehler.push('Bitte geben Sie Vor- und Nachnamen an.');
    }

    if (fehler.length) {
      if (fehlerPanel) {
        fehlerPanel.hidden = false;
        fehlerPanel.textContent = fehler.join(' ');
        fehlerPanel.focus();
      }
      return;
    }

    if (fehlerPanel) fehlerPanel.hidden = true;

    const leistungLabel =
      form.querySelector('input[name="leistung"]:checked')?.nextElementSibling?.textContent?.trim() || '–';
    const auftragsartLabel = daten.get('auftragsart') === 'privat' ? 'Privat' : 'Gewerbe';
    const systemLabel =
      form.querySelector('input[name="system"]:checked')?.nextElementSibling?.textContent?.trim() || '–';

    if (zusammenfassung) {
      zusammenfassung.textContent =
        `${leistungLabel} · ${auftragsartLabel} · ${daten.get('objekt') || '–'} · ` +
        `${systemLabel} · ${datum} · ${daten.get('vorname')} ${daten.get('nachname')}`;
    }

    form.hidden = true;
    if (bestaetigung) {
      bestaetigung.hidden = false;
      bestaetigung.scrollIntoView({ block: 'start' });
    }
  });

  if (neustart) {
    neustart.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      if (bestaetigung) bestaetigung.hidden = true;
      if (fehlerPanel) fehlerPanel.hidden = true;
      if (datumFeld) datumFeld.min = heute;
      window.scrollTo({ top: 0 });
    });
  }
})();
