// Dienstleistungen Rubi — Demo-Interaktionen.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  // Anfrage-Zusammenstellung (index.html): Objekttyp + mehrere Leistungen
  // per Checkbox auswählen, live zusammenfassen, CTA übergibt beides an die
  // Anfrage (erste gewählte Leistung + Objektart als URL-Parameter).
  const zusammenstellung = document.querySelector('[data-zusammenstellung]');
  if (zusammenstellung) {
    const objekttypPillen = [...zusammenstellung.querySelectorAll('[data-objekttyp]')];
    const leistungsBoxen = [...zusammenstellung.querySelectorAll('[data-zusammenstellung-leistung]')];
    const textFeld = zusammenstellung.querySelector('[data-zusammenstellung-text]');
    const cta = zusammenstellung.querySelector('[data-zusammenstellung-cta]');

    const leistungsNamen = {
      hausmeister: 'Hausmeisterdienste',
      renovierung: 'Renovierungsarbeiten',
      garten: 'Gartenarbeiten & Gartenpflege',
      reparatur: 'Reparaturarbeiten',
    };
    const objekttypNamen = { privat: 'privates Objekt', gewerblich: 'gewerbliches Objekt' };

    let objekttypAktiv = 'privat';

    const aktualisieren = () => {
      const gewaehlt = leistungsBoxen.filter((box) => box.checked).map((box) => box.value);

      if (!gewaehlt.length) {
        if (textFeld) {
          textFeld.textContent =
            'Wählen Sie mindestens eine Leistung aus, dann fassen wir Ihre Anfrage hier zusammen.';
        }
        if (cta) {
          cta.setAttribute('aria-disabled', 'true');
          cta.setAttribute('href', `anfrage.html?objektart=${objekttypAktiv}`);
        }
        return;
      }

      const namen = gewaehlt.map((wert) => leistungsNamen[wert]).join(' + ');
      if (textFeld) {
        textFeld.textContent = `${namen} für ein ${objekttypNamen[objekttypAktiv]}.`;
      }
      if (cta) {
        cta.removeAttribute('aria-disabled');
        cta.setAttribute('href', `anfrage.html?leistung=${gewaehlt[0]}&objektart=${objekttypAktiv}`);
      }
    };

    objekttypPillen.forEach((pille) => {
      pille.addEventListener('click', () => {
        objekttypPillen.forEach((p) => p.classList.remove('is-aktiv'));
        pille.classList.add('is-aktiv');
        objekttypAktiv = pille.dataset.objekttyp;
        aktualisieren();
      });
    });
    leistungsBoxen.forEach((box) => box.addEventListener('change', aktualisieren));

    if (cta) {
      cta.addEventListener('click', (ereignis) => {
        if (cta.getAttribute('aria-disabled') === 'true') ereignis.preventDefault();
      });
    }
  }

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Leistungsart aus ?leistung= vorauswählen (Links der Leistungs-Kacheln).
  const parameter = new URLSearchParams(window.location.search);
  const leistung = parameter.get('leistung');
  if (leistung) {
    const radio = form.querySelector(`input[name="leistung"][value="${CSS.escape(leistung)}"]`);
    if (radio) radio.checked = true;
  }

  // Objektart aus ?objektart= vorauswählen (Link aus der Anfrage-Zusammenstellung).
  const objektart = parameter.get('objektart');
  if (objektart) {
    const auswahl = form.querySelector('#objektart');
    if (auswahl && [...auswahl.options].some((option) => option.value === objektart)) {
      auswahl.value = objektart;
    }
  }

  // Wunschtermin: Minimum ist heute (lokales Datum, Format YYYY-MM-DD).
  const terminFeld = form.querySelector('#termin');
  const heute = new Date();
  const heuteWert = [
    heute.getFullYear(),
    String(heute.getMonth() + 1).padStart(2, '0'),
    String(heute.getDate()).padStart(2, '0'),
  ].join('-');
  terminFeld.min = heuteWert;

  const fehler = form.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');
  const fotoInput = form.querySelector('#fotos');
  const fotoListe = form.querySelector('[data-foto-liste]');

  const leistungsNamen = {
    hausmeister: 'Hausmeisterdienste',
    renovierung: 'Renovierungsarbeiten',
    garten: 'Gartenarbeiten & -pflege',
    reparatur: 'Reparaturarbeiten',
  };

  const objektartNamen = {
    privat: 'Privat',
    gewerblich: 'Gewerblich',
  };

  const zeitNamen = {
    vormittags: 'vormittags (Beispielzeit)',
    nachmittags: 'nachmittags (Beispielzeit)',
    'nach-absprache': 'nach Absprache (Beispielzeit)',
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

    const objektart = form.querySelector('#objektart').value;
    const termin = terminFeld.value;
    const zeit = form.querySelector('#zeit').value;
    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const telefon = form.querySelector('#telefon').value.trim();
    const ziffern = telefon.replace(/\D/g, '');

    let meldung = '';
    if (!objektart) {
      meldung = 'Bitte wählen Sie die Objekt-Art (Beispielangabe genügt).';
    } else if (!termin) {
      meldung = 'Bitte wählen Sie einen Wunschtermin (Beispielangabe genügt).';
    } else if (termin < heuteWert) {
      meldung =
        'Der Wunschtermin liegt in der Vergangenheit — bitte wählen Sie ein Datum ab heute.';
    } else if (!zeit) {
      meldung = 'Bitte wählen Sie eine Beispielzeit.';
    } else if (!vorname || !nachname) {
      meldung = 'Bitte geben Sie Ihren Vor- und Nachnamen an.';
    } else if (ziffern.length < 7) {
      meldung = 'Bitte geben Sie eine Telefonnummer mit mindestens 7 Ziffern an.';
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
    const [jahr, monat, tag] = termin.split('-');
    const fotoAnzahl = fotoInput.files ? fotoInput.files.length : 0;
    const fotoText = `${fotoAnzahl} Foto(s) ausgewählt — nicht übertragen`;
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${leistungsNamen[gewaehlt?.value] ?? 'Leistung'} · ` +
        `${objektartNamen[objektart] ?? 'Objekt-Art'} · ` +
        `Termin ${tag}.${monat}.${jahr}, ${zeitNamen[zeit] ?? 'Zeit'} · ` +
        `${vorname} ${nachname} · ${fotoText}`;
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
