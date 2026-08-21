// Spitzer Moden — Shop-Demo (Produktraster, Produktdetail, Warenkorb, Kasse-Attrappe).
// Grundsatz wie app.js: kein Versand, keine Speicherung von Kontaktdaten, keine externen
// Aufrufe. Der Warenkorb-Zustand selbst darf über sessionStorage zwischen shop.html und
// warenkorb.html wandern (s. Spec §6) — verlässt den Browser-Tab dabei nie.

// PRODUKTE: Beispiel-Sortiment (10 Artikel, siehe Spec §5) — vollständig erfunden, keine
// Markennamen, keine Modellnummern. Bewusst auf MODULEBENE, außerhalb beider IIFEs unten:
// Task 3 liest denselben Array aus einer eigenen, separaten IIFE (warenkorb.html) für
// Namens-/Preis-Lookup — eine IIFE-lokale Deklaration wäre dort per Scope unerreichbar.
const PRODUKTE = [
  {
    id: 'bluse-zeitlos',
    bereich: 'damen',
    name: 'Bluse „Zeitlos"',
    warengruppe: 'Blusen',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 79,
  },
  {
    id: 'kleid-abendlicht',
    bereich: 'damen',
    name: 'Kleid „Abendlicht"',
    warengruppe: 'Kleider',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 149,
  },
  {
    id: 'blazer-business-d',
    bereich: 'damen',
    name: 'Blazer „Business"',
    warengruppe: 'Blazer',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 129,
  },
  {
    id: 'rock-eleganz',
    bereich: 'damen',
    name: 'Rock „Eleganz"',
    warengruppe: 'Röcke',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 69,
  },
  {
    id: 'hose-basic-d',
    bereich: 'damen',
    name: 'Hose „Basic"',
    warengruppe: 'Hosen',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 89,
  },
  {
    id: 'hemd-klassik',
    bereich: 'herren',
    name: 'Hemd „Klassik"',
    warengruppe: 'Hemden',
    groessen: ['S', 'M', 'L', 'XL', 'XXL'],
    preis: 69,
  },
  {
    id: 'sakko-business-h',
    bereich: 'herren',
    name: 'Sakko „Business"',
    warengruppe: 'Sakkos',
    groessen: ['46', '48', '50', '52', '54'],
    preis: 199,
  },
  {
    id: 'anzug-komplett',
    bereich: 'herren',
    name: 'Anzug „Komplett" (Sakko + Hose)',
    warengruppe: 'Anzüge',
    groessen: ['46', '48', '50', '52', '54'],
    preis: 349,
  },
  {
    id: 'hose-chino',
    bereich: 'herren',
    name: 'Hose „Chino"',
    warengruppe: 'Hosen',
    groessen: ['46', '48', '50', '52', '54'],
    preis: 79,
  },
  {
    id: 'pullover-casual',
    bereich: 'herren',
    name: 'Pullover „Casual"',
    warengruppe: 'Pullover',
    groessen: ['S', 'M', 'L', 'XL', 'XXL'],
    preis: 89,
  },
];

// Preis-Ausnahme (Spec §6): JEDE Preisnennung im Shop MUSS unmittelbar „Beispielpreis"
// enthalten. Einzige Stelle, die Preise ins Markup schreibt. Ebenfalls auf MODULEBENE (wie
// PRODUKTE oben) — Karte/Detail (erste IIFE, shop.html) UND Warenkorb-Zeilen (zweite IIFE,
// warenkorb.html) teilen sich dieselbe Funktion, keine Duplizierung der Preis-Darstellung.
const fuelleBeispielpreis = (container, preis, praefix = '') => {
  container.textContent = '';
  if (praefix) container.append(praefix);
  const stark = document.createElement('strong');
  stark.textContent = 'Beispielpreis';
  container.append(stark, ` ${preis} €`);
};

// Shop-Raster + Produktdetail + Mini-Warenkorb-Leiste, läuft nur auf shop.html
// (dort existiert #produkt-raster).
(() => {
  'use strict';

  const produktRaster = document.querySelector('#produkt-raster');
  if (!produktRaster) return;

  const WARENKORB_KEY = 'spitzer-warenkorb';

  const bereichButtons = document.querySelectorAll('#bereich-toggle .bereich-toggle-btn');
  const produktDetail = document.querySelector('#produkt-detail');
  const detailZurueck = produktDetail?.querySelector('[data-zurueck]');
  const detailBild = document.querySelector('#produkt-detail-bild');
  const detailName = document.querySelector('#produkt-detail-name');
  const detailPreis = document.querySelector('#produkt-detail-preis');
  const detailGroessenListe = document.querySelector('#produkt-detail-groessen-liste');
  const detailMenge = document.querySelector('#produkt-detail-menge-select');
  const detailHinzufuegen = document.querySelector('#produkt-detail-hinzufuegen');
  const detailHinweis = document.querySelector('#produkt-detail-hinweis');
  const warenkorbZaehler = document.querySelector('#warenkorb-zaehler');
  const warenkorbZwischensumme = document.querySelector('#warenkorb-zwischensumme');

  // Warenkorb-Zustand: In-Memory-Array, gespiegelt in sessionStorage unter WARENKORB_KEY.
  // Struktur je Zeile: {produktId, groesse, menge}. Keine Netzwerk-Aufrufe — bleibt im Browser-Tab.
  const ladeWarenkorb = () => {
    try {
      const roh = sessionStorage.getItem(WARENKORB_KEY);
      const geparst = roh ? JSON.parse(roh) : [];
      return Array.isArray(geparst) ? geparst : [];
    } catch {
      return [];
    }
  };

  let warenkorb = ladeWarenkorb();

  const speichereWarenkorb = () => {
    try {
      sessionStorage.setItem(WARENKORB_KEY, JSON.stringify(warenkorb));
    } catch {
      // sessionStorage evtl. nicht verfügbar (privater Modus/Speicher voll) — Warenkorb bleibt
      // in diesem Fall nur für die aktuelle Seitenansicht erhalten.
    }
  };

  const aktualisiereWarenkorbAnzeige = () => {
    const anzahl = warenkorb.reduce((summe, zeile) => summe + zeile.menge, 0);
    if (warenkorbZaehler) warenkorbZaehler.textContent = String(anzahl);
    if (!warenkorbZwischensumme) return;

    if (anzahl === 0) {
      warenkorbZwischensumme.textContent = 'Ihr Warenkorb ist noch leer.';
      return;
    }
    const summe = Math.round(
      warenkorb.reduce((teilsumme, zeile) => {
        const produkt = PRODUKTE.find((eintrag) => eintrag.id === zeile.produktId);
        return teilsumme + (produkt ? produkt.preis * zeile.menge : 0);
      }, 0),
    );
    warenkorbZwischensumme.textContent = '';
    warenkorbZwischensumme.append(`${anzahl} Artikel · `);
    const stark = document.createElement('strong');
    stark.textContent = 'Beispiel-Zwischensumme';
    warenkorbZwischensumme.append(stark, ` ${summe} €`);
  };

  const renderGroessenChips = (groessen) => {
    if (!detailGroessenListe) return;
    detailGroessenListe.textContent = '';
    groessen.forEach((groesse, index) => {
      const chip = document.createElement('label');
      chip.className = 'groessen-chip';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'produkt-groesse';
      input.value = groesse;
      if (index === 0) input.checked = true;
      const beschriftung = document.createElement('span');
      beschriftung.textContent = groesse;
      chip.append(input, beschriftung);
      detailGroessenListe.append(chip);
    });
  };

  let aktuellesProdukt = null;

  const schliesseDetail = () => {
    if (produktDetail) produktDetail.hidden = true;
    aktuellesProdukt = null;
  };

  const oeffneDetail = (produkt) => {
    if (!produktDetail) return;
    aktuellesProdukt = produkt;
    if (detailBild) {
      detailBild.src = `assets/produkt-${produkt.id}.jpg`;
      detailBild.alt = `${produkt.name} — Beispielfoto`;
    }
    if (detailName) detailName.textContent = produkt.name;
    if (detailPreis) fuelleBeispielpreis(detailPreis, produkt.preis);
    renderGroessenChips(produkt.groessen);
    if (detailMenge) detailMenge.value = '1';
    if (detailHinweis) {
      detailHinweis.hidden = true;
      detailHinweis.textContent = '';
    }
    produktDetail.hidden = false;
    produktDetail.scrollIntoView({ block: 'start' });
  };

  const baueProduktKachel = (produkt) => {
    const artikel = document.createElement('article');
    artikel.className = 'produkt-kachel';
    artikel.dataset.produkt = produkt.id;

    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'produkt-kachel-btn';
    knopf.setAttribute('aria-label', `${produkt.name} ansehen`);
    knopf.addEventListener('click', () => oeffneDetail(produkt));

    const bildWrapper = document.createElement('div');
    bildWrapper.className = 'produkt-bild';
    const bild = document.createElement('img');
    bild.src = `assets/produkt-${produkt.id}.jpg`;
    bild.alt = `${produkt.name} — Beispielfoto`;
    bild.loading = 'lazy';
    bild.width = 1000;
    bild.height = 1250;
    bildWrapper.append(bild);

    const text = document.createElement('div');
    text.className = 'produkt-text';
    const warengruppe = document.createElement('span');
    warengruppe.className = 'produkt-warengruppe';
    warengruppe.textContent = produkt.warengruppe;
    const name = document.createElement('h3');
    name.textContent = produkt.name;
    const preis = document.createElement('span');
    preis.className = 'produkt-preis';
    fuelleBeispielpreis(preis, produkt.preis, 'ab ');
    text.append(warengruppe, name, preis);

    knopf.append(bildWrapper, text);
    artikel.append(knopf);
    return artikel;
  };

  const renderRaster = (bereich) => {
    // Nur die Produktkarten entfernen, nicht das statische (visually-hidden) h2 in
    // shop.html — das verhindert einen h1→h3-Sprung für Screenreader/axe.
    for (const karte of produktRaster.querySelectorAll('.produkt-kachel')) karte.remove();
    for (const produkt of PRODUKTE.filter((eintrag) => eintrag.bereich === bereich)) {
      produktRaster.append(baueProduktKachel(produkt));
    }
  };

  const setzeBereich = (bereich) => {
    for (const button of bereichButtons) {
      const istAktiv = button.dataset.bereich === bereich;
      button.classList.toggle('is-aktiv', istAktiv);
      button.setAttribute('aria-selected', String(istAktiv));
    }
    renderRaster(bereich);
    schliesseDetail();
  };

  for (const button of bereichButtons) {
    button.addEventListener('click', () => setzeBereich(button.dataset.bereich));
  }

  if (detailZurueck) detailZurueck.addEventListener('click', schliesseDetail);

  if (detailHinzufuegen) {
    detailHinzufuegen.addEventListener('click', () => {
      if (!aktuellesProdukt) return;
      const ausgewaehlt = detailGroessenListe?.querySelector(
        'input[name="produkt-groesse"]:checked',
      );
      const groesse = ausgewaehlt ? ausgewaehlt.value : aktuellesProdukt.groessen[0];
      const menge = Number(detailMenge?.value ?? '1') || 1;

      warenkorb.push({ produktId: aktuellesProdukt.id, groesse, menge });
      speichereWarenkorb();
      aktualisiereWarenkorbAnzeige();

      if (detailHinweis) {
        detailHinweis.textContent =
          `${aktuellesProdukt.name} (Größe ${groesse}) wurde in Ihren Warenkorb gelegt.`;
        detailHinweis.hidden = false;
      }
    });
  }

  // ?bereich=-Parameter aus Hero-/Bereichskacheln-Links (index.html) setzt die Startauswahl.
  const parameter = new URLSearchParams(window.location.search);
  const startBereich = parameter.get('bereich') === 'herren' ? 'herren' : 'damen';

  aktualisiereWarenkorbAnzeige();
  setzeBereich(startBereich);
})();

// Warenkorb-Übersicht (Kasse-Attrappe), läuft nur auf warenkorb.html
// (dort existiert #warenkorb-liste).
(() => {
  'use strict';

  const warenkorbListe = document.querySelector('#warenkorb-liste');
  if (!warenkorbListe) return;

  const WARENKORB_KEY = 'spitzer-warenkorb';

  const warenkorbLeer = document.querySelector('#warenkorb-leer');
  const form = document.querySelector('#warenkorb-form');
  const fehler = form?.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  const zusammenfassung = document.querySelector('[data-zusammenfassung]');
  const neustart = document.querySelector('[data-neustart]');

  // Gleiches Lese-/Schreib-Muster wie in der ersten IIFE (shop.html) — leeres Array bei
  // null/Parse-Fehler statt Absturz, z.B. bei Direktaufruf von warenkorb.html ohne Shop-Besuch.
  const ladeWarenkorb = () => {
    try {
      const roh = sessionStorage.getItem(WARENKORB_KEY);
      const geparst = roh ? JSON.parse(roh) : [];
      return Array.isArray(geparst) ? geparst : [];
    } catch {
      return [];
    }
  };

  let warenkorb = ladeWarenkorb();

  const speichereWarenkorb = () => {
    try {
      sessionStorage.setItem(WARENKORB_KEY, JSON.stringify(warenkorb));
    } catch {
      // sessionStorage evtl. nicht verfügbar — Änderung bleibt nur für die aktuelle Ansicht.
    }
  };

  const leereWarenkorb = () => {
    warenkorb = [];
    try {
      sessionStorage.removeItem(WARENKORB_KEY);
    } catch {
      // sessionStorage evtl. nicht verfügbar — Array ist ohnehin schon geleert.
    }
  };

  const zeilensumme = (zeile) => {
    const produkt = PRODUKTE.find((eintrag) => eintrag.id === zeile.produktId);
    return produkt ? produkt.preis * zeile.menge : 0;
  };

  const gesamtsumme = () => Math.round(warenkorb.reduce((summe, zeile) => summe + zeilensumme(zeile), 0));

  const baueWarenkorbZeile = (zeile, index) => {
    const produkt = PRODUKTE.find((eintrag) => eintrag.id === zeile.produktId);
    const name = produkt ? produkt.name : 'Unbekannter Artikel';

    const artikel = document.createElement('article');
    artikel.className = 'warenkorb-zeile';

    const info = document.createElement('div');
    info.className = 'warenkorb-zeile-info';

    const titel = document.createElement('h3');
    titel.textContent = name;

    const details = document.createElement('p');
    details.className = 'warenkorb-zeile-details';
    details.textContent = `Größe ${zeile.groesse} · Menge ${zeile.menge}`;

    const einzelpreis = document.createElement('p');
    einzelpreis.className = 'warenkorb-zeile-preis';
    fuelleBeispielpreis(einzelpreis, produkt ? produkt.preis : 0, 'je ');

    const summe = document.createElement('p');
    summe.className = 'warenkorb-zeile-summe';
    fuelleBeispielpreis(summe, zeilensumme(zeile), 'Zeilensumme ');

    info.append(titel, details, einzelpreis, summe);

    const entfernenBtn = document.createElement('button');
    entfernenBtn.type = 'button';
    entfernenBtn.className = 'btn btn--kontur warenkorb-entfernen';
    entfernenBtn.textContent = 'Entfernen';
    entfernenBtn.setAttribute('aria-label', `${name} (Größe ${zeile.groesse}) entfernen`);
    entfernenBtn.addEventListener('click', () => {
      warenkorb.splice(index, 1);
      speichereWarenkorb();
      render();
    });

    artikel.append(info, entfernenBtn);
    return artikel;
  };

  const render = () => {
    // Nur die zuvor gerenderten Zeilen/die Gesamtsumme entfernen, nicht das statische
    // (visually-hidden) h2 in warenkorb.html — das verhindert einen h1→h3-Sprung für
    // Screenreader/axe, analog renderRaster() in der ersten IIFE (shop.html).
    for (const element of warenkorbListe.querySelectorAll('.warenkorb-zeile, .warenkorb-gesamt')) {
      element.remove();
    }

    const istLeer = warenkorb.length === 0;
    if (warenkorbLeer) warenkorbLeer.hidden = !istLeer;
    if (form) form.hidden = istLeer;
    if (istLeer) return;

    warenkorb.forEach((zeile, index) => warenkorbListe.append(baueWarenkorbZeile(zeile, index)));

    const gesamtZeile = document.createElement('p');
    gesamtZeile.className = 'warenkorb-gesamt';
    const stark = document.createElement('strong');
    stark.textContent = 'Beispiel-Gesamtsumme';
    gesamtZeile.append(stark, ` ${gesamtsumme()} €`);
    warenkorbListe.append(gesamtZeile);
  };

  render();

  // Kontakt-Schritt: identisches Validierungsmuster wie anfrage.html (Vorname+Nachname Pflicht,
  // Telefon >= 7 Ziffern) — sendet nichts, es wird nichts gespeichert.
  if (form) {
    form.addEventListener('submit', (ereignis) => {
      ereignis.preventDefault();

      const vorname = form.querySelector('#vorname').value.trim();
      const nachname = form.querySelector('#nachname').value.trim();
      const telefon = form.querySelector('#telefon').value.trim();
      const ziffern = telefon.replace(/\D/g, '');

      let meldung = '';
      if (!vorname || !nachname) {
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

      const anzahl = warenkorb.reduce((summe, zeile) => summe + zeile.menge, 0);
      const artikelText = warenkorb
        .map((zeile) => {
          const produkt = PRODUKTE.find((eintrag) => eintrag.id === zeile.produktId);
          const name = produkt ? produkt.name : 'Unbekannter Artikel';
          return `${name} (Größe ${zeile.groesse}, ${zeile.menge}×)`;
        })
        .join(', ');

      if (zusammenfassung) {
        zusammenfassung.textContent =
          `Demo-Zusammenfassung: ${anzahl} Artikel — ${artikelText} · ` +
          `Beispiel-Gesamtsumme ${gesamtsumme()} € · ${vorname} ${nachname}`;
      }

      // Erfolgsfall: Warenkorb + sessionStorage leeren — die Bestätigung zeigt die Zusammenfassung
      // bereits eingefroren im Text oben, der Warenkorb selbst gilt als „abgeschickt". render()
      // räumt dabei auch die alten Warenkorb-Zeilen (inkl. ihrer Entfernen-Buttons) aus dem DOM;
      // das eigene Leer-Zustand-Banner wird direkt danach wieder unterdrückt, damit es nicht
      // neben der Bestätigung auftaucht.
      leereWarenkorb();
      render();
      if (warenkorbLeer) warenkorbLeer.hidden = true;
      form.hidden = true;
      if (bestaetigung) {
        bestaetigung.hidden = false;
        bestaetigung.scrollIntoView({ block: 'start' });
      }
    });
  }

  if (neustart) {
    neustart.addEventListener('click', () => {
      if (bestaetigung) bestaetigung.hidden = true;
      if (fehler) fehler.hidden = true;
      form?.reset();
      leereWarenkorb();
      render();
      window.scrollTo({ top: 0 });
    });
  }
})();
