// Kompass-Umzüge — Demo-Interaktionen (Umzugs-Anfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  const reduzierteBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Echte Header-Hoehe messen (variiert stark: ~82px Desktop, bis 243px Mobil
  // mit gestapelter Nav) — sonst landen Anker-Sprungziele unter dem sticky
  // Header (siehe scroll-margin-top in styles.css, das --header-hoehe nutzt).
  const header = document.querySelector('.site-header');
  if (header) {
    const headerHoeheMessen = () => {
      document.documentElement.style.setProperty('--header-hoehe', `${header.offsetHeight}px`);
    };
    headerHoeheMessen();
    window.addEventListener('resize', headerHoeheMessen);
  }

  // Hero-Kompassnadel: pendelt im Ruhezustand automatisch, folgt aber live der
  // Maus wie eine echte Magnetnadel (sobald die Maus in den Ring eintritt) und
  // "rastet" bei Hover/Fokus auf eine Leistung exakt darauf ein.
  const kompassRose = document.querySelector('[data-kompass]');
  if (kompassRose) {
    const nadel = kompassRose.querySelector('.kompass-nadel');

    const winkelZuMaus = (ereignis) => {
      const rect = kompassRose.getBoundingClientRect();
      const mitteX = rect.left + rect.width / 2;
      const mitteY = rect.top + rect.height / 2;
      const dx = ereignis.clientX - mitteX;
      const dy = ereignis.clientY - mitteY;
      if (Math.hypot(dx, dy) < 12) return null;
      return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    };

    if (!reduzierteBewegung) {
      kompassRose.addEventListener('mouseenter', () => {
        kompassRose.classList.add('js-live');
      });
      kompassRose.addEventListener('mousemove', (ereignis) => {
        if (kompassRose.classList.contains('hover-aktiv')) return;
        const winkel = winkelZuMaus(ereignis);
        if (winkel === null) return;
        nadel.style.transform = `rotate(${winkel}deg)`;
      });
      kompassRose.addEventListener('mouseleave', () => {
        kompassRose.classList.remove('js-live');
        if (!kompassRose.classList.contains('hover-aktiv')) nadel.style.transform = '';
      });
    }

    for (const marke of kompassRose.querySelectorAll('.kompass-marke')) {
      const winkel = marke.dataset.winkel;
      const aktivieren = () => {
        kompassRose.classList.add('hover-aktiv');
        nadel.style.transform = `rotate(${winkel}deg)`;
      };
      const deaktivieren = () => {
        kompassRose.classList.remove('hover-aktiv');
        // Bleibt die Maus im Ring, übernimmt der nächste mousemove die Live-Rotation;
        // ohne Maus (z. B. Tastatur-Fokus) zurück in den automatischen Pendel-Loop.
        if (!kompassRose.classList.contains('js-live')) nadel.style.transform = '';
      };
      marke.addEventListener('mouseenter', aktivieren);
      marke.addEventListener('focus', aktivieren);
      marke.addEventListener('mouseleave', deaktivieren);
      marke.addEventListener('blur', deaktivieren);
    }
  }

  // Scroll-Reveal: Sektionen heben/faden sich beim ersten Sichtbarwerden ins Bild.
  // Bei reduzierter Bewegung sofort alles sichtbar, kein Beobachter noetig.
  const revealElemente = document.querySelectorAll('[data-reveal]');
  if (revealElemente.length) {
    if (reduzierteBewegung || !('IntersectionObserver' in window)) {
      for (const element of revealElemente) element.classList.add('reveal-sichtbar');
    } else {
      const revealBeobachter = new IntersectionObserver(
        (eintraege) => {
          for (const eintrag of eintraege) {
            if (!eintrag.isIntersecting) continue;
            eintrag.target.classList.add('reveal-sichtbar');
            revealBeobachter.unobserve(eintrag.target);
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
      );
      for (const element of revealElemente) revealBeobachter.observe(element);
    }
  }

  // Magnetische Buttons: ziehen sich innerhalb eines kleinen Radius zur Maus,
  // federn beim Verlassen zurueck (gleiche Distanz-Mathematik wie die Kompassnadel).
  if (!reduzierteBewegung) {
    const radius = 60;
    for (const button of document.querySelectorAll('[data-magnetisch]')) {
      button.addEventListener('mousemove', (ereignis) => {
        const rect = button.getBoundingClientRect();
        const relX = ereignis.clientX - (rect.left + rect.width / 2);
        const relY = ereignis.clientY - (rect.top + rect.height / 2);
        const distanz = Math.hypot(relX, relY);
        if (distanz > radius) {
          button.style.transform = '';
          return;
        }
        const staerke = 1 - distanz / radius;
        button.style.transform = `translate(${(relX * 0.28 * staerke).toFixed(1)}px, ${(relY * 0.28 * staerke - 2).toFixed(1)}px)`;
      });
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    }

    // Leistungs-Kacheln kippen leicht in 3D zur Cursor-Position (Perspektive).
    for (const karte of document.querySelectorAll('.leistungs-kachel')) {
      karte.addEventListener('mousemove', (ereignis) => {
        const rect = karte.getBoundingClientRect();
        const relX = (ereignis.clientX - rect.left) / rect.width - 0.5;
        const relY = (ereignis.clientY - rect.top) / rect.height - 0.5;
        karte.style.transform = `perspective(700px) translateY(-4px) rotateX(${(relY * -7).toFixed(1)}deg) rotateY(${(relX * 7).toFixed(1)}deg)`;
      });
      karte.addEventListener('mouseleave', () => {
        karte.style.transform = '';
      });
    }

    // Cursor-Spotlight auf den dunklen Navy-Sektionen.
    for (const sektion of document.querySelectorAll('.spotlight-sektion')) {
      sektion.addEventListener('mousemove', (ereignis) => {
        const rect = sektion.getBoundingClientRect();
        sektion.style.setProperty('--spot-x', `${ereignis.clientX - rect.left}px`);
        sektion.style.setProperty('--spot-y', `${ereignis.clientY - rect.top}px`);
        sektion.classList.add('spot-aktiv');
      });
      sektion.addEventListener('mouseleave', () => {
        sektion.classList.remove('spot-aktiv');
      });
    }
  }

  // Text-Scramble: die Statement-Zahl baut sich kurz aus Zufallsziffern auf,
  // sobald sie ins Bild scrollt. Bei reduzierter Bewegung bleibt die HTML-Zahl stehen.
  const scrambleZiel = document.querySelector('[data-scramble]');
  if (scrambleZiel && !reduzierteBewegung && 'IntersectionObserver' in window) {
    const zeichen = '0123456789';
    const scrambeln = (element, ziel, dauer) => {
      const start = performance.now();
      const rahmen = (jetzt) => {
        const fortschritt = Math.min((jetzt - start) / dauer, 1);
        if (fortschritt < 1) {
          element.textContent = Array.from(
            { length: ziel.length },
            () => zeichen[Math.floor(Math.random() * zeichen.length)],
          ).join('');
          requestAnimationFrame(rahmen);
        } else {
          element.textContent = ziel;
        }
      };
      requestAnimationFrame(rahmen);
    };
    const scrambleBeobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue;
          scrambeln(eintrag.target, eintrag.target.dataset.scramble, 700);
          scrambleBeobachter.unobserve(eintrag.target);
        }
      },
      { threshold: 0.6 },
    );
    scrambleBeobachter.observe(scrambleZiel);
  }

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Umzugsart aus ?umzugsart= vorauswählen (Leistungs-Kachel-/Kompassnadel-Link).
  const parameter = new URLSearchParams(window.location.search);
  const umzugsartWert = parameter.get('umzugsart');
  if (umzugsartWert) {
    const radio = form.querySelector(
      `input[name="umzugsart"][value="${CSS.escape(umzugsartWert)}"]`,
    );
    if (radio) radio.checked = true;
  }

  // Zusatzleistung aus ?zusatzleistung= vorauswählen (Kompassnadel-Link "Einlagerung").
  const zusatzleistungWert = parameter.get('zusatzleistung');
  if (zusatzleistungWert) {
    const checkbox = form.querySelector(
      `input[name="zusatzleistung"][value="${CSS.escape(zusatzleistungWert)}"]`,
    );
    if (checkbox) checkbox.checked = true;
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

  const umzugsartNamen = {
    privatumzug: 'Privatumzug',
    seniorenumzug: 'Seniorenumzug',
    wohnungsaufloesung: 'Haushaltsauflösung',
    kuechenmontage: 'Nur Küchenmontage',
  };

  const groesseNamen = {
    besichtigung: 'Größe ermitteln wir bei der Besichtigung',
    '1-zimmer': '1-Zimmer-Wohnung',
    '2-zimmer': '2-Zimmer-Wohnung',
    '3-zimmer': '3-Zimmer-Wohnung',
    '4-plus': '4 Zimmer oder mehr',
  };

  const zeitfensterNamen = {
    vormittags: 'vormittags (Beispielzeit)',
    nachmittags: 'nachmittags (Beispielzeit)',
    ganztaegig: 'ganztägig (Beispielzeit)',
  };

  const zusatzleistungNamen = {
    packservice: 'Ein-/Auspackservice',
    moebelmontage: 'Möbelmontage',
    kuechenmontage: 'Küchenmontage',
    einlagerung: 'Einlagerung',
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
    const zeitfenster = form.querySelector('#zeitfenster').value;
    const von = form.querySelector('#von').value.trim();
    const nach = form.querySelector('#nach').value.trim();
    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const handy = form.querySelector('#handy').value.trim();
    const ziffern = handy.replace(/\D/g, '');

    let meldung = '';
    if (!datum) {
      meldung = 'Bitte wählen Sie einen Wunschtermin für den Umzug (Beispielangabe genügt).';
    } else if (datum < heuteWert) {
      meldung = 'Der Wunschtermin liegt in der Vergangenheit — bitte wählen Sie ein Datum ab heute.';
    } else if (!zeitfenster) {
      meldung = 'Bitte wählen Sie ein Zeitfenster (Beispielzeiten genügen).';
    } else if (!von || !nach) {
      meldung = 'Bitte geben Sie an, von wo nach wo der Umzug gehen soll (Beispielangabe genügt).';
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
    const umzugsart = form.querySelector('input[name="umzugsart"]:checked');
    const groesse = form.querySelector('#groesse').value;
    const zusatzleistungen = [...form.querySelectorAll('input[name="zusatzleistung"]:checked')].map(
      (feld) => zusatzleistungNamen[feld.value] ?? feld.value,
    );
    const zusatzText = zusatzleistungen.length ? zusatzleistungen.join(', ') : 'keine ausgewählt';
    const fotoAnzahl = fotoInput.files ? fotoInput.files.length : 0;
    const fotoText =
      fotoAnzahl === 0
        ? 'kein Foto'
        : `${fotoAnzahl} ${fotoAnzahl === 1 ? 'Foto' : 'Fotos'} ausgewählt — nicht übertragen`;
    const [jahr, monat, tag] = datum.split('-');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${umzugsartNamen[umzugsart?.value] ?? 'Umzugsart'} · ` +
        `${von} → ${nach} · ${groesseNamen[groesse] ?? 'Größe'} · ` +
        `Termin ${tag}.${monat}.${jahr}, ${zeitfensterNamen[zeitfenster] ?? 'Zeitfenster'} · ` +
        `Zusatzleistungen: ${zusatzText} · ${vorname} ${nachname} · ${fotoText}`;
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
