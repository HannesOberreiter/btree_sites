---
title: 'Open-Source-Imkersoftware im Vergleich'
description: 'Vergleich von Open-Source-Imker-Apps: b.tree, BEEP, Hive Pal, Gratheon und Openbeehive. Lizenz, Preis, Offline-Nutzung, Sprachen, Stockwaagen und KI, geprüft im November 2026.'
layout: '../../layouts/IndexLayout.astro'
faq: true
lang: 'de'
---

Es gibt viele Vergleiche von Imker-Apps, aber die meisten zeigen Apps mit geschlossenem Quellcode. Diese Seite vergleicht nur Imkersoftware mit offenem Quellcode. Bei Open Source kannst du nachlesen, wie die App arbeitet, das Datenformat ist kein Geheimnis, und die Software kann weiterleben, wenn der ursprüngliche Entwickler aufhört.

**Offenlegung:** Ich, Hannes Oberreiter, entwickle b.tree. Ich habe versucht, fair zu bleiben und zu zeigen, wo die anderen Apps besser sind. Alle Angaben stammen von den Webseiten und Quellcode-Repositories der Projekte. Ich habe sie am 9. November 2026 geprüft. Wenn etwas falsch oder veraltet ist, [bearbeite diese Seite auf GitHub](https://github.com/HannesOberreiter/btree_sites/blob/main/packages/btree_info/src/pages/de/open-source-beekeeping-software.md), und ich korrigiere es.

## Welche Apps im Vergleich sind

Eine App ist im Vergleich, wenn:

- ihr Quellcode eine Open-Source-Lizenz hat.
- sie in den letzten 12 Monaten weiterentwickelt wurde.
- Imkerinnen und Imker eine gehostete Version ohne eigenen Server nutzen können.
- ihr Hauptzweck die Aufzeichnungen der Imkerei sind (Stockkarte, Bestandsbuch).

Messsysteme für Stockwaagen und Sensoren stehen in einem [eigenen Abschnitt](#stockwaagen-und-monitoring).

## Vergleichstabelle

|                 | b.tree                                              | BEEP                                     | Hive Pal                                         | Gratheon                                      | Openbeehive                                                  |
| --------------- | --------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------ |
| Webseite        | [btree.at](https://www.btree.at/de/)                | [beep.nl](https://beep.nl)               | [hivepal.app](https://hivepal.app)               | [gratheon.com](https://gratheon.com)          | [openbeehive.org](https://openbeehive.org)                   |
| Quellcode       | [GitHub](https://github.com/HannesOberreiter/btree) | [GitHub](https://github.com/beepnl/BEEP) | [GitHub](https://github.com/martinhrvn/hive-pal) | [GitHub](https://github.com/Gratheon/web-app) | [GitHub](https://github.com/openbeehive-org/openbeehive-app) |
| Lizenz          | AGPL-3.0                                            | AGPL-3.0 (API), MIT (App)                | MIT                                              | AGPL-3.0                                      | AGPL-3.0                                                     |
| Seit            | 2014                                                | 2017                                     | 2024                                             | 2022                                          | 2026                                                         |
| Entwickelt von  | Ein Imker, Österreich                               | BEEP-Stiftung, Niederlande               | Entwickler und Community                         | Gratheon OÜ, Estland                          | Ein Imker                                                    |
| Preis           | Gratis bis 5 Völker, 55 € pro Jahr                  | Gratis                                   | Gratis                                           | Gratis bis 3 Völker, 7 bis 55 € pro Monat     | Gratis                                                       |
| Offline nutzbar | Nein                                                | Nein                                     | Ja                                               | Keine Angabe                                  | Ja                                                           |
| Sprachen        | 4                                                   | 17                                       | 10                                               | 23                                            | 5                                                            |
| Deutsch         | Ja                                                  | Ja                                       | Ja                                               | Ja                                            | Ja                                                           |
| Stockwaagen     | API für eigene Waagen                               | BEEP base, API                           | HiveHub-Geräte                                   | Eigene Sensoren                               | API                                                          |
| KI              | WizBee-Assistent, MCP                               | Nein                                     | Spracheingabe bei Kontrollen, MCP                | Analyse von Wabenfotos                        | Nein                                                         |
| Datenexport     | CSV, komplettes Backup                              | API                                      | Import und Export                                | Keine Angabe                                  | API                                                          |

Die Preise und Grenzen der gehosteten Versionen sind vom November 2026.

## b.tree

b.tree ist eine Web-App für die Stockkarte und die Imkereiverwaltung, entwickelt in Österreich seit 2014. Sie ist um Tabellen aufgebaut, damit du viele Völker, Jahre und Bienenstände vergleichen kannst. Sie zeichnet Kontrollen, Fütterungen, Behandlungen, Ernten, Königinnen mit Stammbaum, Wachschargen für die Bio-Imkerei und Aufgaben auf. Jeder Bienenstand hat eine Imkerwetter-Vorhersage. Der KI-Assistent [WizBee](https://www.wiz-bee.com/) erfasst Aufgaben aus Text oder Sprache. Mit der [Agent API und MCP](/de/doc-agent/) verbindest du deinen eigenen KI-Agenten.

- **Gut für:** Imkereien mit vielen Völkern, Bio-Imkereien und Imkerinnen und Imker im deutschsprachigen Raum.
- **Grenzen:** kein Offline-Modus. Der Gratis-Tarif erlaubt 5 Völker und 2 Bienenstände.

## BEEP

BEEP kommt von der gemeinnützigen BEEP-Stiftung in den Niederlanden. Die App verbindet Stockkontrollen mit Sensordaten der BEEP base. Das ist eine Stockwaage, die Gewicht, Temperatur und Geräusche misst und die Daten über LoRaWAN sendet. Du kannst eigene Checklisten für Kontrollen gestalten, was für Forschungsprojekte nützlich ist.

- **Gut für:** Imkerinnen und Imker, die Waage und Kontrollen in einem System wollen, und Forschungsgruppen.
- **Grenzen:** kein Offline-Modus. Die BEEP base wird in jährlichen Serien produziert.

## Hive Pal

Hive Pal ist eine junge App für das Handy, die schnell weiterentwickelt wird. Du sprichst am Stand Notizen ein, und die KI macht daraus einen Entwurf der Kontrolle. Die KI verwendet offene Modelle, die du auch selbst betreiben kannst. Hive Pal hat Sammelkontrollen, Königinnenverwaltung, QR-Codes und eine installierbare App, die offline funktioniert.

- **Gut für:** Imkerinnen und Imker, die am Stand per Sprache erfassen wollen und einen gratis Dienst suchen.
- **Grenzen:** das Projekt ist noch bei Version 0.x. Der gehostete Dienst bietet Support über GitHub und keine garantierte Verfügbarkeit.

## Gratheon

Gratheon ist eine Firma in Estland, die an der Automatisierung der Imkerei arbeitet. Die App analysiert Wabenfotos: Sie zählt Bienen, findet die Königin, schätzt die Zellen und zählt Varroamilben. Gratheon entwickelt auch Sensoren für den Bienenstock und eine Kamera für das Flugloch.

- **Gut für:** Imkerinnen und Imker, die Wabenfotos mit KI auswerten wollen.
- **Grenzen:** der Gratis-Tarif erlaubt 3 Völker. Die KI-Funktionen beginnen beim Starter-Tarif mit 22 € pro Monat.

## Openbeehive

Openbeehive gibt es seit 2026. Die Daten bleiben zuerst auf dem Gerät und werden synchronisiert, sobald eine Verbindung da ist. So funktioniert die App auch an Bienenständen ohne Handyempfang. Sie zeichnet Königinnen mit Zuchtwerten, Behandlungen mit Chargennummer und Wartezeit sowie Honiglose auf.

- **Gut für:** Imkerinnen und Imker, die eine App komplett offline nutzen wollen und einen gratis Dienst suchen.
- **Grenzen:** das Projekt bezeichnet sich selbst als frühe Version mit Ecken und Kanten.

## Stockwaagen und Monitoring

Diese Projekte messen Gewicht, Temperatur und andere Werte am Bienenstock. Sie ersetzen keine Stockkarte, aber du kannst sie zusammen mit einer App verwenden.

- **[Hiveeyes](https://www.hiveeyes.org/):** ein Open-Source-Baukasten für das Monitoring von Bienenstöcken von einer Gruppe Imker aus Berlin. Er verwendet Arduino-Hardware, MQTT, InfluxDB und Grafana. Du kannst ihre gemeinsame Plattform nutzen oder alles auf einem Raspberry Pi betreiben.
- **[BEEP base](https://beep.nl):** die Stockwaage der BEEP-Stiftung, verbunden mit der BEEP-App.
- **[HoneyPi](https://honey-pi.de/):** eine Stockwaage zum Selbstbauen auf Basis eines Raspberry Pi. Ihre Lizenz (CC BY-NC-SA) verbietet die kommerzielle Nutzung, daher ist sie im strengen Sinn nicht Open Source.

b.tree kann Daten von Stockwaagen über seine [API](/de/doc-api/) empfangen.

## Häufige Fragen

### Welche Open-Source-Imker-App ist gratis?

BEEP, Hive Pal und Openbeehive sind gratis und ohne Grenze bei der Zahl der Völker. b.tree ist gratis bis 5 Völker und 2 Bienenstände, Premium kostet 55 € pro Jahr. Gratheon ist gratis bis 3 Völker.

### Welche Open-Source-Imker-App funktioniert offline?

Hive Pal und Openbeehive funktionieren ohne Internetverbindung und synchronisieren später. b.tree und BEEP brauchen eine Internetverbindung.

### Welche Open-Source-Imker-App gibt es auf Deutsch?

Alle fünf Apps im Vergleich haben eine deutsche Oberfläche. b.tree wird in Österreich entwickelt, und Deutsch ist seine erste Sprache.

### Kann ich eine Stockwaage verbinden?

Ja, bei allen Apps im Vergleich. BEEP und Gratheon haben eigene Hardware. b.tree, BEEP und Openbeehive nehmen über eine API Daten von anderen Waagen an. Hive Pal unterstützt HiveHub-Geräte.

### Warum ist Open Source für die Stockkarte wichtig?

Stockkarten umfassen viele Jahre, und Aufzeichnungen über Varroa-Behandlungen musst du oft mehrere Jahre aufbewahren. Bei Open Source ist das Datenformat öffentlich, und andere Entwickler können die Software weiterführen. Du bist nicht von einer einzigen Firma abhängig.
