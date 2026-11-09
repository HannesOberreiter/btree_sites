---
title: 'Open-Source-Imkersoftware im Vergleich'
description: 'Vergleich von Open-Source-Imker-Apps: b.tree, BEEP, Hive Pal, Gratheon und Openbeehive. Preis, Offline-Nutzung, App Stores, Login, integrierte KI, APIs und Stockwaagen, geprüft im November 2026.'
layout: '../../layouts/IndexLayout.astro'
faq: true
lang: 'de'
---

Es gibt viele Vergleiche von Imker-Apps, aber die meisten zeigen Apps mit geschlossenem Quellcode. Diese Seite vergleicht nur Imkersoftware mit offenem Quellcode. Bei Open Source kannst du nachlesen, wie die App arbeitet, das Datenformat ist kein Geheimnis, und die Software kann weiterleben, wenn der ursprüngliche Entwickler aufhört.

**Offenlegung:** Ich, Hannes Oberreiter, entwickle b.tree. Ich habe versucht, fair zu bleiben und zu zeigen, wo die anderen Apps besser sind. Alle Angaben stammen von den Webseiten, Dokumentationen und Quellcode-Repositories der Projekte. Ich habe sie am 9. November 2026 geprüft. Wenn etwas falsch oder veraltet ist, [bearbeite diese Seite auf GitHub](https://github.com/HannesOberreiter/btree_sites/blob/main/packages/btree_info/src/pages/de/open-source-beekeeping-software.md), und ich korrigiere es.

## Welche Apps im Vergleich sind

Eine App ist im Vergleich, wenn:

- ihr Quellcode eine Open-Source-Lizenz hat.
- sie in den letzten 12 Monaten weiterentwickelt wurde.
- Imkerinnen und Imker eine gehostete Version ohne eigenen Server nutzen können.
- ihr Hauptzweck die Aufzeichnungen der Imkerei sind (Stockkarte, Bestandsbuch).

Messsysteme für Stockwaagen und Sensoren stehen in einem [eigenen Abschnitt](#stockwaagen-und-monitoring).

## Überblick

<div class="compare">

|                      | b.tree                                                          | BEEP                                | Hive Pal                  | Gratheon                                  | Openbeehive                           |
| -------------------- | --------------------------------------------------------------- | ----------------------------------- | ------------------------- | ----------------------------------------- | ------------------------------------- |
| Gemacht für          | Mittlere und große Imkereien, Bio-Imkereien                     | Imkereien mit Stockwaage, Forschung | Erfassung per Sprache     | KI-Analyse von Wabenfotos                 | Bienenstände ohne Handyempfang        |
| Preis                | Gratis bis 5 Völker, 55 € pro Jahr                              | Gratis                              | Gratis                    | Gratis bis 3 Völker, 7 bis 55 € pro Monat | Gratis, nur mit Einladung             |
| Offline nutzbar      | Nein                                                            | Nein                                | Ja                        | Keine Angabe                              | Ja                                    |
| Als App installieren | PWA, Google Play, App Store                                     | PWA                                 | PWA                       | PWA                                       | PWA                                   |
| Social Login         | Google, Apple                                                   | Nein                                | Google, Facebook          | Google                                    | Nein                                  |
| Mehrere Benutzer     | Ja, mit Rängen                                                  | Völker in Gruppen teilen            | Bienenstände teilen       | Professional-Tarif, bis 5 Benutzer        | Gemeinsame Arbeitsbereiche            |
| Integrierte KI       | WizBee: Erfassung per Text oder Sprache, Fragen zu deinen Daten | Nein                                | Kontrollen per Sprache    | Analyse von Wabenfotos, Assistent         | Nein                                  |
| API für KI-Agenten   | Agent API (OpenAPI) und MCP                                     | Nein                                | MCP                       | Nein                                      | Nein                                  |
| Kalender             | iCal-Feed                                                       | Einzelne Termine                    | iCal-Feed                 | Keine Angabe                              | Keine Angabe                          |
| Stockwaagen          | API für eigene Waagen                                           | BEEP base, API                      | HiveHub-Geräte            | Eigene Sensoren                           | API                                   |
| Datenexport          | CSV, komplettes Backup                                          | Excel, CSV, API                     | Import und Export         | Keine Angabe                              | JSON, Excel, CSV, BeeXML              |
| Sprachen             | 4                                                               | 15                                  | 10                        | 23                                        | 5                                     |
| Lizenz               | AGPL-3.0                                                        | AGPL-3.0 (API), MIT (App)           | MIT                       | AGPL-3.0 oder kommerziell                 | AGPL-3.0                              |
| Seit                 | 2014                                                            | 2017                                | 2024                      | 2022                                      | 2026                                  |
| Technik              | Vue, Quasar, Node.js, MariaDB                                   | Vue, Laravel (PHP), MySQL, InfluxDB | React, NestJS, PostgreSQL | React, Go, Node.js, MySQL                 | SvelteKit, Go, PostgreSQL oder SQLite |

</div>

Die Preise und Grenzen der gehosteten Versionen sind vom November 2026.

## b.tree

[Webseite](https://www.btree.at/de/) · [Quellcode](https://github.com/HannesOberreiter/btree)

b.tree ist eine Web-App für die Stockkarte und die Imkereiverwaltung, verfügbar seit 2014. Sie ist um Tabellen aufgebaut, damit du viele Völker, Jahre und Bienenstände vergleichen kannst. Mit einem Eintrag im Quicktool erfasst du eine Aufgabe für alle Völker eines Bienenstands. b.tree zeichnet den Wachskreislauf in Chargen auf, was bei den Aufzeichnungen für die Bio-Imkerei hilft. Mehrere Benutzer arbeiten mit den Rängen Admin, User und Read-Only in einer Imkerei. Der KI-Assistent [WizBee](https://www.wiz-bee.com/) erfasst Fütterungen, Behandlungen, Ernten, Kontrollen und Aufgaben aus Text oder Sprache und beantwortet Fragen zu deinen eigenen Daten. Mit der [Agent API (OpenAPI) und MCP](/de/doc-agent/) verbindest du deinen eigenen KI-Agenten, zum Beispiel Claude oder ChatGPT. Ein [iCal-Feed](/de/doc-api/) zeigt deine Aufgaben in deinem Kalender. b.tree gibt es als Web-App sowie in Google Play und im App Store, und du kannst dich mit Google oder Apple anmelden.

- **Grenzen:** kein Offline-Modus. Der Gratis-Tarif erlaubt 5 Völker und 2 Bienenstände. WizBee, die APIs, iCal, Statistiken und die Wettervorhersage brauchen Premium.

## BEEP

[Webseite](https://beep.nl) · [Quellcode](https://github.com/beepnl/BEEP)

BEEP kommt von der gemeinnützigen BEEP-Stiftung in den Niederlanden. Die App verbindet Stockkontrollen mit Sensordaten der BEEP base. Das ist eine Stockwaage, die Gewicht, Temperatur und Geräusche misst und die Daten über LoRaWAN sendet. Du gestaltest eigene Checklisten für Kontrollen aus Standardkategorien, was für Forschungsprojekte nützlich ist.

- **Grenzen:** kein Offline-Modus. Die BEEP base wird in jährlichen Serien produziert.

## Hive Pal

[Webseite](https://hivepal.app) · [Quellcode](https://github.com/martinhrvn/hive-pal)

Hive Pal ist eine junge App für das Handy, die schnell weiterentwickelt wird. Du sprichst am Stand Notizen ein, und die KI macht daraus einen Entwurf der Kontrolle. Die KI verwendet offene Modelle, die du auch selbst betreiben kannst. Hive Pal hat Sammelkontrollen, Königinnenverwaltung, einen Kalender mit iCal-Feed, QR-Codes, MCP für KI-Assistenten und eine installierbare App, die offline funktioniert.

- **Grenzen:** das Projekt ist noch bei Version 0.x. Der gehostete Dienst bietet Support über GitHub und keine garantierte Verfügbarkeit.

## Gratheon

[Webseite](https://gratheon.com) · [Quellcode](https://github.com/Gratheon/web-app)

Gratheon ist eine Firma in Estland, die an der Automatisierung der Imkerei arbeitet. Die App analysiert Wabenfotos: Sie zählt Bienen, findet die Königin, schätzt die Zellen und zählt Varroamilben. Gratheon entwickelt auch Sensoren für den Bienenstock und eine Kamera für das Flugloch. Der Quellcode steht unter der AGPL-3.0 oder einer kommerziellen Lizenz.

- **Grenzen:** der Gratis-Tarif erlaubt 3 Völker. Die KI-Funktionen beginnen beim Starter-Tarif mit 22 € pro Monat. Mehr als ein Benutzer braucht den Professional-Tarif.

## Openbeehive

[Webseite](https://openbeehive.org) · [Quellcode](https://github.com/openbeehive-org/openbeehive-app)

Openbeehive gibt es seit 2026. Die Daten bleiben zuerst auf dem Gerät und werden synchronisiert, sobald eine Verbindung da ist. So funktioniert die App auch an Bienenständen ohne Handyempfang. Sie zeichnet Königinnen mit Zuchtwerten, Behandlungen mit Chargennummer und Wartezeit sowie Honiglose auf.

- **Grenzen:** das Projekt bezeichnet sich selbst als frühe Version mit Ecken und Kanten. Am 9. November 2026 nahm der gehostete Dienst neue Benutzer nur mit Einladung an.

## Stockwaagen und Monitoring

Diese Projekte messen Gewicht, Temperatur und andere Werte am Bienenstock. Sie ersetzen keine Stockkarte, aber du kannst sie zusammen mit einer App verwenden.

- **[Hiveeyes](https://www.hiveeyes.org/):** ein Open-Source-Baukasten für das Monitoring von Bienenstöcken von einer Gruppe Imker aus Berlin. Er verwendet Arduino-Hardware, MQTT, InfluxDB und Grafana. Du kannst ihre gemeinsame Plattform nutzen oder alles auf einem Raspberry Pi betreiben.
- **[BEEP base](https://beep.nl):** die Stockwaage der BEEP-Stiftung, verbunden mit der BEEP-App.
- **[HoneyPi](https://honey-pi.de/):** eine Stockwaage zum Selbstbauen auf Basis eines Raspberry Pi. Ihre Lizenz (CC BY-NC-SA) verbietet die kommerzielle Nutzung, daher ist sie im strengen Sinn nicht Open Source.

b.tree kann Daten von Stockwaagen über seine [API](/de/doc-api/) empfangen.

## Häufige Fragen

### Welche Open-Source-Imker-App ist gratis?

BEEP, Hive Pal und Openbeehive sind gratis und ohne Grenze bei der Zahl der Völker. Openbeehive nahm bei meiner Prüfung neue Benutzer nur mit Einladung an. b.tree ist gratis bis 5 Völker und 2 Bienenstände, Premium kostet 55 € pro Jahr. Gratheon ist gratis bis 3 Völker.

### Welche Open-Source-Imker-App funktioniert offline?

Hive Pal und Openbeehive funktionieren ohne Internetverbindung und synchronisieren später. b.tree und BEEP brauchen eine Internetverbindung.

### Können mehrere Imkerinnen und Imker dieselben Aufzeichnungen nutzen?

Ja, in allen fünf Apps. b.tree hat die Ränge Admin, User und Read-Only, und Premium zahlst du einmal pro Imkerei, nicht pro Benutzer. BEEP teilt Völker in Gruppen, Hive Pal teilt Bienenstände, und Openbeehive hat gemeinsame Arbeitsbereiche. Gratheon erlaubt mehr als einen Benutzer im Professional-Tarif.

### Welche Open-Source-Imker-App hat integrierte KI?

b.tree hat WizBee, das Aufgaben aus Text oder Sprache erfasst und Fragen zu deinen Daten beantwortet. Hive Pal macht aus Sprachnotizen Entwürfe für Kontrollen. Gratheon analysiert Wabenfotos. b.tree und Hive Pal verbinden sich auch über MCP mit deinem eigenen KI-Agenten, und b.tree hat eine Agent API mit OpenAPI-Beschreibung.

### Gibt es eine App in Google Play oder im App Store?

b.tree gibt es in Google Play und im App Store. Alle fünf Apps laufen im Browser und lassen sich als PWA auf dem Startbildschirm installieren.

### Kann ich eine Stockwaage verbinden?

Ja, bei allen Apps im Vergleich. BEEP und Gratheon haben eigene Hardware. b.tree, BEEP und Openbeehive nehmen über eine API Daten von anderen Waagen an. Hive Pal unterstützt HiveHub-Geräte.

### Warum ist Open Source für die Stockkarte wichtig?

Stockkarten umfassen viele Jahre, und Aufzeichnungen über Varroa-Behandlungen musst du oft mehrere Jahre aufbewahren. Bei Open Source ist das Datenformat öffentlich, und andere Entwickler können die Software weiterführen. Du bist nicht von einer einzigen Firma abhängig.
