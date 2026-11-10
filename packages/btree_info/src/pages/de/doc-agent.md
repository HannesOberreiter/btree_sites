---
title: KI-gestützte Imkerei-Automatisierung
description: 'Verbinde deinen KI-Agenten (Claude, ChatGPT, LLM-Bots) über eine sichere API mit der b.tree Imkereisoftware. Automatisiere Stockverwaltung, Kontrollen und Datenanalyse.'
layout: '../../layouts/IndexLayout.astro'
lang: 'de'
---

## b.tree Agent API — KI für deine Imkerei

Die b.tree **Agent API** ist ein dedizierter Endpunkt, der externen **KI-Agenten** und **LLM-Assistenten** (Claude, ChatGPT, eigene Bots, ClawBot, MCP-kompatible Agenten) den programmatischen Zugriff auf deine Imkereidaten ermöglicht. Stell es dir so vor, als würdest du deinem KI-Assistenten ein eigenes Set an Imkerei-Werkzeugen geben.

Ob **Claude Desktop**, **ChatGPT mit Custom Actions**, ein **Zapier-KI-Workflow** oder ein selbst gebauter Agent — b.tree bietet vollen Lese- und Schreibzugriff auf deinen Imkereibetrieb über die sichere Agent API (OpenAPI), mit MCP als Alternative.

---

### Warum die Agent API nutzen?

- **Imkerei in natürlicher Sprache** — Bitte deine KI „erstelle einen Fütterungseintrag für alle Völker am Waldstand“ und es funktioniert einfach
- **Automatisierung** — Erstelle Workflows, die automatisch Kontrollen protokollieren, Behandlungen planen oder Erntedaten analysieren
- **Zugriff auf 40+ Werkzeuge** — Dein KI-Agent kann erstellen, lesen, aktualisieren und löschen: Fütterungen, Behandlungen, Ernten, Kontrollen, Todos, Kosten, Statistiken, Wetter und mehr, dazu eine Königinnenliste mit Geburtsdatum (nur lesend, z. B. um Völker mit einer Königin aus 2024 zu finden)
- **OpenAPI Discovery** — Dein Agent kann alle verfügbaren Endpunkte und deren Schemas automatisch erkennen
- **Sicher** — API-Schlüssel werden mit SHA-256 gehasht, pro Benutzer, mit optionalem Ablaufdatum

---

### Erste Schritte

#### 1. Agent Key generieren

Navigiere zu **Einstellungen → Profil → [Agent Keys](https://app.btree.at/setting/profile/agent-keys)** in deinem b.tree Konto.

Klicke auf **"Agent Key erstellen"** und setze optional:

- Eine **Bezeichnung** (z. B. "Claude Desktop", "Meine Automatisierung")
- Ein **Ablaufdatum** (leer lassen für permanenten Zugang)

⚠️ **Wichtig**: Der API-Schlüssel wird nur einmal nach der Erstellung angezeigt. Kopiere ihn sofort und speichere ihn sicher. Er kann später nicht mehr abgerufen werden.

Dein Schlüssel sieht so aus: `btree_ak_a1B2c3D4e5F6g7H8i9J0...`

#### 2. Authentifizierung

Füge deinen Schlüssel in den `Authorization`-Header jeder Anfrage ein:

```bash
Authorization: Bearer btree_ak_ihr_schluessel
```

#### 3. Verfügbare Tools entdecken

Rufe die vollständige OpenAPI-Spezifikation ab, um alle verfügbaren Endpunkte und deren Parameter zu sehen:

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

### Ergebnisgröße und Seiten

Ein Tool-Ergebnis hat höchstens **60.000 Zeichen** JSON (etwa 60 KB bei Text in lateinischer Schrift). `fetchTasks` und `fetchCharges` liefern Einträge in Seiten, die in diese Grenze passen:

- `sort`: `newest` (Standard) oder `oldest`. Die Sortierung ist nach Datum, dann nach ID.
- `format`: `compact` (Standard) liefert flache Einträge mit IDs und Namen, zum Beispiel `hive_id`, `hive_name`, `apiary_name` und `type_name`. `csv` liefert dieselben Einträge als einen CSV-Text. `full` liefert die Einträge mit den verschachtelten Objekten für Volk, Art, Stand, Ersteller und Bearbeiter.
- `limit`: optional, höchstens 1000. Ohne `limit` füllt der Server die Seite bis zur Grenze.
- Das Ergebnis enthält `total`, `count`, `hasMore` und `nextCursor`. Solange `hasMore` true ist, sende dieselbe Anfrage noch einmal mit `cursor` gleich `nextCursor`.

Beispiel — alle Behandlungen seit August, Seite für Seite:

```json
POST /api/v1/agent/tools/fetchTasks
{ "task": "treatment", "dateStart": "2026-08-01", "dateEnd": "2026-11-10" }
```

Für die letzte Fütterung verwende `{ "task": "feed", "sort": "newest", "limit": 1, "dateEnd": "<heute>" }`. Um `bee_id` und `edit_id` den Benutzern der Imkerei zuzuordnen, rufe `listCompanyUsers` auf.

`fetchCharges` (Lagerbuchungen) akzeptiert auch `q`, `dateStart`, `dateEnd` und `includeDeleted`. Jede Seite enthält `stockSummary` mit dem aktuellen Lagerbestand pro Lagerartikel.

`fetchWaxLedger` (Wachsbuch) liefert zwei Listen, `lots` (Wachslose) und `operations` (Buchungen). Jede Liste hat `total`, `count`, `hasMore` und `nextCursor`. Der erste Aufruf liefert auch `productSummary` über alle passenden Wachslose. Sende den `nextCursor` einer Liste als `cursor`, um die nächste Seite nur dieser Liste zu bekommen.

Auch `listMovements`, `listQueens` und `listApiariesHives` liefern Seiten mit `total`, `count`, `hasMore`, `nextCursor` und `items`:

- `listMovements` (Wanderungen) akzeptiert `sort`, `format` und `limit` wie `fetchTasks`. `dateStart` und `dateEnd` wirken auch einzeln; `dateEnd` schließt den ganzen Tag ein.
- `listQueens` sortiert die Königinnen nach Geburtsdatum, dann nach ID. Königinnen ohne Geburtsdatum kommen zuerst.
- `listApiariesHives` sortiert die Stände nach ID. Jeder Stand enthält seine aktiven Völker.

---

### Rate-Limits

Die Agent API ist auf **60 Anfragen pro Minute** pro API-Schlüssel limitiert. Das ist großzügig für interaktive KI-Nutzung und Automatisierung, verhindert aber Missbrauch.

Bei Überschreitung erhältst du einen `429 Too Many Requests`-Status mit einem `Retry-After`-Header, der angibt, wann du fortfahren kannst.

---

### Sicherheits-Best-Practices

- **Schlüssel regelmäßig rotieren** — Erstelle neue Schlüssel und lösche alte periodisch
- **Ablaufdaten verwenden** — Setze `valid_to`, wenn der Schlüssel nur temporär aktiv sein soll
- **Schlüssel beschriften** — Benenne sie nach dem Agenten oder Dienst, der sie verwendet
- **Letzte Nutzung prüfen** — Kontrolliere den „Zuletzt verwendet“-Zeitstempel, um ungenutzte Schlüssel zu identifizieren
- **Ungenutzte Schlüssel löschen** — Wenn ein Agent nicht mehr verwendet wird, widerrufe den Schlüssel sofort

Schlüssel werden vor der Speicherung mit **SHA-256 + individuellem Salt gehasht**. Selbst im unwahrscheinlichen Fall eines Datenbankeinbruchs können deine Klartext-Schlüssel nicht wiederhergestellt werden.

Wenn dein Konto oder deine Imkerei gelöscht wird, werden alle zugehörigen Agent Keys automatisch entfernt.

---

### Deinen KI-Agenten oder Skill einrichten

Auf der Agent-Keys-Seite in b.tree findest du einen gebrauchsfertigen **Skill-Installations-Prompt**. Kopiere ihn und füge ihn in deinen KI-Agenten oder Skill-Editor ein. Der Prompt erklärt:

- Wie man sich bei der b.tree API authentifiziert
- Wie man verfügbare Tools über OpenAPI entdeckt
- Die b.tree Datenmodell-Konventionen
- Best Practices für das Erstellen und Aktualisieren von Einträgen

#### b.tree als Custom Skill installieren

Anstatt einen Custom GPT oder einen eigenen Agenten zu erstellen, kannst du den Installations-Prompt auf einer unterstützten KI-Plattform in einen wiederverwendbaren Skill umwandeln:

- [ChatGPT Skills Editor](https://chatgpt.com/skills/editor)
- [Kimi Skills](https://www.kimi.com/skills)
- [Claude Skill Creator](https://claude.ai/new?q=Let%27s+create+a+skill+together+using+your+skill-creator+skill.+First+ask+me+what+the+skill+should+do.)

Öffne den gewünschten Skill-Editor. Kopiere danach den **Skill-Installations-Prompt** von der b.tree Agent-Keys-Seite und füge ihn in den Editor ein. Folge den Anweisungen der Plattform, um den Skill zu erstellen.

> **Alternative:** Wenn du ChatGPT nutzt, kannst du auch den fertigen b.tree Custom GPT mit OAuth-Login verwenden: [b.tree Imkerei Manager DE](https://chatgpt.com/g/g-6a2bcc6afba881918b2d6f35d920d7c2-b-tree-imkerei-manager-de) oder [b.tree Beekeeping Manager EN](https://chatgpt.com/g/g-6a07eef786548191a55f6487827f9e5a-b-tree-beekeeping-manager-en).

---

### Anwendungsfälle

- **Sprachgesteuerte Imkerei** — „Hey Claude, protokolliere eine Fütterung mit 3:2 Zuckerwasser für alle Völker am Wiesenstand“
- **Automatische Berichte** — Lass deinen Agenten wöchentliche Zusammenfassungen von Behandlungen und Kontrollen erstellen
- **Wiederkehrende Aufgaben** — Richte Agenten ein, die saisonale Fütterungs- oder Behandlungspläne erstellen
- **Wetterbasierte Verwaltung** — Agenten können das Standwetter prüfen, bevor sie Maßnahmen vorschlagen
- **Plattformübergreifend** — Funktioniert mit jedem KI-Agenten, der HTTP-Tool-Aufrufe unterstützt

---

### Alternative: MCP

Für ChatGPT, Claude, VS Code und andere Clients, die entfernte [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)-Server unterstützen, ist MCP eine alternative Verbindungsmöglichkeit. Dabei stehen dieselben Werkzeuge wie in WizBee über Streamable HTTP bereit. Die Anmeldung erfolgt über OAuth — ein API-Schlüssel muss nicht in den KI-Client kopiert werden.

#### MCP-Client verbinden

1. Öffne in b.tree **Einstellungen → Profil → [MCP](https://app.btree.at/setting/profile/mcp)**.
2. Kopiere die MCP-Server-URL für deine ausgewählte b.tree-Region.
3. Füge die URL in deinem KI-Client als **Remote-MCP-Server** hinzu.
4. Dein Browser öffnet b.tree. Melde dich an, prüfe den angeforderten Zugriff und stimme zu.
5. Kehre zu deinem KI-Client zurück und verwende die b.tree-Werkzeuge.

Für die EU-Region lautet die Server-URL:

```text
https://api.btree.at/api/v1/mcp
```

Die MCP-Verbindung verwendet die Imkerei und die Rolle, die bei deiner Zustimmung aktiv sind. Benutzer mit Lesezugriff können keine schreibenden Werkzeuge verwenden. MCP ist ein Premium-Feature und kann jederzeit unter **Einstellungen → Profil → MCP** widerrufen werden.

#### Beispiel: Mistral AI

Wenn du einen europäischen KI-Anbieter bevorzugst, kannst du mit **Mistral AI** deine Imkerei über b.tree MCP verwalten. Öffne [Verbindungen in Le Chat](https://chat.mistral.ai/connections), füge die oben angegebene b.tree-MCP-Server-URL hinzu und bestätige den Zugriff über die b.tree-OAuth-Anmeldung.

Nach der Verbindung kannst du Mistral beispielsweise bitten, deine Bienenstände aufzulisten, eine Fütterung zu erfassen oder deine letzten Durchsichten auszuwerten.

Die oben beschriebene Agent API ist der empfohlene Einstieg für Automatisierungen mit OpenAPI oder direkten HTTP-Aufrufen. Die Agent API nutzt einen manuell erstellten Schlüssel.

---

_Die Agent API ist ein Premium-Feature. [Upgrade dein Konto](https://app.btree.at/premium), um zu starten._
