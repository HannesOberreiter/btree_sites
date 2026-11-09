---
title: 'Open Source Beekeeping Software Compared'
description: 'Comparison of open source beekeeping apps: b.tree, BEEP, Hive Pal, Gratheon and Openbeehive. License, price, offline use, languages, hive scales and AI, checked in November 2026.'
layout: '../layouts/IndexLayout.astro'
faq: true
lang: 'en'
---

Many comparisons of beekeeping apps exist, but most of them list closed apps. This page compares only beekeeping software with open source code. With open source code, you can read how the app works, your data format is not a secret, and the software can continue when the original developer stops.

**Disclosure:** I, Hannes Oberreiter, make b.tree. I tried to be fair and to show where the other apps are better. All facts come from the websites and source code repositories of the projects. I checked them on 9 November 2026. If something is wrong or out of date, [edit this page on GitHub](https://github.com/HannesOberreiter/btree_sites/blob/main/packages/btree_info/src/pages/open-source-beekeeping-software.md) and I will correct it.

## Which apps are in the comparison

An app is in the comparison when:

- Its source code has an open source license.
- It had new development in the last 12 months.
- Beekeepers can use a hosted version without own servers.
- Its main purpose is beekeeping records.

Monitoring systems for hive scales and sensors are in a [separate section](#hive-scales-and-monitoring).

## Comparison table

|               | b.tree                                              | BEEP                                     | Hive Pal                                         | Gratheon                                      | Openbeehive                                                  |
| ------------- | --------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------ |
| Website       | [btree.at](https://www.btree.at)                    | [beep.nl](https://beep.nl/home-english)  | [hivepal.app](https://hivepal.app)               | [gratheon.com](https://gratheon.com)          | [openbeehive.org](https://openbeehive.org)                   |
| Source code   | [GitHub](https://github.com/HannesOberreiter/btree) | [GitHub](https://github.com/beepnl/BEEP) | [GitHub](https://github.com/martinhrvn/hive-pal) | [GitHub](https://github.com/Gratheon/web-app) | [GitHub](https://github.com/openbeehive-org/openbeehive-app) |
| License       | AGPL-3.0                                            | AGPL-3.0 (API), MIT (app)                | MIT                                              | AGPL-3.0                                      | AGPL-3.0                                                     |
| Since         | 2014                                                | 2017                                     | 2024                                             | 2022                                          | 2026                                                         |
| Made by       | One beekeeper, Austria                              | BEEP foundation, Netherlands             | Developer and community                          | Gratheon OÜ, Estonia                          | One beekeeper                                                |
| Price         | Free up to 5 hives, 55 € per year                   | Free                                     | Free                                             | Free up to 3 hives, 7 to 55 € per month       | Free                                                         |
| Works offline | No                                                  | No                                       | Yes                                              | Not stated                                    | Yes                                                          |
| Languages     | 4                                                   | 17                                       | 10                                               | 23                                            | 5                                                            |
| German        | Yes                                                 | Yes                                      | Yes                                              | Yes                                           | Yes                                                          |
| Hive scales   | API for own scales                                  | BEEP base, API                           | HiveHub devices                                  | Own sensors                                   | API                                                          |
| AI            | WizBee assistant, MCP                               | No                                       | Voice inspections, MCP                           | Frame photo analysis                          | No                                                           |
| Data export   | CSV, full backup                                    | API                                      | Import and export                                | Not stated                                    | API                                                          |

The prices and limits of the hosted versions are from November 2026.

## b.tree

b.tree is a web app for hive records, made in Austria since 2014. It is designed around tables, so you can compare many colonies, years and apiaries. It records inspections, feedings, treatments, harvests, queens with pedigree, wax lots for organic beekeeping, and tasks. Each apiary has a beekeeping weather forecast. The AI assistant [WizBee](https://www.wiz-bee.com/) records tasks from text or voice. With the [Agent API and MCP](/doc-agent/), you can connect your own AI agent.

- **Good for:** beekeepers with many colonies, organic beekeepers, and beekeepers in German-speaking countries.
- **Limits:** no offline mode. The free plan allows 5 hives and 2 apiaries.

## BEEP

BEEP is made by the non-profit BEEP foundation in the Netherlands. The app combines hive inspections with sensor data from the BEEP base, a scale that measures weight, temperature and sound and sends the data over LoRaWAN. You can design your own inspection checklists, which is useful for research projects.

- **Good for:** beekeepers who want a scale and inspections in one system, and research groups.
- **Limits:** no offline mode. The BEEP base is produced in yearly batches.

## Hive Pal

Hive Pal is a young, mobile-first app with a fast development pace. You can record voice notes at the hive, and AI makes a draft of the inspection from them. The AI uses open models that you can also run yourself. Hive Pal has batch inspections, queen records, QR codes, and an installable app that works offline.

- **Good for:** beekeepers who want voice input in the apiary and a free hosted service.
- **Limits:** the project is still at version 0.x. The hosted service gives community support through GitHub and best-effort uptime.

## Gratheon

Gratheon is a company in Estonia that works on automation of beekeeping. The app analyses frame photos: it counts bees, finds the queen, estimates cells and counts Varroa mites. Gratheon also develops hive sensors and an entrance camera.

- **Good for:** beekeepers who want to analyse frame photos with AI.
- **Limits:** the free plan allows 3 hives. The AI functions start with the Starter plan at 22 € per month.

## Openbeehive

Openbeehive started in 2026. Its data stays on the device first and synchronises when a connection is available, so it works in apiaries without mobile signal. It records queens with breeding values, treatments with batch numbers and withdrawal periods, and honey lots.

- **Good for:** beekeepers who need a fully offline app and a free service.
- **Limits:** the project describes itself as "early releases" with rough edges.

## Hive scales and monitoring

These projects measure weight, temperature and other data at the hive. They do not replace hive records, but you can use them together with an app.

- **[Hiveeyes](https://www.hiveeyes.org/):** an open source toolkit for beehive monitoring from a group of beekeepers in Berlin. It uses Arduino hardware, MQTT, InfluxDB and Grafana. You can use their shared platform or run it on a Raspberry Pi.
- **[BEEP base](https://beep.nl/home-english):** the scale of the BEEP foundation, connected to the BEEP app.
- **[HoneyPi](https://honey-pi.de/en/):** a do-it-yourself scale based on a Raspberry Pi. Its license (CC BY-NC-SA) does not allow commercial use, so it is not open source in the strict sense.

b.tree can receive data from hive scales through its [API](/doc-api/).

## Frequently asked questions

### Which open source beekeeping app is free?

BEEP, Hive Pal and Openbeehive are free without hive limits. b.tree is free for up to 5 hives and 2 apiaries, and Premium costs 55 € per year. Gratheon is free for up to 3 hives.

### Which open source beekeeping app works offline?

Hive Pal and Openbeehive work without an internet connection and synchronise later. b.tree and BEEP need an internet connection.

### Which open source beekeeping app is available in German?

All five apps in the comparison have a German user interface. b.tree is made in Austria, and German is its first language.

### Can I connect a hive scale?

Yes, with all apps in the comparison. BEEP and Gratheon have their own hardware. b.tree, BEEP and Openbeehive accept data from other scales through an API. Hive Pal supports HiveHub devices.

### Why is open source important for beekeeping records?

Hive records cover many years, and records of Varroa treatments must often be kept for years. With open source code, the data format is public and other developers can continue the software. You do not depend on one company alone.
