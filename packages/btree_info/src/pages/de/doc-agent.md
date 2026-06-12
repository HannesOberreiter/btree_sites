---
title: KI-gestützte Imkerei-Automatisierung
description: "Verbinden Sie Ihren KI-Agenten (Claude, ChatGPT, LLM-Bots) mit der b.tree Imkereisoftware über eine sichere API. Automatisieren Sie Stockverwaltung, Kontrollen und Datenanalyse."
layout: "../../layouts/IndexLayout.astro"
lang: "de"
---

## b.tree Agent API — KI für Ihre Imkerei

Die b.tree **Agent API** ist ein dedizierter Endpunkt, der externen **KI-Agenten** und **LLM-Assistenten** (Claude, ChatGPT, eigene Bots, ClawBot, MCP-kompatible Agenten) den programmatischen Zugriff auf Ihre Imkereidaten ermöglicht. Stellen Sie es sich so vor, als würden Sie Ihrem KI-Assistenten ein eigenes Set an Imkerei-Werkzeugen geben.

Ob **Claude Desktop**, **ChatGPT mit Custom Actions**, ein **Zapier KI-Workflow** oder ein selbst gebauter Agent — die b.tree Agent API bietet vollen Lese- und Schreibzugriff auf Ihren Imkereibetrieb über einen sicheren, rate-limitierten, OpenAPI-dokumentierten Endpunkt.

---

### Warum die Agent API nutzen?

- **Imkerei in natürlicher Sprache** — Bitten Sie Ihre KI „erstelle einen Fütterungseintrag für alle Völker am Waldstand" und es funktioniert einfach
- **Automatisierung** — Erstellen Sie Workflows, die automatisch Kontrollen protokollieren, Behandlungen planen oder Erntedaten analysieren
- **Zugriff auf 25+ Werkzeuge** — Ihr KI-Agent kann erstellen, lesen, aktualisieren und löschen: Fütterungen, Behandlungen, Ernten, Kontrollen, Todos, Kosten, Statistiken, Wetter und mehr
- **OpenAPI Discovery** — Ihr Agent kann alle verfügbaren Endpunkte und deren Schemas automatisch erkennen
- **Sicher** — API-Schlüssel werden mit SHA-256 gehasht, pro Benutzer, mit optionalem Ablaufdatum

---

### Erste Schritte

#### 1. Agent Key generieren

Navigieren Sie zu **Einstellungen → Profil → [Agent Keys](https://app.btree.at/setting/profile/agent-keys)** in Ihrem b.tree Konto.

Klicken Sie auf **"Agent Key erstellen"** und setzen Sie optional:

- Eine **Bezeichnung** (z.B. "Claude Desktop", "Meine Automatisierung")
- Ein **Ablaufdatum** (leer lassen für permanenten Zugang)

⚠️ **Wichtig**: Der API-Schlüssel wird nur einmal nach der Erstellung angezeigt. Kopieren Sie ihn sofort und speichern Sie ihn sicher. Er kann später nicht mehr abgerufen werden.

Ihr Schlüssel sieht so aus: `btree_ak_a1B2c3D4e5F6g7H8i9J0...`

#### 2. Authentifizierung

Fügen Sie Ihren Schlüssel in den `Authorization`-Header jeder Anfrage ein:

```bash
Authorization: Bearer btree_ak_ihr_schluessel
```

#### 3. Verfügbare Tools entdecken

Rufen Sie die vollständige OpenAPI-Spezifikation ab, um alle verfügbaren Endpunkte und deren Parameter zu sehen:

```bash
GET https://api.btree.at/api/v1/agent/openapi.json
Authorization: Bearer btree_ak_ihr_schluessel
```

Dies gibt eine **OpenAPI 3.1** Spezifikation zurück, die jeder kompatible Agent oder jedes Tool automatisch parsen kann.

#### 4. Tools aufrufen

Jedes Tool ist als POST-Endpunkt verfügbar:

```bash
POST https://api.btree.at/api/v1/agent/tools/{toolName}
Authorization: Bearer btree_ak_ihr_schluessel
Content-Type: application/json

{ ... Parameter als JSON ... }
```

Beispiel — Stände und Völker auflisten:

```json
POST /api/v1/agent/tools/listApiariesHives
{ "includeInactive": false }
```

---

### Rate-Limits

Die Agent API ist auf **60 Anfragen pro Minute** pro API-Schlüssel limitiert. Das ist großzügig für interaktive KI-Nutzung und Automatisierung, verhindert aber Missbrauch.

Bei Überschreitung erhalten Sie einen `429 Too Many Requests`-Status mit einem `Retry-After`-Header, der angibt, wann Sie fortfahren können.

---

### Sicherheits-Best-Practices

- **Schlüssel regelmäßig rotieren** — Erstellen Sie neue Schlüssel und löschen Sie alte periodisch
- **Ablaufdaten verwenden** — Setzen Sie `valid_to`, wenn der Schlüssel nur temporär aktiv sein soll
- **Schlüssel beschriften** — Benennen Sie sie nach dem Agenten oder Dienst, der sie verwendet
- **Letzte Nutzung prüfen** — Kontrollieren Sie den „Zuletzt verwendet"-Zeitstempel, um ungenutzte Schlüssel zu identifizieren
- **Ungenutzte Schlüssel löschen** — Wenn ein Agent nicht mehr verwendet wird, widerrufen Sie den Schlüssel sofort

Schlüssel werden vor der Speicherung mit **SHA-256 + individuellem Salt gehasht**. Selbst im unwahrscheinlichen Fall eines Datenbankeinbruchs können Ihre Klartext-Schlüssel nicht wiederhergestellt werden.

Wenn Ihr Konto oder Ihre Imkerei gelöscht wird, werden alle zugehörigen Agent Keys automatisch entfernt.

---

### Ihren KI-Agenten einrichten

Auf der Agent Keys Seite in b.tree finden Sie einen gebrauchsfertigen **Skill-Installations-Prompt**. Kopieren Sie ihn und fügen Sie ihn in Ihren KI-Agenten ein (Claude, ChatGPT oder jeden LLM, der Tool-Nutzung / Function Calling unterstützt). Der Prompt lehrt Ihren Agenten:

> **Randnotiz:** Wenn Sie ChatGPT nutzen, können Sie auch den fertigen b.tree Custom GPT mit OAuth-Login verwenden: [b.tree Imkerei Manager DE](https://chatgpt.com/g/g-6a2bcc6afba881918b2d6f35d920d7c2-b-tree-imkerei-manager-de) oder [b.tree Beekeeping Manager EN](https://chatgpt.com/g/g-6a07eef786548191a55f6487827f9e5a-b-tree-beekeeping-manager-en). Das funktioniert aktuell nur mit dem EU-Server; der US-Server unterstützt noch keinen Custom GPT.

- Wie man sich bei der b.tree API authentifiziert
- Wie man verfügbare Tools über OpenAPI entdeckt
- Die b.tree Datenmodell-Konventionen
- Best Practices für das Erstellen und Aktualisieren von Einträgen

---

### Anwendungsfälle

- **Sprachgesteuerte Imkerei** — „Hey Claude, protokolliere eine Fütterung mit 3:2 Zuckerwasser für alle Völker am Wiesenstand"
- **Automatische Berichte** — Lassen Sie Ihren Agenten wöchentliche Zusammenfassungen von Behandlungen und Kontrollen erstellen
- **Wiederkehrende Aufgaben** — Richten Sie Agenten ein, die saisonale Fütterungs- oder Behandlungspläne erstellen
- **Wetterbasierte Verwaltung** — Agenten können das Standwetter prüfen, bevor sie Maßnahmen vorschlagen
- **Plattformübergreifend** — Funktioniert mit jedem KI-Agenten, der HTTP-Tool-Aufrufe unterstützt

---

*Die Agent API ist ein Premium-Feature. [Upgraden Sie Ihr Konto](https://app.btree.at/premium) um zu starten.*
