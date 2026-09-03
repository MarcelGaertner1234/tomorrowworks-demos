// Angelika Watson Coaching — Demo-Interaktionen.
// Grundsatz: kein Versand, keine Speicherung, keine externen Aufrufe.
(() => {
  'use strict';

  const themen = {
    entscheidung: {
      titel: 'Entscheidungen mit Klarheit treffen',
      text: 'Wir sortieren, was wirklich zählt: deine Werte, deine Optionen, deine Ängste. Am Ende hast du nicht nur eine Entscheidung — sondern auch den Frieden damit.',
      format: 'Einzelcoaching, 2–4 Sitzungen',
    },
    neustart: {
      titel: 'Beruflich neu ausrichten',
      text: 'Was kannst du, was willst du, was trägt dich? Wir entwickeln ein Bild deiner nächsten beruflichen Etappe — und die ersten realistischen Schritte dorthin.',
      format: 'Coaching-Begleitung über 2–3 Monate',
    },
    kraft: {
      titel: 'Wieder Kraft und Boden finden',
      text: 'Erschöpfung ist ein Signal, kein Versagen. Wir schauen, was dich leert und was dich füllt — und bauen deinen Alltag Schritt für Schritt so um, dass Energie zurückkommt.',
      format: 'Coaching-Begleitung, regelmässige Sitzungen',
    },
    selbstvertrauen: {
      titel: 'Mutiger für dich einstehen',
      text: 'Selbstvertrauen entsteht durch Erfahrung, nicht durch Zureden. Wir üben konkrete Situationen und lösen die Sätze auf, die dich klein halten.',
      format: 'Einzelcoaching, 3–5 Sitzungen',
    },
    klarheit: {
      titel: 'Klar kommunizieren, Grenzen setzen',
      text: 'Ob im Team, in der Familie oder in der Partnerschaft: Wir bereiten die Gespräche vor, die du bisher aufgeschoben hast — und du führst sie in deinem Ton.',
      format: 'Einzelcoaching, 2–4 Sitzungen',
    },
    ziel: {
      titel: 'Vom Wollen ins Tun kommen',
      text: 'Das Ziel ist klar, der Weg stockt. Wir finden heraus, was dich bremst, zerlegen das Ziel in machbare Etappen — und ich bleibe dran, bis du in Bewegung bist.',
      format: 'Coaching-Begleitung mit kurzen Check-ins',
    },
  };

  // Themen-Kompass (index.html): Situation wählen → passender Text, Format und CTA.
  const kompass = document.querySelector('[data-kompass]');
  if (kompass) {
    const pillen = [...kompass.querySelectorAll('[data-thema]')];
    const titelFeld = kompass.querySelector('[data-kompass-titel]');
    const textFeld = kompass.querySelector('[data-kompass-text]');
    const formatFeld = kompass.querySelector('[data-kompass-format]');
    const cta = kompass.querySelector('[data-kompass-cta]');

    pillen.forEach((pille) => {
      pille.addEventListener('click', () => {
        pillen.forEach((p) => {
          p.classList.remove('is-aktiv');
          p.setAttribute('aria-pressed', 'false');
        });
        pille.classList.add('is-aktiv');
        pille.setAttribute('aria-pressed', 'true');
        const eintrag = themen[pille.dataset.thema];
        if (!eintrag) return;
        if (titelFeld) titelFeld.textContent = eintrag.titel;
        if (textFeld) textFeld.textContent = eintrag.text;
        if (formatFeld) formatFeld.textContent = eintrag.format;
        if (cta) cta.setAttribute('href', `kennenlernen.html?thema=${pille.dataset.thema}`);
      });
    });
    pillen.forEach((p) => p.setAttribute('aria-pressed', p.classList.contains('is-aktiv') ? 'true' : 'false'));
  }

  // Anfrage-Formular (kennenlernen.html)
  const form = document.querySelector('#anfrage-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);

  // Thema aus ?thema= vorauswählen (Links des Themen-Kompass).
  const thema = params.get('thema');
  if (thema) {
    const radio = form.querySelector(`input[name="thema"][value="${CSS.escape(thema)}"]`);
    if (radio) radio.checked = true;
  }

  // Format-Hinweis aus ?format= (Links der Angebots-Karten).
  const formatNamen = {
    kennenlernen: 'Kennenlerngespräch',
    einzel: 'Einzelcoaching',
    begleitung: 'Coaching-Begleitung',
  };
  const formatHinweis = form.querySelector('[data-format-hinweis]');
  const format = params.get('format');
  if (formatHinweis && format && formatNamen[format]) {
    formatHinweis.textContent = formatNamen[format];
  }

  // Wunschzeit-Auswahl (rein visuell, Beispielzeiten).
  const slotAnzeige = form.querySelector('[data-slot-anzeige]');
  const slotWert = form.querySelector('[data-slot-wert]');
  let gewaehlterSlot = '';
  const slots = [...form.querySelectorAll('.slot')];
  const slotsZuruecksetzen = () => {
    slots.forEach((k) => {
      k.classList.remove('is-active');
      k.setAttribute('aria-pressed', 'false');
    });
  };
  slots.forEach((knopf) => {
    knopf.setAttribute('aria-pressed', 'false');
    knopf.addEventListener('click', () => {
      slotsZuruecksetzen();
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

  const themaNamen = {
    entscheidung: 'Eine Entscheidung',
    neustart: 'Beruflicher Neustart',
    kraft: 'Wieder Kraft finden',
    selbstvertrauen: 'Selbstvertrauen',
    klarheit: 'Klar kommunizieren',
    ziel: 'Ein Ziel erreichen',
    anderes: 'Etwas anderes',
  };
  const formatWahlNamen = { online: 'Online', telefon: 'Telefon', 'vor-ort': 'Vor Ort' };

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();

    const vorname = form.querySelector('#vorname').value.trim();
    const nachname = form.querySelector('#nachname').value.trim();
    const email = form.querySelector('#email').value.trim();

    let meldung = '';
    if (!vorname || !nachname) {
      meldung = 'Bitte Vor- und Nachnamen angeben.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      meldung = 'Bitte eine gültige E-Mail-Adresse angeben.';
    } else if (!gewaehlterSlot) {
      meldung = 'Bitte eine Wunschzeit auswählen (Beispielzeiten).';
    }

    if (meldung) {
      if (fehler) {
        fehler.textContent = meldung;
        fehler.hidden = false;
        fehler.scrollIntoView({ block: 'center' });
      }
      return;
    }

    if (fehler) fehler.hidden = true;
    const gewaehltesThema = form.querySelector('input[name="thema"]:checked');
    const gewaehltesFormat = form.querySelector('input[name="format"]:checked');
    if (zusammenfassung) {
      zusammenfassung.textContent =
        `Demo-Zusammenfassung: ${themaNamen[gewaehltesThema?.value] ?? 'Thema'} · ` +
        `${formatWahlNamen[gewaehltesFormat?.value] ?? 'Format'} · ${gewaehlterSlot} · ${vorname} ${nachname}`;
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
      slotsZuruecksetzen();
      window.scrollTo({ top: 0 });
    });
  }
})();
