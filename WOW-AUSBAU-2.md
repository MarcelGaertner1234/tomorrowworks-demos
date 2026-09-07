# Wow-Ausbaustufe 2

## Gestaltungsplan · 7. September 2026

Umfang dieser Runde: Goldener Hirsch, Blumen Viva und Spitzer Moden. Die
Branchenlösungen aller 16 Betriebe sind bereits lokal bedienbar.

| Seite | Farben | Schrift | Aufbau und Interaktion |
|---|---|---|---|
| Goldener Hirsch | Tanne #2f5644, Kalk #faf7f2, Messing #c2a061, Tinte #211d17 | Baskerville für Einladung, Helvetica für Auswahl | Kompakter Hauskopf, große Fachwerk-/Zimmerbühne, ruhige Einladung links. Zimmerwahl öffnet dieselbe Bildfläche und übernimmt die Kategorie in den Aufenthaltsplaner. |
| Blumen Viva | Blatt #22402f, Blüte #a63a61, Rosa #f4dfe6, Papier #fbfaf6 | Avenir als Hauptschrift, Didot nur für die Grußkarte | Botanische Werkbank: große freigestellte Straußansicht links, direkt bedienbare Farb-/Größen-/Anlasswahl rechts. Die Grußkarte sitzt beim Strauß. |
| Spitzer Moden | Graphit #2a2825, Ecru #f5f0e6, Cognac #7c4726, Weiß #ffffff | Helvetica mit großer kompakter Überschrift | Lookbook als modische Doppelseite: Bild, wechselnder Looktitel und echte Auswahl der gezeigten Beispielteile. Größen bleiben einzeln wählbar. |

~~~
Hotel:     Einladung über Bild       | Zimmerauswahl im Bildrand
           Zeitraum im Planer        | Anfrage mit Zimmerwunsch
Blumen:    Strauß + persönliche Karte | Farbe / Umfang / Anlass / Gruß
Mode:      große Lookfotografie      | Lookwahl / Teile / Größen / Anprobe
~~~

Prüfung gegen den Auftrag: kein einheitliches Dreikartenraster. Das Hotel wird
über Räume entdeckt, die Floristik über eine wachsende Komposition und die Mode
über zusammengehörige Kleidungsstücke. Bestehende Hotelbilder bleiben erhalten;
neu generierte Blumen und Looks sind als Illustrationen beziehungsweise
Beispielkollektion gekennzeichnet. Bewegungen folgen der Auswahl und respektieren
reduzierte Bewegung. Freitext bleibt im Browser-Tab und erscheint nicht in URLs.

## Umsetzung und Prüfung

Lokal umgesetzt und geprüft am 7. September 2026:

- Goldener Hirsch: Fachwerkbühne und drei große Zimmeransichten. Die Auswahl
  steuert denselben Aufenthaltsplaner und das Anfrageformular; Personen, Zeitraum,
  Zimmerstil und Zusatzwunsch kommen in der Betriebsansicht an. Ein überbreiter
  Formularbereich auf kleinen Displays wurde beim visuellen Prüfen korrigiert.
- Blumen Viva: vier generierte freigestellte Sträuße, illustrative Größenänderung,
  Anlass und persönliche Grußkarte. Mobil gibt es eine zusätzliche Farbwahl direkt
  am Strauß. Der Entwurf bleibt lokal erhalten und wird einschließlich Grußkarte
  in die Anfrage und den Bindebon übernommen. Grußtexte stehen nie in der URL.
- Spitzer Moden: zwei generierte Looks mit vier passenden Beispielartikeln.
  Bildmarkierungen führen zur Größenwahl. Einzelne Teile lassen sich abwählen;
  unterschiedliche Größen und mehrere Looks bleiben im Warenkorb erhalten.
  Wiederholtes Vormerken legt dieselbe Artikel-/Größenkombination nicht doppelt an.
  Anprobe ist eine eigene Abwicklungsart im Formular und in der Betriebsansicht.
- Die drei Vorschaubilder und Beschreibungen in der Projektübersicht sind aktuell.

Prüfungen:

- Sechs neue Prüfgruppen bestanden: vollständiger Hotelablauf, Floristik bis zur
  Abholung, Lookbook bis zum Abschluss, neue Shopdetails, reduzierte Bewegung bei
  allen drei Einstiegen sowie Rücksetzen des persönlichen Grußkartenentwurfs.
- 13 bestehende Branchenabläufe nach den Änderungen erfolgreich wiederholt.
- 65 Prüfungen auf 13 Seiten bei 320, 390, 768, 1024 und 1440 Pixeln bestanden.
  Keine überbreiten Bedienfelder oder Textblöcke, defekten Bilder oder fehlenden
  Seiten; jeweils eine Hauptüberschrift. Desktop- und Handyaufnahmen geprüft.
- 75 HTML-Seiten auf lokale Verweise, Sprungziele und doppelte IDs geprüft.
  45 JavaScript-Dateien und zwei eingebettete Skripte syntaktisch geprüft.
- Keine JavaScript-Laufzeitfehler und keine schreibenden Netzwerkanfragen in den
  ausgeführten Abläufen. Größe ohne Auswahl, ungültiger Aufenthalt, doppelte
  Klicks und sichere Darstellung von Freitext ausdrücklich geprüft.

Der erste Reset-Test erwartete einen vollständig fehlenden Speichereintrag.
Tatsächlich setzt die Homepage nach dem Löschen einen leeren Standardentwurf ein.
Die Prüfung wurde auf die relevante Bedingung korrigiert: persönlicher Gruß und
Auswahl sind gelöscht. Anschließend bestanden alle sechs Gruppen erneut.

Wiederholbar mit scripts/review-wow-2.js, scripts/review-wow-2-layout.js und
scripts/review-industry-all.js. Ergebnisse unter output/wow-2/.
[Alle sechs Bilddateien, Originalpfade und Prompts](WOW-BILDMATERIAL-2.md).

Die Bilder zeigen Illustrationen und Beispielmode; die Straußgröße ist keine
maßstabsgetreue Produktkonfiguration. Keine produktiven Buchungen, Anprobetermine
oder Lagerdaten. Vorgänge bleiben in diesem Browser-Tab. Geprüft in Chromium;
Safari, Firefox und physische Mobilgeräte nicht separat geprüft. Nicht veröffentlicht.

Damit sind sechs der 16 zusätzlichen Wow-Einstiege umgesetzt. Zehn bleiben offen;
alle 16 Branchenlösungen sind bereits lokal bedienbar.
