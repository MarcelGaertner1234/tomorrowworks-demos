// Autohaus Gassert — Demo-Interaktionen des Terminwunsch-Planers.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Fahrzeug-Detailpanels (index.html): schließt Toggle + Panel einer Karte.
  const schliesseDetailPanel = (karte) => {
    const knopf = karte.querySelector('[data-detail-toggle]');
    const panel = karte.querySelector('[data-fahrzeug-detail]');
    if (knopf) knopf.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
  };

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
        else schliesseDetailPanel(karte);
      });
      if (status) status.textContent = `${sichtbar} von ${karten.length} Beispielfahrzeugen`;
      if (leerHinweis) leerHinweis.hidden = sichtbar > 0;
    };

    fahrzeugFilter.querySelectorAll('[data-filter-marke]').forEach((knopf) => {
      knopf.setAttribute('aria-pressed', String(knopf.classList.contains('is-aktiv')));
      knopf.addEventListener('click', () => {
        fahrzeugFilter.querySelectorAll('[data-filter-marke]').forEach((k) => {
          k.classList.remove('is-aktiv');
          k.setAttribute('aria-pressed', 'false');
        });
        knopf.classList.add('is-aktiv');
        knopf.setAttribute('aria-pressed', 'true');
        markeAktiv = knopf.dataset.filterMarke;
        anwenden();
      });
    });
    fahrzeugFilter.querySelectorAll('[data-filter-zustand]').forEach((knopf) => {
      knopf.setAttribute('aria-pressed', String(knopf.classList.contains('is-aktiv')));
      knopf.addEventListener('click', () => {
        fahrzeugFilter.querySelectorAll('[data-filter-zustand]').forEach((k) => {
          k.classList.remove('is-aktiv');
          k.setAttribute('aria-pressed', 'false');
        });
        knopf.classList.add('is-aktiv');
        knopf.setAttribute('aria-pressed', 'true');
        zustandAktiv = knopf.dataset.filterZustand;
        anwenden();
      });
    });
  }

  // Fahrzeug-Detail-Toggles: nur ein Panel gleichzeitig offen.
  const detailToggles = [...document.querySelectorAll('[data-detail-toggle]')];
  detailToggles.forEach((knopf) => {
    knopf.addEventListener('click', () => {
      const karte = knopf.closest('.fahrzeug-karte');
      const panel = document.getElementById(knopf.getAttribute('aria-controls'));
      if (!karte || !panel) return;
      const warOffen = knopf.getAttribute('aria-expanded') === 'true';
      detailToggles.forEach((anderer) => {
        const andereKarte = anderer.closest('.fahrzeug-karte');
        if (andereKarte) schliesseDetailPanel(andereKarte);
      });
      if (!warOffen) {
        knopf.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  const form = document.querySelector('#termin-form');
  if (!form) return;

  // Anliegen + Fahrzeug aus der URL vorauswählen (Links der Leistungs- und Fahrzeugkarten).
  const urlParams = new URLSearchParams(window.location.search);
  const anliegen = urlParams.get('anliegen');
  if (anliegen) {
    const radio = form.querySelector(`input[name="anliegen"][value="${CSS.escape(anliegen)}"]`);
    if (radio) radio.checked = true;
  }
  const probefahrtSelect = form.querySelector('#probefahrt-fahrzeug');
  const fahrzeugParam = urlParams.get('fahrzeug');
  if (fahrzeugParam && probefahrtSelect) {
    const option = probefahrtSelect.querySelector(`option[value="${CSS.escape(fahrzeugParam)}"]`);
    if (option) probefahrtSelect.value = fahrzeugParam;
  }

  // Anliegen-abhängige Zusatzfelder: Fahrzeug-Wahl nur bei Probefahrt, Inzahlungnahme-Block nur bei Inzahlungnahme.
  const fahrzeugWahl = document.querySelector('[data-fahrzeug-wahl]');
  const inzahlungnahmeFelder = document.querySelector('[data-inzahlungnahme-felder]');
  const aktualisiereAnliegenFelder = () => {
    const gewaehlterWert = form.querySelector('input[name="anliegen"]:checked')?.value;
    if (fahrzeugWahl) fahrzeugWahl.hidden = gewaehlterWert !== 'probefahrt';
    if (inzahlungnahmeFelder) inzahlungnahmeFelder.hidden = gewaehlterWert !== 'inzahlungnahme';
  };
  form.querySelectorAll('input[name="anliegen"]').forEach((radio) => {
    radio.addEventListener('change', aktualisiereAnliegenFelder);
  });
  aktualisiereAnliegenFelder();

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
    probefahrt: 'Probefahrt',
    inzahlungnahme: 'Inzahlungnahme / Ankauf',
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
    const anliegenWert = gewaehlt?.value;
    if (zusammenfassung) {
      const teile = [
        anliegenNamen[anliegenWert] ?? 'Anliegen',
        gewaehlterSlot,
        `${vorname} ${nachname}`,
      ];
      if (fahrzeug) teile.push(fahrzeug);
      if (anliegenWert === 'probefahrt' && probefahrtSelect?.value) {
        const titel = probefahrtSelect.selectedOptions[0]?.textContent?.trim();
        if (titel) teile.push(titel);
      }
      if (anliegenWert === 'inzahlungnahme') {
        const izFahrzeug = form.querySelector('#iz-fahrzeug')?.value.trim();
        const izEz = form.querySelector('#iz-ez')?.value.trim();
        const izKm = form.querySelector('#iz-km')?.value.trim();
        const izAngaben = [izFahrzeug, izEz, izKm].filter(Boolean);
        if (izAngaben.length) teile.push(`Ihr Fahrzeug: ${izAngaben.join(' / ')}`);
      }
      zusammenfassung.textContent = `Demo-Zusammenfassung: ${teile.join(' · ')}`;
    }
    if (!BranchDemo.accept(form, bestaetigung)) return;
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
      aktualisiereAnliegenFelder();
      window.scrollTo({ top: 0 });
    });
  }
})();
