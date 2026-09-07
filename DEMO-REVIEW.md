# Demo-Überarbeitung · 7. September 2026

Nach dieser gemeinsamen Überarbeitung wurden Glanz und Gloria, Jost und
PopAlpin weiter ausgebaut: [neue interaktive Einstiege und ergänzende Prüfung](WOW-UMSETZUNG.md).
Die folgende Bestandsaufnahme beschreibt die erste Runde an allen 16 Demos.

Ausgangspunkt: `99074597`. Alle 16 Startseiten wurden bei 1440 und 390 Pixeln
aufgerufen und fotografiert. Bilder laden, kein horizontaler Seitenüberlauf.
Die größten Schwächen liegen im ersten Bildschirm und in der Bedienung.

## Gestaltungsrichtung

Die Identität jedes Betriebs bleibt erhalten: Wald und Tannengrün, Floristik und
Botanik, Goldschmiedewerkstatt und Smaragd, Konzertbühne und Gold, Werkstatt und
Blau. Die vorhandenen Schriften und die Bildwelt bleiben die Basis.

Die gemeinsame Vorschauleiste erhält ein eigenes, zurückhaltendes System:
Tinte `#15212b`, Weiß `#ffffff`, Nebel `#f4f7f9`, Grau `#596874`, Linie `#d7dee3`,
Fokusblau `#005fcc`. Systemschrift nur für diese Leiste; keine zusätzlichen Fonts.

Mobil: kompakte Marke und Menü, danach Aussage und Hauptaktion. Das Bild
unterstützt die Aussage. Desktop: bestehende Kompositionen erhalten; bei Pension,
Kosmetik und Reinigung den Einstieg gezielt neu ordnen.

```
Vorschauhinweis / zurück zu den Studien
Marke                         Menü
Aussage, kurzer Nutzen, Hauptaktion
Bild aus der Welt des Betriebs
Leistungen und interaktive Demo
```

Prüfung gegen den Auftrag: keine einheitliche neue Kartenschablone, keine neue
Bildwelt ohne Bezug zum Betrieb. Gemeinsame Navigation, individuelle Einstiege.

## Konkrete Arbeiten

| Demo | Beobachtung und Überarbeitung |
|---|---|
| Am Waldrand | Aussage erst unter großem Waldbild; Text und Zimmeraktion vorziehen. |
| Blumen Viva | Mehrzeilige mobile Navigation; kompakter Kopf, direkter Strauß-Einstieg. |
| Clean Cut | Erster Bildschirm besteht nur aus Slideshow; Aussage und Terminaktion ins Bild, Pause-Bedienung. |
| Durmus | Hoher mobiler Kopf und künstlicher Browserrahmen; Reinigung als klarer Bildeinstieg. |
| Gassert | Langer Kopf; Werkstatt und Fahrzeuge im Einstieg konkret benennen, Filterzustände zugänglich machen. |
| Glanz und Gloria | Mobil steht das Porträt vor Text und Beratung; Reihenfolge und Abstände korrigieren. |
| Goldener Hirsch | Kompakter Einstieg; bisher funktionslosen Anfrageknopf durch Formular mit Zusammenfassung und Bearbeiten ersetzen. Frühstück im Rechner als enthalten behandeln. |
| Jost | „Meisterstück“ erklärt das Angebot nicht; Malerhandwerk benennen, mobile Bildhöhe anpassen. |
| Kimberger | Aussage unter hohem Behandlungsbild; Pflegeangebot mit Bild nebeneinander, mobil Text zuerst. |
| Kompass | Vollbild-Intro blockiert den Inhalt für zwei Sekunden; entfernen, Kompass als bedienbares Detail behalten. |
| MOS Kebap | Kleine Schrift und pauschaler Öffnungsstatus; Lesbarkeit und Kennzeichnung der Beispielzeiten verbessern. |
| PopAlpin | Mobil verschwinden die Navigationslinks; echtes Menü und kürzerer Einstieg zum Termincheck. |
| Rubi | Hoher mobiler Kopf; Angebot und Anfrage schneller erreichen. |
| SML Spitzer | Hoher mobiler Kopf; Umzugsanfrage und Unternehmensseiten unmittelbar erreichbar machen. |
| Spitzer Moden | Hervorgehobenes Wort im Hero kontrastarm; klare Aussage, zugängliche Bereichsauswahl und Shop-Einstieg. |
| Angelika Watson | Großer Porträt-Platzhalter vor dem Angebot; Text und Kennenlernen zuerst, Platzhalter kompakter. |

Formulare: vergangene Wunschtermine abfangen, Anreise/Abreise verknüpfen,
Fehlermeldungen und Bestätigungen mit der Tastatur erreichbar machen. Auswahl
und Zusammenfassung werden mit Beispieldaten geprüft; nichts wird versendet.

## Prüfprotokoll

Abgeschlossen am 7. September 2026, lokal auf `http://127.0.0.1:4173/` in Chromium.

- 16 Startseiten und 19 Unterseiten in fünf Breiten: 320, 390, 768, 1024 und
  1440 Pixel. Nach Korrektur des Teamkalenders kein horizontaler Seitenüberlauf.
- Mobile Hauptmenüs auf allen 16 Startseiten: Öffnen, Escape, Rückgabe des Fokus,
  sichtbare Links und Wechsel zwischen Handy- und Desktopbreite geprüft.
- 14 Anfrageformulare: leere Pflichtangaben zurückgewiesen, Zusammenfassungen
  mit erfundenen Kontaktdaten erreicht, sichtbare Fehler und Bestätigungen
  fokussiert. Vergangene Datumswerte bei allen acht Formularen mit Datumseingabe
  zurückgewiesen.
- 13 Interaktionsabläufe geprüft: Clean-Cut-Buchung, MOS-Warenkorb und Abholung,
  Spitzer-Shop mit Größe und Menge, Hotelrechner mit Anfrage und Bearbeiten,
  Blumen- und Ringkonfigurator, Fahrzeugfilter, Behandlungsfinder, Farbansicht,
  Band-Termincheck, Umzugszeitplan, Coaching-Themenkompass und Pensionsplaner.
- Clean Cut verlangt jetzt eine konkrete Uhrzeit. Nach Abschluss ist der
  Beispielplatz belegt. Slideshow-Pause über einen vollständigen Wechselzyklus
  geprüft; manueller Wechsel funktioniert, reduzierte Bewegung startet pausiert.
- Beide Aufenthaltsplaner begrenzen die gezeichneten Tageskarten bei langen
  Aufenthalten, behalten aber die volle Nächtezahl und den Zeitraum bei.
- In den Formular- und Interaktionsprüfungen keine schreibenden Netzwerkanfragen
  beobachtet. Shopartikel bleiben wie zuvor nur im Browser-Tab; keine Zahlung
  oder echte Buchung wurde angelegt.
- 44 HTML-Seiten auf lokale Dateien, Sprungziele und doppelte IDs geprüft;
  20 externe beziehungsweise eingebettete JavaScript-Blöcke syntaktisch geprüft.
  Keine fehlenden Assets, keine JavaScript-Laufzeitfehler in den geprüften Demos.
- Alle 16 Einstiege und ausgewählte mittlere und untere Seitenabschnitte visuell
  kontrolliert. 16 neue Vorschaubilder in `assets/arbeiten/` aufgenommen.

Die wiederholbaren Browserprüfungen liegen in `scripts/review-*.js`. Jede Datei
enthält eine asynchrone Funktion mit dem Playwright-Argument `page`; sie kann mit
dem Playwright-Werkzeug über `filename` geladen werden. Voraussetzung ist der
lokale Webserver auf Port 4173. Die Prüfungen deaktivieren den HTTP-Cache.
Screenshots vor und nach der Bearbeitung liegen lokal unter `output/playwright/`.

## Umfang und Stand

Die Änderungen liegen im Arbeitszweig `codex/demo-review` und sind noch nicht
auf GitHub Pages veröffentlicht. Die 16 Studien bleiben als Entwürfe
gekennzeichnet und auf `noindex`. Vorhandene Beispielbilder, Preise,
Öffnungszeiten und Unternehmensangaben wurden bei dieser Gestaltungs- und
Funktionsrunde nicht neu recherchiert. Das separat verlinkte eigene Produkt
WohnSignal gehört nicht zu diesen 16 Studien.

Die Browserprüfung deckt Chromium ab; ein eigener Lauf in Safari und Firefox
steht noch aus.
