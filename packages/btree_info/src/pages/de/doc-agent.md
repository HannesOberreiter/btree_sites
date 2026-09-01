---
title: KI-gestützte Imkerei-Automatisierung
description: "Verbinden Sie Ihren KI-Agenten (Claude, ChatGPT, LLM-Bots) mit der b.tree Imkereisoftware über eine sichere API. Automatisieren Sie Stockverwaltung, Kontrollen und Datenanalyse."
layout: "../../layouts/IndexLayout.astro"
lang: "de"
---

## b.tree Agent API — KI für Ihre Imkerei

Die b.tree **Agent API** ist ein dedizierter Endpunkt, der externen **KI-Agenten** und **LLM-Assistenten** (Claude, ChatGPT, eigene Bots, ClawBot, MCP-kompatible Agenten) den programmatischen Zugriff auf Ihre Imkereidaten ermöglicht. Stellen Sie es sich so vor, als würden Sie Ihrem KI-Assistenten ein eigenes Set an Imkerei-Werkzeugen geben.

Ob **Claude Desktop**, **ChatGPT mit Custom Actions**, ein **Zapier KI-Workflow** oder ein selbst gebauter Agent — b.tree bietet vollen Lese- und Schreibzugriff auf Ihren Imkereibetrieb über sichere MCP- und OpenAPI-Schnittstellen.

---

### MCP

Für ChatGPT, Claude, VS Code und andere Clients, die entfernte [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)-Server unterstützen, ist MCP der einfachste Verbindungsweg. Dabei stehen dieselben Werkzeuge wie in WizBee über Streamable HTTP bereit. Die Anmeldung erfolgt über OAuth—ein API-Schlüssel muss nicht in den KI-Client kopiert werden.

#### MCP-Client verbinden

1. Öffnen Sie in b.tree **Einstellungen → Profil → [MCP](https://app.btree.at/setting/profile/mcp)**.
2. Kopieren Sie die MCP-Server-URL für Ihre ausgewählte b.tree-Region.
3. Fügen Sie die URL in Ihrem KI-Client als **Remote-MCP-Server** hinzu.
4. Ihr Browser öffnet b.tree. Melden Sie sich an, prüfen Sie den angeforderten Zugriff und stimmen Sie zu.
5. Kehren Sie zu Ihrem KI-Client zurück und verwenden Sie die b.tree-Werkzeuge.

Für die EU-Region lautet die Server-URL:

```text
https://api.btree.at/api/v1/mcp
```

Die MCP-Verbindung verwendet die Imkerei und die Rolle, die bei Ihrer Zustimmung aktiv sind. Benutzer mit Lesezugriff können keine schreibenden Werkzeuge verwenden. MCP ist ein Premium-Feature und kann jederzeit unter **Einstellungen → Profil → MCP** widerrufen werden.

Verwenden Sie die Agent API unten, wenn Ihre Automatisierungsplattform statt MCP OpenAPI oder direkte HTTP-Aufrufe erwartet. Die Agent API nutzt einen manuell erstellten Schlüssel.

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

### Ihren KI-Agenten oder Skill einrichten

Auf der Agent Keys Seite in b.tree finden Sie einen gebrauchsfertigen **Skill-Installations-Prompt**. Kopieren Sie ihn und fügen Sie ihn in Ihren KI-Agenten oder Skill-Editor ein. Der Prompt erklärt:

- Wie man sich bei der b.tree API authentifiziert
- Wie man verfügbare Tools über OpenAPI entdeckt
- Die b.tree Datenmodell-Konventionen
- Best Practices für das Erstellen und Aktualisieren von Einträgen

#### b.tree als Custom Skill installieren

Anstatt einen Custom GPT oder einen eigenen Agenten zu erstellen, können Sie den Installations-Prompt auf einer unterstützten KI-Plattform in einen wiederverwendbaren Skill umwandeln:

- [ChatGPT Skills Editor](https://chatgpt.com/skills/editor)
- [Kimi Skills](https://www.kimi.com/skills)
- [Claude Skill Creator](https://claude.ai/new?q=Let%27s+create+a+skill+together+using+your+skill-creator+skill.+First+ask+me+what+the+skill+should+do.)

Öffnen Sie den gewünschten Skill-Editor. Kopieren Sie danach den **Skill-Installations-Prompt** von der b.tree Agent Keys Seite und fügen Sie ihn in den Editor ein. Folgen Sie den Anweisungen der Plattform, um den Skill zu erstellen.

> **Alternative:** Wenn Sie ChatGPT nutzen, können Sie auch den fertigen b.tree Custom GPT mit OAuth-Login verwenden: [b.tree Imkerei Manager DE](https://chatgpt.com/g/g-6a2bcc6afba881918b2d6f35d920d7c2-b-tree-imkerei-manager-de) oder [b.tree Beekeeping Manager EN](https://chatgpt.com/g/g-6a07eef786548191a55f6487827f9e5a-b-tree-beekeeping-manager-en).

---

### Anwendungsfälle

- **Sprachgesteuerte Imkerei** — „Hey Claude, protokolliere eine Fütterung mit 3:2 Zuckerwasser für alle Völker am Wiesenstand"
- **Automatische Berichte** — Lassen Sie Ihren Agenten wöchentliche Zusammenfassungen von Behandlungen und Kontrollen erstellen
- **Wiederkehrende Aufgaben** — Richten Sie Agenten ein, die saisonale Fütterungs- oder Behandlungspläne erstellen
- **Wetterbasierte Verwaltung** — Agenten können das Standwetter prüfen, bevor sie Maßnahmen vorschlagen
- **Plattformübergreifend** — Funktioniert mit jedem KI-Agenten, der HTTP-Tool-Aufrufe unterstützt

---

*Die Agent API ist ein Premium-Feature. [Upgraden Sie Ihr Konto](https://app.btree.at/premium) um zu starten.*
