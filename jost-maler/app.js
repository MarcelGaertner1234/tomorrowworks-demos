// Jost Maler — Demo-Interaktionen (Vorher/Nachher-Regler + Projektanfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // --- Farbton-Studio + Projekt-Rechner (Modul) ---

  // aria-live-Bereiche nur bei echter Änderung neu schreiben — sonst sagt der
  // Screenreader schon beim Laden und bei jedem Klick dasselbe erneut an.
  const setzeText = (element, text) => {
    if (element && element.textContent.trim() !== text.trim()) element.textContent = text;
  };

  // Sticky-Header ausmessen, damit Anker-Sprünge (#farbstudio & Co.) nicht darunter landen.
  const stickyHeader = document.querySelector('.site-header');
  if (stickyHeader) {
    const kopfhoeheMessen = () => {
      const hoehe = Math.round(stickyHeader.getBoundingClientRect().height);
      if (hoehe > 0) {
        document.documentElement.style.setProperty('--header-hoehe', `${hoehe}px`);
      }
    };
    kopfhoeheMessen();
    window.addEventListener('resize', kopfhoeheMessen);
  }

  // Farbton-Studio: Klick auf ein Farbfeld setzt data-ton am Overlay; die freigestellten
  // Wandzonen holen sich den Beispielton über die CSS-Variable --ton.
  const farbOverlay = document.querySelector('[data-farb-overlay]');
  if (farbOverlay) {
    const farbFelder = [...document.querySelectorAll('.farb-feld')];
    const tonName = document.querySelector('[data-ton-name]');
    farbFelder.forEach((feld) => {
      feld.addEventListener('click', () => {
        farbFelder.forEach((anderes) =>
          anderes.setAttribute('aria-pressed', String(anderes === feld)),
        );
        farbOverlay.dataset.ton = feld.dataset.ton;
        const name = feld.querySelector('.farb-feld-name');
        if (tonName && name) setzeText(tonName, name.textContent.trim());
      });
    });
  }

  // Projekt-Rechner: Wandfläche direkt oder aus Raummaßen; Ergebnis ist die Farbmenge
  // als Richtwert (1 Liter je 7 m² und Anstrich, auf ganze Liter aufgerundet).
  // Bewusst ohne Preis- und ohne Dauer-Angabe — das klärt die Besichtigung.
  const farbRechner = document.querySelector('[data-farbrechner]');
  if (farbRechner) {
    const QM_PRO_LITER = 7;
    const flaecheEingabe = farbRechner.querySelector('[data-wandflaeche]');
    const laengeEingabe = farbRechner.querySelector('[data-raumlaenge]');
    const breiteEingabe = farbRechner.querySelector('[data-raumbreite]');
    const hoeheEingabe = farbRechner.querySelector('[data-raumhoehe]');
    const blockFlaeche = farbRechner.querySelector('[data-modus-flaeche]');
    const blockRaum = farbRechner.querySelector('[data-modus-raum]');
    const modusPillen = [...farbRechner.querySelectorAll('[data-modus]')];
    const anstrichPillen = [...farbRechner.querySelectorAll('[data-anstriche]')];
    const ausgabeFlaeche = farbRechner.querySelector('[data-ergebnis-flaeche]');
    const ausgabeAnstriche = farbRechner.querySelector('[data-ergebnis-anstriche]');
    const ausgabeLiter = farbRechner.querySelector('[data-ergebnis-liter]');
    const ausgabeStatus = farbRechner.querySelector('[data-ergebnis-status]');

    let modus = 'flaeche';
    let anstriche = 2;

    // Eingaben auf die im HTML deklarierten Grenzen klemmen (min UND max) —
    // der Richtwert bleibt plausibel. Leeres/unsinniges Feld zählt als Minimum.
    const grenzwert = (feld, name) => Number.parseFloat(feld.getAttribute(name) ?? '');
    const zahl = (feld) => {
      if (!feld) return 0;
      const min = grenzwert(feld, 'min');
      const max = grenzwert(feld, 'max');
      let wert = Number.parseFloat(String(feld.value ?? '').replace(',', '.'));
      if (!Number.isFinite(wert) || wert <= 0) wert = Number.isFinite(min) ? min : 0;
      if (Number.isFinite(min)) wert = Math.max(wert, min);
      if (Number.isFinite(max)) wert = Math.min(wert, max);
      return wert;
    };

    // Der geklemmte Wert muss auch im Feld stehen, sonst behauptet die Eingabe
    // etwas anderes als das Ergebnis. Erst beim Verlassen/Commit, damit das
    // Tippen von mehrstelligen Zahlen nicht unterbrochen wird. Der Wert selbst
    // ändert sich dabei nie — nur seine Darstellung im Feld.
    const feldNormalisieren = (feld) => {
      if (!feld || feld.tagName !== 'INPUT') return;
      const text = String(Math.round(zahl(feld) * 10) / 10);
      if (feld.value !== text) feld.value = text;
    };
    const deutsch = (wert) => wert.toLocaleString('de-DE', { maximumFractionDigits: 1 });

    const aktualisieren = () => {
      const roh =
        modus === 'raum'
          ? 2 * (zahl(laengeEingabe) + zahl(breiteEingabe)) * zahl(hoeheEingabe)
          : zahl(flaecheEingabe);
      // Auf eine Nachkommastelle runden: Anzeige und Rechnung bleiben identisch.
      const wandflaeche = Math.round(roh * 10) / 10;
      const bedarf = (wandflaeche * anstriche) / QM_PRO_LITER;
      const liter = Math.ceil(Number(bedarf.toFixed(6)));

      setzeText(ausgabeFlaeche, `${deutsch(wandflaeche)} m²`);
      setzeText(ausgabeAnstriche, String(anstriche));
      setzeText(ausgabeLiter, `${liter} Liter`);
      setzeText(
        ausgabeStatus,
        `${deutsch(wandflaeche)} m² mit ${anstriche} ` +
          `${anstriche === 1 ? 'Anstrich' : 'Anstrichen'} ergeben rund ${liter} Liter Farbe.`,
      );
    };

    modusPillen.forEach((pille) => {
      pille.addEventListener('click', () => {
        modus = pille.dataset.modus;
        modusPillen.forEach((andere) =>
          andere.setAttribute('aria-pressed', String(andere.dataset.modus === modus)),
        );
        if (blockFlaeche) blockFlaeche.hidden = modus !== 'flaeche';
        if (blockRaum) blockRaum.hidden = modus !== 'raum';
        aktualisieren();
      });
    });

    anstrichPillen.forEach((pille) => {
      pille.addEventListener('click', () => {
        anstriche = Number(pille.dataset.anstriche);
        anstrichPillen.forEach((andere) =>
          andere.setAttribute(
            'aria-pressed',
            String(Number(andere.dataset.anstriche) === anstriche),
          ),
        );
        aktualisieren();
      });
    });

    [flaecheEingabe, laengeEingabe, breiteEingabe, hoeheEingabe].forEach((feld) => {
      feld?.addEventListener('input', aktualisieren);
      feld?.addEventListener('change', () => {
        feldNormalisieren(feld);
        aktualisieren();
      });
      feld?.addEventListener('blur', () => feldNormalisieren(feld));
    });

    aktualisieren();
  }

  // --- Ende Farbton-Studio + Projekt-Rechner ---

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
