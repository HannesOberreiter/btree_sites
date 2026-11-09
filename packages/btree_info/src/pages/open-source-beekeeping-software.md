---
title: 'Open Source Beekeeping Software Compared'
description: 'Comparison of open source beekeeping apps: b.tree, BEEP, Hive Pal, Gratheon and Openbeehive. Price, offline use, app stores, login, integrated AI, APIs and hive scales, checked in November 2026.'
layout: '../layouts/IndexLayout.astro'
faq: true
lang: 'en'
---

Many comparisons of beekeeping apps exist, but most of them list closed apps. This page compares only beekeeping software with open source code. With open source code, you can read how the app works, your data format is not a secret, and the software can continue when the original developer stops.

**Disclosure:** I, Hannes Oberreiter, make b.tree. I tried to be fair and to show where the other apps are better. All facts come from the websites, documentation and source code repositories of the projects. I checked them on 9 November 2026. If something is wrong or out of date, [edit this page on GitHub](https://github.com/HannesOberreiter/btree_sites/blob/main/packages/btree_info/src/pages/open-source-beekeeping-software.md) and I will correct it.

## Which apps are in the comparison

An app is in the comparison when:

- Its source code has an open source license.
- It had new development in the last 12 months.
- Beekeepers can use a hosted version without own servers.
- Its main purpose is beekeeping records.

Monitoring systems for hive scales and sensors are in a [separate section](#hive-scales-and-monitoring).

## Overview

<div class="compare">

|                   | b.tree                                                    | BEEP                                  | Hive Pal                        | Gratheon                                | Openbeehive                         |
| ----------------- | --------------------------------------------------------- | ------------------------------------- | ------------------------------- | --------------------------------------- | ----------------------------------- |
| Made for          | Medium and large operations, organic beekeepers           | Beekeepers with hive scales, research | Beekeepers who want voice input | AI analysis of frame photos             | Apiaries without mobile signal      |
| Price             | Free up to 5 hives, 55 € per year                         | Free                                  | Free                            | Free up to 3 hives, 7 to 55 € per month | Free, invite only                   |
| Works offline     | No                                                        | No                                    | Yes                             | Not stated                              | Yes                                 |
| Install as app    | PWA, Google Play, App Store                               | PWA                                   | PWA                             | PWA                                     | PWA                                 |
| Social login      | Google, Apple                                             | No                                    | Google, Facebook                | Google                                  | No                                  |
| Multiple users    | Yes, with roles                                           | Share hives in groups                 | Share apiaries                  | Professional plan, up to 5 users        | Shared workspaces                   |
| Integrated AI     | WizBee: entry by text or voice, questions about your data | No                                    | Voice inspections               | Frame photo analysis, assistant         | No                                  |
| API for AI agents | Agent API (OpenAPI) and MCP                               | No                                    | MCP                             | No                                      | No                                  |
| Calendar          | iCal feed                                                 | Add single events                     | iCal feed                       | Not stated                              | Not stated                          |
| Hive scales       | API for own scales                                        | BEEP base, API                        | HiveHub devices                 | Own sensors                             | API                                 |
| Data export       | CSV, full backup                                          | Excel, CSV, API                       | Import and export               | Not stated                              | JSON, Excel, CSV, BeeXML            |
| Languages         | 4                                                         | 15                                    | 10                              | 23                                      | 5                                   |
| License           | AGPL-3.0                                                  | AGPL-3.0 (API), MIT (app)             | MIT                             | AGPL-3.0 or commercial                  | AGPL-3.0                            |
| Since             | 2014                                                      | 2017                                  | 2024                            | 2022                                    | 2026                                |
| Tech stack        | Vue, Quasar, Node.js, MariaDB                             | Vue, Laravel (PHP), MySQL, InfluxDB   | React, NestJS, PostgreSQL       | React, Go, Node.js, MySQL               | SvelteKit, Go, PostgreSQL or SQLite |

</div>

The prices and limits of the hosted versions are from November 2026.

## b.tree

[Website](https://www.btree.at) · [Source code](https://github.com/HannesOberreiter/btree)

b.tree is a web app for hive records, available since 2014. It is designed around tables, so you can compare many colonies, years and apiaries. One entry with the Quicktool records a task for all hives of an apiary. b.tree records the wax cycle in lots, which helps with the records for organic beekeeping. Several users can work in one operation with the roles Admin, User and Read-Only. The AI assistant [WizBee](https://www.wiz-bee.com/) records feedings, treatments, harvests, inspections and tasks from text or voice, and answers questions about your own data. With the [Agent API (OpenAPI) and MCP](/doc-agent/), you connect your own AI agent, for example Claude or ChatGPT. An [iCal feed](/doc-api/) shows your tasks in your calendar. b.tree is available as a web app and in Google Play and the App Store, and you can sign in with Google or Apple.

- **Limits:** no offline mode. The free plan allows 5 hives and 2 apiaries. WizBee, the APIs, iCal, statistics and the weather forecast need Premium.

## BEEP

[Website](https://beep.nl/home-english) · [Source code](https://github.com/beepnl/BEEP)

BEEP is made by the non-profit BEEP foundation in the Netherlands. The app combines hive inspections with sensor data from the BEEP base, a scale that measures weight, temperature and sound and sends the data over LoRaWAN. You design your own inspection checklists from standard categories, which is useful for research projects.

- **Limits:** no offline mode. The BEEP base is produced in yearly batches.

## Hive Pal

[Website](https://hivepal.app) · [Source code](https://github.com/martinhrvn/hive-pal)

Hive Pal is a young, mobile-first app with a fast development pace. You record voice notes at the hive, and AI makes a draft of the inspection from them. The AI uses open models that you can also run yourself. Hive Pal has batch inspections, queen records, a calendar with iCal feed, QR codes, MCP for AI assistants, and an installable app that works offline.

- **Limits:** the project is still at version 0.x. The hosted service gives community support through GitHub and best-effort uptime.

## Gratheon

[Website](https://gratheon.com) · [Source code](https://github.com/Gratheon/web-app)

Gratheon is a company in Estonia that works on automation of beekeeping. The app analyses frame photos: it counts bees, finds the queen, estimates cells and counts Varroa mites. Gratheon also develops hive sensors and an entrance camera. The code is available under the AGPL-3.0 or a commercial license.

- **Limits:** the free plan allows 3 hives. The AI functions start with the Starter plan at 22 € per month. More than one user needs the Professional plan.

## Openbeehive

[Website](https://openbeehive.org) · [Source code](https://github.com/openbeehive-org/openbeehive-app)

Openbeehive started in 2026. Its data stays on the device first and synchronises when a connection is available, so it works in apiaries without mobile signal. It records queens with breeding values, treatments with batch numbers and withdrawal periods, and honey lots.

- **Limits:** the project describes itself as "early releases" with rough edges. On 9 November 2026, the hosted service accepted new users only with an invite.

## Hive scales and monitoring

These projects measure weight, temperature and other data at the hive. They do not replace hive records, but you can use them together with an app.

- **[Hiveeyes](https://www.hiveeyes.org/):** an open source toolkit for beehive monitoring from a group of beekeepers in Berlin. It uses Arduino hardware, MQTT, InfluxDB and Grafana. You can use their shared platform or run it on a Raspberry Pi.
- **[BEEP base](https://beep.nl/home-english):** the scale of the BEEP foundation, connected to the BEEP app.
- **[HoneyPi](https://honey-pi.de/en/):** a do-it-yourself scale based on a Raspberry Pi. Its license (CC BY-NC-SA) does not allow commercial use, so it is not open source in the strict sense.

b.tree can receive data from hive scales through its [API](/doc-api/).

## Frequently asked questions

### Which open source beekeeping app is free?

BEEP, Hive Pal and Openbeehive are free without hive limits. Openbeehive accepted new users only with an invite when I checked. b.tree is free for up to 5 hives and 2 apiaries, and Premium costs 55 € per year. Gratheon is free for up to 3 hives.

### Which open source beekeeping app works offline?

Hive Pal and Openbeehive work without an internet connection and synchronise later. b.tree and BEEP need an internet connection.

### Can several beekeepers use the same records?

Yes, in all five apps. b.tree has the roles Admin, User and Read-Only, and Premium is paid once per operation, not per user. BEEP shares hives in groups, Hive Pal shares apiaries, and Openbeehive has shared workspaces. Gratheon allows more than one user in the Professional plan.

### Which open source beekeeping app has integrated AI?

b.tree has WizBee, which records tasks from text or voice and answers questions about your data. Hive Pal makes drafts of inspections from voice notes. Gratheon analyses frame photos. b.tree and Hive Pal also connect to your own AI agent through MCP, and b.tree has an Agent API with an OpenAPI description.

### Is there an app in Google Play or the App Store?

b.tree is in Google Play and the App Store. All five apps run in the browser and can be installed on the home screen as a PWA.

### Can I connect a hive scale?

Yes, with all apps in the comparison. BEEP and Gratheon have their own hardware. b.tree, BEEP and Openbeehive accept data from other scales through an API. Hive Pal supports HiveHub devices.

### Why is open source important for beekeeping records?

Hive records cover many years, and records of Varroa treatments must often be kept for years. With open source code, the data format is public and other developers can continue the software. You do not depend on one company alone.
