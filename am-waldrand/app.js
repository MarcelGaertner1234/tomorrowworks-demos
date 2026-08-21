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

  // Aufenthalts-Planer (index.html): Zimmertyp + Anreise/Abreise ergeben live
  // eine Beispiel-Ansicht der Nächte (Tages-Streifen) — bewusst OHNE
  // Verfügbarkeitsprüfung, nur Visualisierung der gewählten Spanne.
  const planer = document.querySelector('[data-planer]');
  if (planer) {
    const pillen = [...planer.querySelectorAll('[data-planer-zimmer]')];
    const anreiseFeld = planer.querySelector('[data-planer-anreise]');
    const abreiseFeld = planer.querySelector('[data-planer-abreise]');
    const text = planer.querySelector('[data-planer-text]');
    const naechteBox = planer.querySelector('[data-planer-naechte]');
    const cta = planer.querySelector('[data-planer-cta]');

    const zimmerNamenPlaner = {
      einzelzimmer: 'Einzelzimmer',
      doppelzimmer: 'Doppelzimmer',
      familienzimmer: 'Familienzimmer',
      chalet: 'Chalet',
    };
    const wochentage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    let zimmerAktiv = 'einzelzimmer';

    const heute = new Date();
    const heuteWert = [
      heute.getFullYear(),
      String(heute.getMonth() + 1).padStart(2, '0'),
      String(heute.getDate()).padStart(2, '0'),
    ].join('-');
    if (anreiseFeld) anreiseFeld.min = heuteWert;
    if (abreiseFeld) abreiseFeld.min = heuteWert;

    const aktualisieren = () => {
      const anreiseWert = anreiseFeld?.value;
      const abreiseWert = abreiseFeld?.value;

      if (!anreiseWert || !abreiseWert || abreiseWert <= anreiseWert) {
        if (text) {
          text.textContent = 'Wähle Anreise und Abreise, um deinen Aufenthalt zu sehen.';
        }
        if (naechteBox) {
          naechteBox.hidden = true;
          naechteBox.innerHTML = '';
        }
        if (cta) cta.setAttribute('aria-disabled', 'true');
        return;
      }

      const anreiseDatum = new Date(`${anreiseWert}T00:00:00`);
      const abreiseDatum = new Date(`${abreiseWert}T00:00:00`);
      const naechteAnzahl = Math.round((abreiseDatum - anreiseDatum) / (24 * 60 * 60 * 1000));

      if (text) {
        text.textContent =
          `${naechteAnzahl} ${naechteAnzahl === 1 ? 'Nacht' : 'Nächte'} im ${zimmerNamenPlaner[zimmerAktiv]}.`;
      }

      if (naechteBox) {
        naechteBox.innerHTML = '';
        for (let i = 0; i < naechteAnzahl; i += 1) {
          const tag = new Date(anreiseDatum);
          tag.setDate(tag.getDate() + i);
          const karte = document.createElement('span');
          karte.className = 'planer-tag';
          karte.innerHTML =
            `<span class="planer-tag-wochentag">${wochentage[tag.getDay()]}</span>` +
            `<span class="planer-tag-nummer">${tag.getDate()}.${tag.getMonth() + 1}.</span>`;
          naechteBox.appendChild(karte);
        }
        naechteBox.hidden = false;
      }

      if (cta) {
        cta.removeAttribute('aria-disabled');
        cta.setAttribute(
          'href',
          `anfrage.html?zimmer=${zimmerAktiv}&anreise=${anreiseWert}&abreise=${abreiseWert}`,
        );
      }
    };

    pillen.forEach((pille) => {
      pille.addEventListener('click', () => {
        pillen.forEach((p) => p.classList.remove('is-aktiv'));
        pille.classList.add('is-aktiv');
        zimmerAktiv = pille.dataset.planerZimmer;
        aktualisieren();
      });
    });
    anreiseFeld?.addEventListener('change', aktualisieren);
    abreiseFeld?.addEventListener('change', aktualisieren);

    if (cta) {
      cta.addEventListener('click', (ereignis) => {
        if (cta.getAttribute('aria-disabled') === 'true') ereignis.preventDefault();
      });
    }
  }

  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  // Zimmertyp aus ?zimmer= vorauswählen (Links der Zimmer-Karten).
  const parameter = new URLSearchParams(window.location.search);
  const zimmer = parameter.get('zimmer');
  if (zimmer) {
    const radio = form.querySelector(`input[name="zimmer"][value="${CSS.escape(zimmer)}"]`);
    if (radio) radio.checked = true;
  }

  // Anreise/Abreise aus ?anreise=/?abreise= vorausfüllen (Link aus dem Aufenthalts-Planer).
  const anreiseParam = parameter.get('anreise');
  const abreiseParam = parameter.get('abreise');
  if (anreiseParam) {
    const anreiseFeld = form.querySelector('#anreise');
    if (anreiseFeld) anreiseFeld.value = anreiseParam;
  }
  if (abreiseParam) {
    const abreiseFeld = form.querySelector('#abreise');
    if (abreiseFeld) abreiseFeld.value = abreiseParam;
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
