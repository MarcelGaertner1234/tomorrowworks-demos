// Kompass-Umzüge — Demo-Interaktionen (Umzugs-Anfrage).
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  const reduzierteBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lokales Datum als YYYY-MM-DD. Bewusst NICHT toISOString() — das rechnet nach
  // UTC um und kippt abends auf den Folgetag.
  const isoDatum = (datum) =>
    [
      datum.getFullYear(),
      String(datum.getMonth() + 1).padStart(2, '0'),
      String(datum.getDate()).padStart(2, '0'),
    ].join('-');

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

  // --- Umzugs-Zeitplan-Generator (index.html) ---------------------------------
  // Aus dem Umzugstag wird eine Route: Etappen 8/6/4/2 Wochen vorher, die
  // Umzugswoche und der Umzugstag selbst. Die Etappen-Daten haengen ALLEIN am
  // Zieldatum — "heute" entscheidet nur, welche Etappen ueberhaupt noch vor
  // einem liegen (Kurzfrist-Pfad). Bewusst nur allgemeine Anhaltspunkte, keine
  // Aussagen darueber, was der Betrieb leistet.
  const zeitplanForm = document.querySelector('[data-zeitplan]');
  if (zeitplanForm) {
    const zielFeld = zeitplanForm.querySelector('#zeitplan-datum');
    const zeitplanFehler = zeitplanForm.querySelector('[data-zeitplan-fehler]');
    const zeitplanErgebnis = document.querySelector('[data-zeitplan-ergebnis]');
    const zeitplanRoute = document.querySelector('[data-zeitplan-route]');
    const zeitplanVorlage = document.querySelector('[data-zeitplan-vorlage]');
    const zielAnzeige = document.querySelector('[data-zeitplan-ziel]');
    const metaAnzeige = document.querySelector('[data-zeitplan-meta]');
    const kurzfristHinweis = document.querySelector('[data-zeitplan-kurzfrist]');
    const zeitplanCta = document.querySelector('[data-zeitplan-cta]');

    const heuteIso = isoDatum(new Date());
    zielFeld.min = heuteIso;

    const ausIso = (wert) => {
      const [jahr, monat, tag] = wert.split('-').map(Number);
      return new Date(jahr, monat - 1, tag);
    };
    const umTage = (datum, tage) => {
      const kopie = new Date(datum.getTime());
      kopie.setDate(kopie.getDate() + tage);
      return kopie;
    };
    const montagDerWoche = (datum) => umTage(datum, -((datum.getDay() + 6) % 7));
    const tageZwischen = (von, bis) => Math.round((ausIso(bis) - ausIso(von)) / 86400000);

    const langesDatum = new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const kurzesDatum = new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const etappenVorlagen = [
      {
        versatz: -56,
        marke: '8 Wochen vorher',
        titel: 'Kurs setzen',
        aufgaben: [
          'Mietvertrag prüfen und Kündigungsfrist notieren',
          'Übergabetermine für alte und neue Wohnung abstimmen',
          'Urlaubstage rund um den Umzug einplanen',
        ],
      },
      {
        versatz: -42,
        marke: '6 Wochen vorher',
        titel: 'Ballast abwerfen',
        aufgaben: [
          'Keller, Dachboden und Schränke ausmisten',
          'Sperrmüll oder Entsorgung anmelden',
          'Umzugskartons und Packmaterial besorgen',
        ],
      },
      {
        versatz: -28,
        marke: '4 Wochen vorher',
        titel: 'Wege frei machen',
        aufgaben: [
          'Nachsendeauftrag bei der Post einrichten',
          'Halteverbotszone für beide Adressen beantragen',
          'Strom, Gas und Internet ummelden',
        ],
      },
      {
        versatz: -14,
        marke: '2 Wochen vorher',
        titel: 'Kisten packen',
        aufgaben: [
          'Kartons raumweise packen und beschriften',
          'Dokumente und Wertsachen getrennt sichern',
          'Betreuung für Kinder und Haustiere am Umzugstag klären',
        ],
      },
      {
        woche: true,
        praefix: 'ab ',
        marke: 'Umzugswoche',
        titel: 'Letzte Peilung',
        aufgaben: [
          'Kühlschrank abtauen und Waschmaschine sichern',
          'Kiste mit dem Nötigsten für die erste Nacht packen',
          'Zufahrt und Parkplätze an beiden Adressen freihalten',
        ],
      },
      {
        versatz: 0,
        ziel: true,
        marke: 'Umzugstag',
        titel: 'Ziel erreicht',
        aufgaben: [
          'Zählerstände in alter und neuer Wohnung notieren',
          'Übergabeprotokolle unterschreiben',
          'Kartons nach Beschriftung in die richtigen Räume stellen',
        ],
      },
    ];

    // Faellt der Umzug selbst auf einen Montag, waere der Montag der Umzugswoche
    // derselbe Tag wie der Umzugstag — zwei Etappen mit identischem Datum. Dann
    // startet die Vorbereitungs-Etappe eine Woche frueher und heisst auch so.
    const umzugswoche = (ziel) => {
      const montag = montagDerWoche(ziel);
      if (montag.getTime() !== ziel.getTime()) return { start: montag, marke: 'Umzugswoche' };
      return { start: umTage(montag, -7), marke: 'Woche vor dem Umzug' };
    };

    // Kurzfrist-Pfad: Etappen, die schon hinter einem liegen, faellt der Plan
    // weg — statt sie als "verpasst" zu zeigen.
    const etappenBauen = (zielIso) => {
      const ziel = ausIso(zielIso);
      return etappenVorlagen
        .map((etappe) => {
          if (!etappe.woche) {
            return { ...etappe, datum: isoDatum(umTage(ziel, etappe.versatz)) };
          }
          const { start, marke } = umzugswoche(ziel);
          return { ...etappe, datum: isoDatum(start), marke };
        })
        .filter((etappe) => etappe.datum >= heuteIso);
    };

    const planZeichnen = (zielIso) => {
      const etappen = etappenBauen(zielIso);
      const restTage = tageZwischen(heuteIso, zielIso);
      const restText =
        restTage === 0 ? 'Heute' : `Noch ${restTage} ${restTage === 1 ? 'Tag' : 'Tage'}`;

      // Erst sichtbar machen, dann befuellen: role="status" meldet nur Aenderungen,
      // die im sichtbaren Baum passieren — in einem hidden-Container bliebe die
      // Ansage komplett aus.
      zeitplanErgebnis.hidden = false;

      zielAnzeige.textContent = langesDatum.format(ausIso(zielIso));
      metaAnzeige.textContent =
        `${restText} · ${etappen.length} ${etappen.length === 1 ? 'Etappe' : 'Etappen'}`;
      kurzfristHinweis.hidden = etappen.length === etappenVorlagen.length;
      zeitplanCta.setAttribute('href', `anfrage.html?umzugsart=privatumzug&datum=${zielIso}`);

      zeitplanRoute.textContent = '';
      etappen.forEach((etappe, index) => {
        const eintrag = zeitplanVorlage.content.firstElementChild.cloneNode(true);
        // Die Nadel peilt sich Etappe fuer Etappe auf Nord ein — am Ziel steht sie.
        const peilung =
          etappen.length > 1 ? (144 * (etappen.length - 1 - index)) / (etappen.length - 1) : 0;
        eintrag.dataset.datum = etappe.datum;
        eintrag.style.setProperty('--peilung', `${Number(peilung.toFixed(1))}deg`);
        eintrag.style.setProperty('--verzoegerung', `${(index * 0.09).toFixed(2)}s`);
        if (etappe.ziel) eintrag.classList.add('zeitplan-etappe--ziel');

        const zeit = eintrag.querySelector('[data-zeitplan-zeit]');
        zeit.setAttribute('datetime', etappe.datum);
        zeit.textContent = `${etappe.praefix ?? ''}${kurzesDatum.format(ausIso(etappe.datum))}`;
        eintrag.querySelector('[data-zeitplan-marke]').textContent = etappe.marke;
        eintrag.querySelector('[data-zeitplan-titel]').textContent = etappe.titel;

        const aufgabenListe = eintrag.querySelector('[data-zeitplan-aufgaben]');
        for (const aufgabe of etappe.aufgaben) {
          const punkt = document.createElement('li');
          punkt.textContent = aufgabe;
          aufgabenListe.append(punkt);
        }
        zeitplanRoute.append(eintrag);
      });

      // Etappen einblenden, dabei zeichnen sich die Wegstuecke mit. Ohne Bewegung
      // sofort, sonst gestaffelt (Verzoegerung in --verzoegerung, Bewegung im CSS).
      const sichtbarMachen = () => {
        for (const eintrag of zeitplanRoute.children) eintrag.classList.add('ist-sichtbar');
      };
      if (reduzierteBewegung) sichtbarMachen();
      else requestAnimationFrame(() => requestAnimationFrame(sichtbarMachen));
      // Fokus in den fertigen Plan setzen — wer per Tastatur absendet, landet im
      // Ergebnis statt weiter unter dem Knopf. Scrollen uebernimmt scrollIntoView,
      // damit die scroll-margin-top gegen den Sticky-Header greift.
      zeitplanErgebnis.focus({ preventScroll: true });
      zeitplanErgebnis.scrollIntoView({ block: 'start' });
    };

    zeitplanForm.addEventListener('submit', (ereignis) => {
      ereignis.preventDefault();
      const zielIso = zielFeld.value;

      let meldung = '';
      if (!zielIso) {
        meldung = 'Bitte wählen Sie Ihren Umzugstag (Beispielangabe genügt).';
      } else if (zielIso < heuteIso) {
        meldung =
          'Der Umzugstag liegt in der Vergangenheit — bitte wählen Sie ein Datum ab heute.';
      }

      if (meldung) {
        zeitplanFehler.textContent = meldung;
        zeitplanFehler.hidden = false;
        zeitplanErgebnis.hidden = true;
        return;
      }

      zeitplanFehler.hidden = true;
      planZeichnen(zielIso);
    });
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
  const heuteWert = isoDatum(new Date());
  datumFeld.min = heuteWert;

  // Wunschtermin aus ?datum= übernehmen (Link aus dem Zeitplan-Generator) —
  // nur plausible Werte ab heute, sonst bleibt das Feld leer.
  const datumWert = parameter.get('datum');
  if (/^\d{4}-\d{2}-\d{2}$/.test(datumWert ?? '') && datumWert >= heuteWert) {
    datumFeld.value = datumWert;
  }

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
