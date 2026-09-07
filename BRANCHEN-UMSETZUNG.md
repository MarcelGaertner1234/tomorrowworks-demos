# Branchenlösungen · Ausbaustufe 1

## Gestaltungsplan

Die Kundenwelten bleiben erhalten. Die Betriebsansichten zeigen fachliche
Arbeitsmittel und greifen die jeweilige Schriftfamilie auf.

- Jost: Kalk #f6f5f1, Papier #ffffff, Tinte #28261f, Arbeitsblau #1c4e80,
  Salbei #63715c. Avenir für Projektakte und Formulare. Linksbündige Projektakte
  mit Raumdaten und Farbidee; daneben Besichtigung und Angebotsvorbereitung.
- Clean Cut: Weiß #ffffff, Sand #e7ded0, Graphit #252723, Moos #56634c,
  Linie #c9ccbf. Bestehende Salon-Schrift. Der Tageskalender mit drei Personen
  ist das Hauptbild; ein ausgewählter Termin öffnet die Bearbeitung darunter.
- MOS: Papier #fffdf5, Warmgrau #ede8dc, Tinte #20201c, Tomate #b63823,
  Grün #38644a. Bestehende Schrift für Aktionen; Zahlen auf Bestellbons in
  Monospace. Drei Küchenstationen mit echten, weiterreichbaren Bestellbons.

```
Jost:       Projektliste | Projektakte       | Besichtigung / Angebotsentwurf
Clean Cut:  Tageswahl    | Max / Leon / Lena | Termin bearbeiten
MOS:        Eingegangen | In Zubereitung     | Abholbereit
```

Prüfung gegen den Auftrag: Alle drei Seiten erhalten denselben Perspektivwechsel
in der Vorschauleiste, aber unterschiedliche fachliche Arbeitsflächen. Keine
zusätzlichen Schmuckbilder notwendig. Der starke Moment entsteht durch die
sichtbare Übergabe und Bearbeitung desselben Vorgangs.

## Umsetzung und Abnahme

Lokal umgesetzt und geprüft am 7. September 2026:

- **Jost:** Projektanfrage mit Wandfläche, Untergrund und Farbidee; Projektakte,
  Besichtigungsplanung mit Konfliktprüfung und Leistungsentwurf. Der Kunde sieht
  denselben Termin und Entwurf.
- **Clean Cut:** Buchung mit Beispieldauer von 30, 45 oder 60 Minuten; dynamischer
  Teamkalender aus derselben Belegungsquelle; Verschieben und Absagen aktualisieren
  die freien Zeiten und die Kundensicht. Die alte unvollständige Buchungsmaske auf
  der Startseite führt jetzt zum vollständigen Terminplaner.
- **MOS Kebap:** Bestellbon mit Artikeln, Sonderwunsch und Abholzeit. Aktionen für
  Zubereitung, Abholbereitschaft, Abholung und Absage; kein zeitgesteuerter Status.
  Höchstens drei aktive Beispielbestellungen je Abholzeit.
- Perspektivwechsel, Vorgangsnummern, Statusverlauf, Beispieleingabe und Reset.
  Die Projektübersicht verlinkt die drei bedienbaren Branchenlösungen und nennt
  ihre Kernfunktion. Ein überbreiter Kopf bei 768 Pixeln wurde dort korrigiert.

Getrennte Daten je Demo in sessionStorage dieses Browser-Tabs. Kontaktfelder
für Namen und Telefonnummern werden nicht in die Vorgangsakte übernommen.
Projekttexte und Sonderwünsche bleiben als Teil des Vorgangs im Tab; ausgewählte
Fotos werden weder übertragen noch gespeichert. Links enthalten nur die
Vorgangsnummer. Kein Versand, keine Zahlungen, keine echten Buchungen.

## Prüfprotokoll

- Drei vollständige Kunden-/Betriebsabläufe bestanden, einschließlich Neuladen,
  Änderungen, Konflikten, Abschluss und Rückkehr zur Kundensicht.
- Drei zusätzliche Prüfgruppen bestanden: Beispieleingabe, Doppelabschluss,
  sichere Darstellung von Freitext, frühester Besichtigungstag, Dienstdauer am
  Tagesende, volle Abholzeiten, Absage und Reset. Nach 13 Sekunden ohne
  Küchenaktion blieb der Status unverändert.
- Drei Tastaturprüfungen bestanden: Perspektivwechsel mit Leistungsentwurf,
  Salontermin öffnen mit Fokus in der Bearbeitung, Küchenaktion mit anschließend
  korrekt zugeordnetem Perspektivwechsel.
- Elf Demo-Seiten und die Projektübersicht in fünf Breiten (320, 390, 768, 1024,
  1440 Pixel) geprüft. Nach der Korrektur des Übersichtskopfs kein horizontaler
  Seitenüberlauf. Der Salonkalender scrollt auf kleinen Displays innerhalb seiner
  beschrifteten Region; der ausgewählte Termin steht mobil davor.
- 49 HTML-Seiten auf lokale Verweise, Sprungziele und doppelte IDs sowie
  27 externe oder eingebettete JavaScript-Einheiten syntaktisch geprüft.
- Keine JavaScript-Laufzeitfehler und keine schreibenden Netzwerkanfragen in den
  ausgeführten Abläufen. Screenshots aller drei Betriebsansichten auf Desktop und
  Handy visuell kontrolliert.

Wiederholbare Abläufe: scripts/review-industry.js und
scripts/review-industry-edge.js (Playwright-Funktionen wie in DEMO-REVIEW.md).
Prüfergebnisse und Bildschirmaufnahmen liegen lokal unter output/branchen/.

Geprüfter Browser: Chromium. Safari, Firefox und physische Mobilgeräte sind noch
nicht separat geprüft. Die Betriebsansichten sind öffentliche Simulationen,
keine Anmeldung oder produktive Mehrbenutzeranwendung. Daten werden nicht
zwischen unabhängig geöffneten Tabs oder Geräten synchronisiert.

Noch nicht veröffentlicht. Die übrigen 13 Branchenlösungen wurden anschließend
ebenfalls umgesetzt: [Ausbaustufe 2 mit Prüfprotokoll](BRANCHEN-AUSBAU-2.md).
