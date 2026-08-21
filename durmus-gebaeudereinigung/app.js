// Durmus Berkant Gebäudereinigung — Demo-Interaktionen (Reinigungs-Anfrage-Formular).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Bedarfsrechner (index.html): Fläche + Frequenz → live berechnete System-Empfehlung.
  // Bewusst ohne Euro-Betrag (verify.mjs verbietet erfundene Preise) — die Empfehlung
  // nennt nur den Systemnamen, die Pauschale klärt die Besichtigung.
  const rechner = document.querySelector('[data-bedarfsrechner]');
  if (rechner) {
    const flaecheFeld = rechner.querySelector('[data-rechner-flaeche]');
    const flaecheWert = rechner.querySelector('[data-rechner-flaeche-wert]');
    const systemName = rechner.querySelector('[data-rechner-system-name]');
    const begruendung = rechner.querySelector('[data-rechner-begruendung]');
    const cta = rechner.querySelector('[data-rechner-cta]');

    const systemLabels = {
      basis: 'System Basis',
      komfort: 'System Komfort',
      premium: 'System Premium',
    };
    const frequenzLabels = {
      woechentlich: '1× wöchentlicher',
      mehrmals: 'mehrmals wöchentlicher',
      taeglich: 'täglicher',
    };

    const ermittleSystem = (flaeche, frequenz) => {
      let punkte = 0;
      if (flaeche > 400) punkte += 2;
      else if (flaeche > 150) punkte += 1;
      if (frequenz === 'taeglich') punkte += 2;
      else if (frequenz === 'mehrmals') punkte += 1;
      if (punkte >= 3) return 'premium';
      if (punkte >= 1) return 'komfort';
      return 'basis';
    };

    const aktualisieren = () => {
      const flaeche = Number(flaecheFeld.value);
      const frequenz = rechner.querySelector('[data-rechner-frequenz]:checked')?.value || 'woechentlich';
      const system = ermittleSystem(flaeche, frequenz);

      if (flaecheWert) flaecheWert.textContent = `${flaeche} m²`;
      if (systemName) systemName.textContent = systemLabels[system];
      if (begruendung) {
        begruendung.textContent =
          `Bei ${flaeche} m² und ${frequenzLabels[frequenz]} Reinigung passt dieses System zu Ihrem Bedarf.`;
      }
      if (cta) cta.setAttribute('href', `anfrage.html?system=${system}`);
    };

    flaecheFeld?.addEventListener('input', aktualisieren);
    rechner.querySelectorAll('[data-rechner-frequenz]').forEach((radio) => {
      radio.addEventListener('change', aktualisieren);
    });
    aktualisieren();
  }

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
