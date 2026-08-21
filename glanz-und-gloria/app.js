// Glanz und Gloria — Demo-Interaktionen des Beratungs-Planers.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Trauring-Konfigurator (index.html): Material + Breite + Oberfläche ergeben
  // live eine stilisierte CSS-Ring-Vorschau + Textbeschreibung. Kein Foto (kein
  // echtes Ring-Modell verfügbar), bewusst als "stilisiert" gekennzeichnet.
  const konfigurator = document.querySelector('[data-ring-konfigurator]');
  if (konfigurator) {
    const vorschau = konfigurator.querySelector('[data-ring-vorschau]');
    const beschreibung = konfigurator.querySelector('[data-ring-beschreibung]');
    const cta = konfigurator.querySelector('[data-ring-cta]');

    const materialien = {
      gelbgold: { name: 'Gelbgold', farbe: 'linear-gradient(135deg, #f6d987, #b8860b)' },
      weissgold: { name: 'Weißgold', farbe: 'linear-gradient(135deg, #f2f2f0, #b3b3ad)' },
      'roségold': { name: 'Roségold', farbe: 'linear-gradient(135deg, #f0c8b8, #c98a72)' },
      platin: { name: 'Platin', farbe: 'linear-gradient(135deg, #e8e9ea, #a9acb0)' },
    };
    const breiten = {
      schmal: { name: 'schmale Breite', inset: '16px' },
      mittel: { name: 'mittlere Breite', inset: '26px' },
      breit: { name: 'breite Ausführung', inset: '38px' },
    };
    const oberflaechen = {
      poliert: 'poliert',
      mattiert: 'mattiert',
    };

    let materialAktiv = 'gelbgold';
    let breiteAktiv = 'mittel';
    let oberflaecheAktiv = 'poliert';

    const aktualisieren = () => {
      const material = materialien[materialAktiv];
      const breite = breiten[breiteAktiv];
      const oberflaeche = oberflaechen[oberflaecheAktiv];

      if (vorschau) {
        vorschau.style.setProperty('--ring-farbe', material.farbe);
        vorschau.style.setProperty('--ring-inset', breite.inset);
        vorschau.classList.toggle('ist-poliert', oberflaecheAktiv === 'poliert');
      }

      const text = `${material.name}, ${breite.name}, ${oberflaeche} — diese Kombination sprechen wir gerne im Erstgespräch mit Ihnen durch.`;
      if (beschreibung) beschreibung.textContent = text;

      const wunsch = `${material.name}, ${breite.name}, ${oberflaeche}`;
      if (cta) cta.setAttribute('href', `termin.html?anlass=trauringe&wunsch=${encodeURIComponent(wunsch)}`);
    };

    konfigurator.querySelectorAll('[data-ring-material]').forEach((pille) => {
      pille.addEventListener('click', () => {
        konfigurator.querySelectorAll('[data-ring-material]').forEach((p) => p.classList.remove('is-aktiv'));
        pille.classList.add('is-aktiv');
        materialAktiv = pille.dataset.ringMaterial;
        aktualisieren();
      });
    });
    konfigurator.querySelectorAll('[data-ring-breite]').forEach((pille) => {
      pille.addEventListener('click', () => {
        konfigurator.querySelectorAll('[data-ring-breite]').forEach((p) => p.classList.remove('is-aktiv'));
        pille.classList.add('is-aktiv');
        breiteAktiv = pille.dataset.ringBreite;
        aktualisieren();
      });
    });
    konfigurator.querySelectorAll('[data-ring-oberflaeche]').forEach((pille) => {
      pille.addEventListener('click', () => {
        konfigurator.querySelectorAll('[data-ring-oberflaeche]').forEach((p) => p.classList.remove('is-aktiv'));
        pille.classList.add('is-aktiv');
        oberflaecheAktiv = pille.dataset.ringOberflaeche;
        aktualisieren();
      });
    });

    aktualisieren();
  }

  const form = document.querySelector('#termin-form');
  if (!form) return;

  // Anlass aus ?anlass= vorauswählen (Links der Stilwelten-Karten).
  const parameter = new URLSearchParams(window.location.search);
  const anlass = parameter.get('anlass');
  if (anlass) {
    const radio = form.querySelector(`input[name="anlass"][value="${CSS.escape(anlass)}"]`);
    if (radio) radio.checked = true;
  }

  // Wunsch aus ?wunsch= in die Nachricht vorausfüllen (Link aus dem Ring-Konfigurator).
  const wunsch = parameter.get('wunsch');
  if (wunsch) {
    const nachrichtFeld = form.querySelector('#nachricht');
    if (nachrichtFeld && !nachrichtFeld.value) {
      nachrichtFeld.value = `Wunsch-Kombination aus dem Konfigurator: ${wunsch}.`;
    }
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

  const anlassNamen = {
    trauringe: 'Trauring-Beratung',
    unikat: 'Unikat-Erstgespräch',
    reparatur: 'Reparatur-Abgabe',
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
    const gewaehlt = form.querySelector('input[name="anlass"]:checked');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${anlassNamen[gewaehlt?.value] ?? 'Beratung'} · ${gewaehlterSlot} · ${vorname} ${nachname}`;
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
