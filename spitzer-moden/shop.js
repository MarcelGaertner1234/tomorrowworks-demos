// Spitzer Moden — Shop-Demo (Produktraster, Produktdetail, Warenkorb, Kasse-Attrappe).
// Grundsatz wie app.js: kein Versand, keine Speicherung von Kontaktdaten, keine externen
// Aufrufe. Der Warenkorb-Zustand selbst darf über sessionStorage zwischen shop.html und
// warenkorb.html wandern (s. Spec §6) — verlässt den Browser-Tab dabei nie.

// PRODUKTE: Beispiel-Sortiment (10 bisherige Artikel und 4 Teile aus dem Lookbook) — vollständig erfunden, keine
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
    bilder: [
      'assets/produkt-bluse-zeitlos-1.jpg',
      'assets/produkt-bluse-zeitlos-2.jpg',
      'assets/produkt-bluse-zeitlos-3.jpg',
    ],
  },
  {
    id: 'kleid-abendlicht',
    bereich: 'damen',
    name: 'Kleid „Abendlicht"',
    warengruppe: 'Kleider',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 149,
    bilder: [
      'assets/produkt-kleid-abendlicht-1.jpg',
      'assets/produkt-kleid-abendlicht-2.jpg',
      'assets/produkt-kleid-abendlicht-3.jpg',
    ],
  },
  {
    id: 'blazer-business-d',
    bereich: 'damen',
    name: 'Blazer „Business"',
    warengruppe: 'Blazer',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 129,
    bilder: [
      'assets/produkt-blazer-business-d-1.jpg',
      'assets/produkt-blazer-business-d-2.jpg',
      'assets/produkt-blazer-business-d-3.jpg',
    ],
  },
  {
    id: 'rock-eleganz',
    bereich: 'damen',
    name: 'Rock „Eleganz"',
    warengruppe: 'Röcke',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 69,
    bilder: [
      'assets/produkt-rock-eleganz-1.jpg',
      'assets/produkt-rock-eleganz-2.jpg',
      'assets/produkt-rock-eleganz-3.jpg',
    ],
  },
  {
    id: 'hose-basic-d',
    bereich: 'damen',
    name: 'Hose „Basic"',
    warengruppe: 'Hosen',
    groessen: ['34', '36', '38', '40', '42', '44'],
    preis: 89,
    bilder: [
      'assets/produkt-hose-basic-d-1.jpg',
      'assets/produkt-hose-basic-d-2.jpg',
      'assets/produkt-hose-basic-d-3.jpg',
    ],
  },
  {
    id: 'hemd-klassik',
    bereich: 'herren',
    name: 'Hemd „Klassik"',
    warengruppe: 'Hemden',
    groessen: ['S', 'M', 'L', 'XL', 'XXL'],
    preis: 69,
    bilder: [
      'assets/produkt-hemd-klassik-1.jpg',
      'assets/produkt-hemd-klassik-2.jpg',
      'assets/produkt-hemd-klassik-3.jpg',
    ],
  },
  {
    id: 'sakko-business-h',
    bereich: 'herren',
    name: 'Sakko „Business"',
    warengruppe: 'Sakkos',
    groessen: ['46', '48', '50', '52', '54'],
    preis: 199,
    bilder: [
      'assets/produkt-sakko-business-h-1.jpg',
      'assets/produkt-sakko-business-h-2.jpg',
      'assets/produkt-sakko-business-h-3.jpg',
    ],
  },
  {
    id: 'anzug-komplett',
    bereich: 'herren',
    name: 'Anzug „Komplett" (Sakko + Hose)',
    warengruppe: 'Anzüge',
    groessen: ['46', '48', '50', '52', '54'],
    preis: 349,
    bilder: [
      'assets/produkt-anzug-komplett-1.jpg',
      'assets/produkt-anzug-komplett-2.jpg',
      'assets/produkt-anzug-komplett-3.jpg',
    ],
  },
  {
    id: 'hose-chino',
    bereich: 'herren',
    name: 'Hose „Chino"',
    warengruppe: 'Hosen',
    groessen: ['46', '48', '50', '52', '54'],
    preis: 79,
    bilder: [
      'assets/produkt-hose-chino-1.jpg',
      'assets/produkt-hose-chino-2.jpg',
      'assets/produkt-hose-chino-3.jpg',
    ],
  },
  {
    id: 'pullover-casual',
    bereich: 'herren',
    name: 'Pullover „Casual"',
    warengruppe: 'Pullover',
    groessen: ['S', 'M', 'L', 'XL', 'XXL'],
    preis: 89,
    bilder: [
      'assets/produkt-pullover-casual-1.jpg',
      'assets/produkt-pullover-casual-2.jpg',
      'assets/produkt-pullover-casual-3.jpg',
    ],
  },
  ...SPITZER_LOOKS.flatMap(look => look.products),
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

// Warenkorb-sessionStorage-Hilfsfunktionen — wie PRODUKTE/fuelleBeispielpreis oben EINMAL auf
// MODULEBENE, außerhalb beider IIFEs. Beide IIFEs (shop.html-Raster/Detail UND
// warenkorb.html-Übersicht) teilen sich dieselbe Implementierung, keine Duplizierung des
// Lese-/Schreib-/Leer-Musters (war zuvor fast wortgleich in beiden IIFEs dupliziert).
const WARENKORB_KEY = 'spitzer-warenkorb';

// Struktur je Zeile: {produktId, groesse, menge}. Keine Netzwerk-Aufrufe — bleibt im Browser-Tab.
// Leeres Array bei null/Parse-Fehler statt Absturz, z.B. bei Direktaufruf von warenkorb.html ohne
// vorherigen Shop-Besuch.
const ladeWarenkorb = () => {
  try {
    const roh = sessionStorage.getItem(WARENKORB_KEY);
    const geparst = roh ? JSON.parse(roh) : [];
    return Array.isArray(geparst) ? geparst : [];
  } catch {
    return [];
  }
};

// Nimmt den aktuellen Warenkorb als Parameter entgegen (statt über eine IIFE-lokale Closure-
// Variable), damit beide IIFEs — jede mit ihrem eigenen `warenkorb`-Array — dieselbe Funktion
// aufrufen können.
const speichereWarenkorb = (warenkorb) => {
  try {
    sessionStorage.setItem(WARENKORB_KEY, JSON.stringify(warenkorb));
  } catch {
    // sessionStorage evtl. nicht verfügbar (privater Modus/Speicher voll) — Warenkorb bleibt
    // in diesem Fall nur für die aktuelle Seitenansicht erhalten.
  }
};

// Leert nur den sessionStorage-Eintrag — das Zurücksetzen des IIFE-lokalen `warenkorb`-Arrays
// bleibt Sache des jeweiligen Aufrufers (nur die zweite IIFE braucht das aktuell).
const leereWarenkorb = () => {
  try {
    sessionStorage.removeItem(WARENKORB_KEY);
  } catch {
    // sessionStorage evtl. nicht verfügbar — Array ist ohnehin schon geleert.
  }
};

// Nummernkreis Beispiel-Bestellnummer (SM-2026-201, 202, … — Kassen-Abschluss, Stufe 3), auf
// Modulebene wie WARENKORB_KEY oben deklariert, NICHT innerhalb der zweiten IIFE: der Zähler muss
// über einen Klick auf „Neuer Demo-Warenkorb" (Neustart) hinweg hochzählen, statt bei jedem
// Durchlauf wieder bei 201 zu starten. Startwert 200 (erste vergebene Nummer also 201). Zusätzlich
// in sessionStorage gespiegelt (analog WARENKORB_KEY) — sonst würde ein Seitenwechsel
// shop.html<->warenkorb.html (unvermeidbar, um dem leeren Warenkorb nach Neustart neue Artikel zu
// geben — diese Seite hat kein eigenes „Artikel hinzufügen") den Zähler zurück auf 200 setzen und
// zwei Demo-Bestellungen im selben Browser-Tab könnten dieselbe Nummer zeigen.
const BESTELL_ZAEHLER_KEY = 'spitzer-bestellzaehler';
let bestellZaehler = 200;
try {
  const gespeicherterZaehler = Number(sessionStorage.getItem(BESTELL_ZAEHLER_KEY));
  if (Number.isFinite(gespeicherterZaehler) && gespeicherterZaehler >= 200) {
    bestellZaehler = gespeicherterZaehler;
  }
} catch {
  // sessionStorage evtl. nicht verfügbar — Zähler bleibt bei 200 (Start dieser Seitenansicht).
}

// Shop-Raster + Produktdetail + Mini-Warenkorb-Leiste, läuft nur auf shop.html
// (dort existiert #produkt-raster).
(() => {
  'use strict';

  const produktRaster = document.querySelector('#produkt-raster');
  if (!produktRaster) return;

  const bereichButtons = document.querySelectorAll('#bereich-toggle .bereich-toggle-btn');
  const produktDetail = document.querySelector('#produkt-detail');
  const detailZurueck = produktDetail?.querySelector('[data-zurueck]');
  const detailBild = document.querySelector('#produkt-detail-bild');
  const detailGalerieThumbnails = document.querySelector('.produkt-galerie-thumbnails');
  const detailName = document.querySelector('#produkt-detail-name');
  const detailPreis = document.querySelector('#produkt-detail-preis');
  const detailGroessenListe = document.querySelector('#produkt-detail-groessen-liste');
  const detailMenge = document.querySelector('#produkt-detail-menge-select');
  const detailHinzufuegen = document.querySelector('#produkt-detail-hinzufuegen');
  const detailHinweis = document.querySelector('#produkt-detail-hinweis');
  const warenkorbZaehler = document.querySelector('#warenkorb-zaehler');
  const warenkorbZwischensumme = document.querySelector('#warenkorb-zwischensumme');

  // Warenkorb-Zustand: In-Memory-Array dieser IIFE, gespiegelt in sessionStorage über die
  // modulweiten Hilfsfunktionen ladeWarenkorb/speichereWarenkorb oben (kein Duplikat mehr).
  let warenkorb = ladeWarenkorb();

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

  // Galerie-Index des aktuell im Hauptbild gezeigten Fotos (0 = erstes der vorhandenen Bilder in
  // produkt.bilder). Zurückgesetzt auf 0 bei jedem neuen Produkt-Klick (oeffneDetail unten).
  let aktiverGalerieIndex = 0;

  const schliesseDetail = () => {
    if (produktDetail) produktDetail.hidden = true;
    aktuellesProdukt = null;
  };

  // Setzt Hauptbild-src/alt auf produkt.bilder[index] und markiert den passenden Thumbnail-Button
  // per aria-current — sowohl beim initialen Öffnen (index 0) als auch bei jedem Thumbnail-Klick.
  const zeigeGalerieBild = (produkt, index) => {
    aktiverGalerieIndex = index;
    if (detailBild) {
      detailBild.src = produkt.bilder[index];
      detailBild.alt = `${produkt.name} — ${produkt.look ? 'KI-Beispiel im Gesamtlook' : 'Beispielfoto'}${index > 0 ? `, Ansicht ${index + 1}` : ''}`;
    }
    if (!detailGalerieThumbnails) return;
    for (const thumbBtn of detailGalerieThumbnails.querySelectorAll('.produkt-galerie-thumb')) {
      const istAktiv = Number(thumbBtn.dataset.index) === index;
      thumbBtn.setAttribute('aria-current', String(istAktiv));
    }
  };

  // Baut alle 3 Thumbnail-Buttons (Index 0 + 1 + 2 — inkl. Index 0, damit es nach einem Wechsel
  // auf Ansicht 2/3 immer einen Rückweg zum Hauptbild/Ansicht 1 gibt) neu auf, je Produkt-Klick,
  // damit sie immer zum aktuell geöffneten Produkt gehören.
  const renderGalerieThumbnails = (produkt) => {
    if (!detailGalerieThumbnails) return;
    detailGalerieThumbnails.textContent = '';
    produkt.bilder.forEach((_, index) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = 'produkt-galerie-thumb';
      thumbBtn.dataset.index = String(index);
      // Immer 'false' beim (Neu-)Aufbau — oeffneDetail() ruft direkt danach synchron
      // zeigeGalerieBild(produkt, 0) auf, das den echten aria-current-Zustand setzt (für Index 0
      // wird das direkt im Anschluss auf 'true' korrigiert, für Index 1/2 bleibt es 'false' — ein
      // Abgleich gegen aktiverGalerieIndex hier wäre ohnehin immer sofort überschriebene,
      // irreführende Logik).
      thumbBtn.setAttribute('aria-current', 'false');

      const thumbBild = document.createElement('img');
      thumbBild.src = produkt.bilder[index];
      thumbBild.alt = `${produkt.name} — Beispielfoto, Ansicht ${index + 1}`;
      thumbBild.loading = 'lazy';
      thumbBild.width = 1000;
      thumbBild.height = 1250;
      thumbBtn.append(thumbBild);

      thumbBtn.addEventListener('click', () => zeigeGalerieBild(produkt, index));
      detailGalerieThumbnails.append(thumbBtn);
    });
  };

  const oeffneDetail = (produkt) => {
    if (!produktDetail) return;
    aktuellesProdukt = produkt;
    renderGalerieThumbnails(produkt);
    zeigeGalerieBild(produkt, 0);
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
    bild.src = produkt.bilder[0];
    bild.alt = `${produkt.name} — ${produkt.look ? 'KI-Beispiel im Gesamtlook' : 'Beispielfoto'}`;
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

      // Gleiches Produkt + gleiche Größe bereits im Warenkorb → Menge addieren statt einer
      // zweiten, identischen Zeile (wirkte auf einem Live-Call unfertig, Review-Fund #7).
      const bestehendeZeile = warenkorb.find(
        (zeile) => zeile.produktId === aktuellesProdukt.id && zeile.groesse === groesse,
      );
      if (bestehendeZeile) {
        bestehendeZeile.menge += menge;
      } else {
        warenkorb.push({ produktId: aktuellesProdukt.id, groesse, menge });
      }
      speichereWarenkorb(warenkorb);
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

  const warenkorbLeer = document.querySelector('#warenkorb-leer');
  const form = document.querySelector('#warenkorb-form');
  const fehler = form?.querySelector('[data-fehler]');
  const bestaetigung = document.querySelector('[data-bestaetigung]');
  // Strukturierte Bestätigungs-Blöcke (Kassen-Abschluss, Stufe 3) — ersetzen die frühere einzelne
  // [data-zusammenfassung]-Fließtext-Zeile; der umschließende [data-zusammenfassung]-Container
  // selbst braucht keine JS-Referenz mehr, da nur noch seine Kind-Elemente befüllt werden.
  if (new URLSearchParams(location.search).get('anprobe') === '1') form.querySelector('[name="abwicklung"][value="anprobe"]').checked = true;
  const updateRequestLabel = () => {
    const fitting = form.querySelector('[name="abwicklung"]:checked')?.value === 'anprobe';
    form.querySelector('button[type="submit"]').textContent = fitting ? 'Anprobe-Anfrage vorbereiten' : 'Bestellanfrage vorbereiten';
    bestaetigung.querySelector('h2').textContent = fitting ? 'Ihre Demo-Anprobe ist angefragt' : 'Ihre Demo-Bestellanfrage steht';
  };
  form.querySelectorAll('[name="abwicklung"]').forEach(input => input.addEventListener('change', updateRequestLabel));
  form.addEventListener('reset', () => queueMicrotask(updateRequestLabel));
  updateRequestLabel();
  const bestellNummer = document.querySelector('[data-bestell-nummer]');
  const bestellAbwicklung = document.querySelector('[data-bestell-abwicklung]');
  const bestellArtikel = document.querySelector('[data-bestell-artikel]');
  const bestellSumme = document.querySelector('[data-bestell-summe]');
  const neustart = document.querySelector('[data-neustart]');

  // In-Memory-Array dieser IIFE, gespiegelt in sessionStorage über die modulweiten
  // Hilfsfunktionen ladeWarenkorb/speichereWarenkorb/leereWarenkorb oben (kein Duplikat mehr) —
  // leeres Array bei null/Parse-Fehler statt Absturz, z.B. bei Direktaufruf von warenkorb.html
  // ohne vorherigen Shop-Besuch.
  let warenkorb = ladeWarenkorb();

  // leereWarenkorb() (modulweit) leert nur sessionStorage — das lokale `warenkorb`-Array muss
  // diese IIFE selbst zurücksetzen.
  const leereWarenkorbUndZustand = () => {
    warenkorb = [];
    leereWarenkorb();
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
      speichereWarenkorb(warenkorb);
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

      // Kassen-Abschluss (Stufe 3): alles für die Bestätigung Nötige VOR dem Leeren des
      // Warenkorbs einsammeln — Beispiel-Bestellnummer vergeben + gespiegelt in sessionStorage
      // (überlebt so auch einen Seitenwechsel, s. bestellZaehler-Kommentar oben), gewählte
      // Abwicklung aus dem eigenen Radio-Label lesen (trägt die "(Beispiel)"-Kennzeichnung schon),
      // Artikel-Schnappschuss aus dem Warenkorb-State + PRODUKTE-Lookup, Summe aus der
      // bestehenden gesamtsumme()-Logik.
      bestellZaehler += 1;
      const bestellNummerWert = `SM-2026-${bestellZaehler}`;
      try {
        sessionStorage.setItem(BESTELL_ZAEHLER_KEY, String(bestellZaehler));
      } catch {
        // sessionStorage evtl. nicht verfügbar — Zähler bleibt nur für diese Seitenansicht erhalten.
      }

      const abwicklungInput = form.querySelector('input[name="abwicklung"]:checked');
      const abwicklungWert =
        abwicklungInput?.closest('label')?.textContent.trim().replace(/\s+/g, ' ') ?? '';

      const artikelSchnappschuss = warenkorb.map((zeile) => {
        const produkt = PRODUKTE.find((eintrag) => eintrag.id === zeile.produktId);
        return {
          name: produkt ? produkt.name : 'Unbekannter Artikel',
          groesse: zeile.groesse,
          menge: zeile.menge,
        };
      });
      const summeWert = gesamtsumme();
      if (!BranchDemo.accept(form, bestaetigung, {items:artikelSchnappschuss.map((item,index)=>({...item,productId:warenkorb[index].produktId})),total:summeWert})) return;

      // Erfolgsfall: Warenkorb + sessionStorage leeren — die Bestätigung zeigt den oben schon
      // eingefrorenen Schnappschuss, der Warenkorb selbst gilt als „abgeschickt". render() räumt
      // dabei auch die alten Warenkorb-Zeilen (inkl. ihrer Entfernen-Buttons) aus dem DOM; das
      // eigene Leer-Zustand-Banner wird direkt danach wieder unterdrückt, damit es nicht neben der
      // Bestätigung auftaucht.
      leereWarenkorbUndZustand();
      render();
      if (warenkorbLeer) warenkorbLeer.hidden = true;
      form.hidden = true;

      if (bestaetigung) {
        // Wizard-/aria-live-Reihenfolge: erst sichtbar machen, DANN befüllen, DANN den Fokus
        // dorthin lenken — sonst würden Screenreader/AT den hidden=false-Zustand mit noch leerem
        // Inhalt ankündigen.
        bestaetigung.hidden = false;

        if (bestellNummer) {
          bestellNummer.textContent = '';
          const starkNummer = document.createElement('strong');
          starkNummer.textContent = 'Vorgangsnummer';
          bestellNummer.append(starkNummer, ` ${form.dataset.branchId}`);
        }

        if (bestellAbwicklung) {
          bestellAbwicklung.textContent = '';
          const starkAbwicklung = document.createElement('strong');
          starkAbwicklung.textContent = 'Abwicklung';
          bestellAbwicklung.append(starkAbwicklung, ` ${abwicklungWert}`);
        }

        if (bestellArtikel) {
          bestellArtikel.textContent = '';
          artikelSchnappschuss.forEach(({ name, groesse, menge }) => {
            const eintrag = document.createElement('li');
            eintrag.textContent = `${name} · Größe ${groesse} · Menge ${menge}`;
            bestellArtikel.append(eintrag);
          });
        }

        if (bestellSumme) {
          bestellSumme.textContent = '';
          const starkSumme = document.createElement('strong');
          starkSumme.textContent = 'Beispiel-Gesamtsumme';
          bestellSumme.append(starkSumme, ` ${summeWert} €`);
        }

        bestaetigung.scrollIntoView({ block: 'start' });
        bestaetigung.focus();
      }
    });
  }

  if (neustart) {
    neustart.addEventListener('click', () => {
      if (bestaetigung) bestaetigung.hidden = true;
      if (fehler) fehler.hidden = true;
      // form.reset() setzt auch die Abwicklung-Radiogruppe auf ihren HTML-Default (Abholung,
      // checked-Attribut auf dem Radio in warenkorb.html) zurück — kein zusätzlicher Code nötig.
      form?.reset();
      leereWarenkorbUndZustand();
      render();
      window.scrollTo({ top: 0 });
    });
  }
})();
