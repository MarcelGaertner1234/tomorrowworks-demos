// Glanz und Gloria — Demo-Interaktionen des Beratungs-Planers.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Trauring-Konfigurator (index.html): Material + Breite + Oberfläche ergeben
  // live eine stilisierte CSS-Ring-Vorschau + Textbeschreibung. Kein Foto (kein
  // echtes Ring-Modell verfügbar), bewusst als "stilisiert" gekennzeichnet.
  // Einzel-Ansicht (Default) = 1 Ring. Paar-Ansicht = 2 Ringe, konfiguriert über
  // Ring-Tabs; die bestehenden Wahl-Gruppen (Material/Breite/Oberfläche) werden
  // dabei für den jeweils aktiven Ring wiederverwendet (kein doppeltes Markup).
  const konfigurator = document.querySelector('[data-ring-konfigurator]');
  if (konfigurator) {
    const ansichtWahl = konfigurator.querySelector('[data-ansicht-wahl]');
    const ringTabsContainer = konfigurator.querySelector('[data-ring-tabs]');
    const huelle2 = konfigurator.querySelector('.ring-vorschau-2');
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

    const neuerRing = () => ({ material: 'gelbgold', breite: 'mittel', oberflaeche: 'poliert', gravur: '' });
    const ringe = [neuerRing(), neuerRing()];
    let aktiverRing = 0; // 0 = Ring 1, 1 = Ring 2
    let modus = 'einzel'; // 'einzel' | 'paar'
    let ring2Kopiert = false;

    const indizes = [0, 1];
    const vorschauElemente = indizes.map((i) => konfigurator.querySelector(`[data-ring-vorschau="${i + 1}"]`));
    const gravurSpanElemente = indizes.map((i) => konfigurator.querySelector(`[data-ring-gravur="${i + 1}"]`));
    const gravurFeldElemente = indizes.map((i) => konfigurator.querySelector(`[data-gravur-feld="${i + 1}"]`));
    const gravurInputElemente = indizes.map((i) => konfigurator.querySelector(`[data-gravur-input="${i + 1}"]`));
    const gravurZaehlerElemente = indizes.map((i) => konfigurator.querySelector(`[data-gravur-zaehler="${i + 1}"]`));
    const ringTabElemente = indizes.map((i) => ringTabsContainer?.querySelector(`[data-ring-tab="${i + 1}"]`));

    const wunschText = (ring) => {
      const material = materialien[ring.material];
      const breite = breiten[ring.breite];
      const oberflaeche = oberflaechen[ring.oberflaeche];
      const basis = `${material.name}, ${breite.name}, ${oberflaeche}`;
      const gravur = ring.gravur.trim();
      return gravur ? `${basis}, Gravur ‚${gravur}'` : basis;
    };

    const renderVorschau = (index) => {
      const ring = ringe[index];
      const material = materialien[ring.material];
      const breite = breiten[ring.breite];
      const vorschau = vorschauElemente[index];
      if (vorschau) {
        vorschau.style.setProperty('--ring-farbe', material.farbe);
        vorschau.style.setProperty('--ring-inset', breite.inset);
        vorschau.classList.toggle('ist-poliert', ring.oberflaeche === 'poliert');
      }
      const span = gravurSpanElemente[index];
      if (span) {
        const gravur = ring.gravur.trim();
        span.textContent = gravur;
        span.classList.toggle('hat-text', gravur.length > 0);
      }
      konfigurator.dispatchEvent(new CustomEvent('ringchange', { detail: { index, material: ring.material } }));
    };

    const pillenAktualisieren = () => {
      const ring = ringe[aktiverRing];
      konfigurator.querySelectorAll('[data-ring-material]').forEach((p) => {
        p.classList.toggle('is-aktiv', p.dataset.ringMaterial === ring.material);
        p.setAttribute('aria-pressed', String(p.dataset.ringMaterial === ring.material));
      });
      konfigurator.querySelectorAll('[data-ring-breite]').forEach((p) => {
        p.classList.toggle('is-aktiv', p.dataset.ringBreite === ring.breite);
        p.setAttribute('aria-pressed', String(p.dataset.ringBreite === ring.breite));
      });
      konfigurator.querySelectorAll('[data-ring-oberflaeche]').forEach((p) => {
        p.classList.toggle('is-aktiv', p.dataset.ringOberflaeche === ring.oberflaeche);
        p.setAttribute('aria-pressed', String(p.dataset.ringOberflaeche === ring.oberflaeche));
      });
    };

    const beschreibungAktualisieren = () => {
      const ring = ringe[aktiverRing];
      const material = materialien[ring.material];
      const breite = breiten[ring.breite];
      const oberflaeche = oberflaechen[ring.oberflaeche];
      const praefix = modus === 'paar' ? `Ring ${aktiverRing + 1}: ` : '';
      let text = `${praefix}${material.name}, ${breite.name}, ${oberflaeche} — diese Kombination sprechen wir gerne im Erstgespräch mit Ihnen durch.`;
      const gravur = ring.gravur.trim();
      // Screenreader-Weg: die dekorative Gravur-Anzeige im Donut-Loch ist
      // aria-hidden — hier steht sie als lesbarer Text.
      if (gravur) text += ` Innengravur (Beispiel): „${gravur}".`;
      if (beschreibung) beschreibung.textContent = text;
    };

    const ctaAktualisieren = () => {
      const wunsch =
        modus === 'paar'
          ? `Ring 1: ${wunschText(ringe[0])} · Ring 2: ${wunschText(ringe[1])}`
          : wunschText(ringe[0]);
      if (cta) cta.setAttribute('href', `termin.html?anlass=trauringe&wunsch=${encodeURIComponent(wunsch)}`);
    };

    const zaehlerAktualisieren = (index) => {
      const el = gravurZaehlerElemente[index];
      if (!el) return;
      const rest = 20 - ringe[index].gravur.length;
      el.textContent = `${rest} Zeichen frei`;
    };

    // Hält das DOM-Input mit dem State synchron — nötig, weil ringe[1] beim
    // ersten Aktivieren der Paar-Ansicht per Objekt-Kopie befüllt wird (inkl.
    // gravur), ohne dass dabei ein input-Event auf #gravur-2 feuert.
    const gravurInputSynchronisieren = (index) => {
      const input = gravurInputElemente[index];
      if (input && input.value !== ringe[index].gravur) input.value = ringe[index].gravur;
    };

    const ringTabsAktualisieren = () => {
      ringTabElemente.forEach((btn, index) => {
        if (!btn) return;
        const istAktiv = index === aktiverRing;
        btn.classList.toggle('is-aktiv', istAktiv);
        btn.setAttribute('aria-pressed', String(istAktiv));
      });
      gravurFeldElemente.forEach((feld, index) => {
        if (!feld) return;
        feld.hidden = index !== aktiverRing;
      });
    };

    const modusAktualisieren = () => {
      const istPaar = modus === 'paar';
      if (ansichtWahl) {
        ansichtWahl.querySelectorAll('[data-ansicht]').forEach((btn) => {
          const istAktiv = btn.dataset.ansicht === modus;
          btn.classList.toggle('is-aktiv', istAktiv);
          btn.setAttribute('aria-pressed', String(istAktiv));
        });
      }
      if (ringTabsContainer) ringTabsContainer.hidden = !istPaar;
      if (huelle2) huelle2.hidden = !istPaar;
      if (istPaar) {
        ringTabsAktualisieren();
      } else {
        if (gravurFeldElemente[0]) gravurFeldElemente[0].hidden = false;
        if (gravurFeldElemente[1]) gravurFeldElemente[1].hidden = true;
      }
    };

    const vollstaendigNeuRendern = () => {
      renderVorschau(0);
      renderVorschau(1);
      pillenAktualisieren();
      beschreibungAktualisieren();
      ctaAktualisieren();
      gravurInputSynchronisieren(0);
      gravurInputSynchronisieren(1);
      zaehlerAktualisieren(0);
      zaehlerAktualisieren(1);
    };

    konfigurator.querySelectorAll('[data-ring-material]').forEach((pille) => {
      pille.addEventListener('click', () => {
        ringe[aktiverRing].material = pille.dataset.ringMaterial;
        pillenAktualisieren();
        renderVorschau(aktiverRing);
        beschreibungAktualisieren();
        ctaAktualisieren();
      });
    });
    konfigurator.querySelectorAll('[data-ring-breite]').forEach((pille) => {
      pille.addEventListener('click', () => {
        ringe[aktiverRing].breite = pille.dataset.ringBreite;
        pillenAktualisieren();
        renderVorschau(aktiverRing);
        beschreibungAktualisieren();
        ctaAktualisieren();
      });
    });
    konfigurator.querySelectorAll('[data-ring-oberflaeche]').forEach((pille) => {
      pille.addEventListener('click', () => {
        ringe[aktiverRing].oberflaeche = pille.dataset.ringOberflaeche;
        pillenAktualisieren();
        renderVorschau(aktiverRing);
        beschreibungAktualisieren();
        ctaAktualisieren();
      });
    });

    if (ansichtWahl) {
      ansichtWahl.querySelectorAll('[data-ansicht]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const neuerModus = btn.dataset.ansicht;
          if (neuerModus === modus) return;
          modus = neuerModus;
          if (modus === 'paar' && !ring2Kopiert) {
            ringe[1] = { ...ringe[0] };
            ring2Kopiert = true;
          }
          aktiverRing = 0;
          modusAktualisieren();
          vollstaendigNeuRendern();
        });
      });
    }

    ringTabElemente.forEach((btn, index) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        if (aktiverRing === index) return;
        aktiverRing = index;
        ringTabsAktualisieren();
        pillenAktualisieren();
        beschreibungAktualisieren();
      });
    });

    gravurInputElemente.forEach((input, index) => {
      if (!input) return;
      input.addEventListener('input', () => {
        ringe[index].gravur = input.value;
        renderVorschau(index);
        zaehlerAktualisieren(index);
        if (index === aktiverRing) beschreibungAktualisieren();
        ctaAktualisieren();
      });
    });

    modusAktualisieren();
    vollstaendigNeuRendern();
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
      const nachricht = form.querySelector('#nachricht').value.trim();
      if (nachricht) zusammenfassung.textContent += ` · ${nachricht}`;
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
      window.scrollTo({ top: 0 });
    });
  }
})();
