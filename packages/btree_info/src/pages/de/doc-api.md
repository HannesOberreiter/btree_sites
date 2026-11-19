---
title: API (Premium-Funktion)
description: 'Die b.tree API (Premium): Abonniere deine Aufgaben per iCal in jedem Kalender, sende Daten deiner Stockwaagen und verbinde KI-Agenten mit deinen Imkereidaten.'
layout: '../../layouts/IndexLayout.astro'
lang: 'de'
---

Aktive Premium-Benutzer haben Zugang zu unseren externen API-Endpunkten. Bevor du diese nutzen kannst, musst du diese in den Einstellungen [/setting/profile/api](https://app.btree.at/setting/profile/api) aktivieren. Obwohl sie auf deiner Profilebene verwaltet wird, ist die API auf Imkereibasis aktiv. Wenn du mehrere Imkereibetriebe verwaltest, musst du für jeden einzelnen Betrieb die API aktivieren, da du jedes Mal einen anderen Schlüssel erhältst.

### Agent API (LLM / KI-Bot-Zugriff)

Möchtest du einen KI-Agenten wie **Claude**, **ChatGPT** oder einen eigenen LLM-Bot mit deinen Imkereidaten verbinden? Wir bieten eine dedizierte **[Agent API](/de/doc-agent/)** mit eigenen API-Schlüsseln, Rate-Limiting und OpenAPI-Spezifikation. Die Agent API bietet vollen Lese-/Schreibzugriff auf deine Völker, Aufgaben, Statistiken und mehr. Weitere Informationen findest du in der [Agent-API-Dokumentation](/de/doc-agent/).

### Kalender, iCal

Um deine Aufgaben, Zuchtereignisse und ToDo's in deinen lokalen Kalender auf deinem Handy, Google Kalender oder Computer zu übertragen, kannst du unseren iCal-Endpunkt abonnieren. iCal ist ein standardisiertes Format, das von den meisten Kalenderanwendungen verstanden wird. Der Kalender wird automatisch aktualisiert, abhängig von deinen Kalendereinstellungen, und zeigt dir die vergangenen und zukünftigen Ereignisse der letzten 6 Monate an. Du musst jede Aufgabe separat abonnieren, z. B. Fütterung, Ernte, ToDo. Das Kalenderabonnement ist schreibgeschützt, d. h. du kannst keine Aufgabe in deinem Kalender bearbeiten.

Auf der Seite mit den API-Einstellungen kannst du die Endpunkt-URL für die Abonnements kopieren, sie sieht wie folgt aus: `https://api.btree.at/api/v1/external/ical/TASK_NAME/API_KEY`.

Die folgenden Links helfen dir bei der Einrichtung deines Abonnements:

- Video iCal Google Kalender hinzufügen: [b.tree - Tutorial - iCal Abonnieren - Deutsch](https://www.btree.tv/de/watch/ical/)
- Google Kalender (Computer, Android und iPhone): [support.google.com/calendar/answer/37100](https://support.google.com/calendar/answer/37100)
- Mac: [support.apple.com/de-at/guide/calendar/icl1022/mac](https://support.apple.com/de-at/guide/calendar/icl1022/mac)
- Windows Outlook: [support.microsoft.com/de-de/topic/cff1429c-5af6-41ec-a5b4-74f2c278e98c](https://support.microsoft.com/de-de/topic/cff1429c-5af6-41ec-a5b4-74f2c278e98c)

Hinweis: Wenn du nur die iCal-Datei herunterlädst, handelt es sich nicht um ein Live-Datenabonnement, sondern es werden dir nur die aktuell heruntergeladenen Ereignisse angezeigt.

### Stockwaagen

Zunächst möchten wir erwähnen, dass wir selbst keine Bienenstockwaagen herstellen oder verkaufen. Diese API ist nur für Benutzer gedacht, die gerne selbst Hand anlegen. Unser ehemaliges Stockwaagensystem war sehr einfach aufgebaut ([/HannesOberreiter/bScale](https://github.com/HannesOberreiter/bScale)), aber wir haben die Arbeit daran eingestellt, da es bereits eine Fülle von sehr guten alternativen Systemen auf dem Markt gibt. Wenn du ein professionelles Setup benötigst, empfehlen wir den deutschen Hersteller [Wolf-Waagen](https://www.wolf-waagen.de/) und wenn du Open Source und Basteln magst, empfehlen wir die [HiveEyes](https://hiveeyes.org/) Community, beide haben ihre eigenen Hardware- und Softwarelösungen. Unsere Imkerei-App ist mit keinem externen Stockwaagen-System kompatibel, außer man modifiziert selbst die Datenübertragung. Die einzige Ausnahme ist der [TTN-Webhook für LoRaWAN-Waagen](#lorawan-waagen-the-things-network), der dieselben Payload-Schlüssel wie BEEP annimmt. Durch die Fülle an Angeboten und Systemen ist ein Support von externen Waagen nur schwer durchzuführen, zweitens haben die meisten Waagenhersteller bereits sehr gute Softwarelösungen im Angebot.

Um die API zu aktivieren, musst du zunächst eindeutige Identifikatoren erstellen. Dies kannst du in der Stockwaagen-Tabelle [/table/scale_data](https://app.btree.at/table/scale_data) mit der Dropdown-Schaltfläche "Waagen" tun. Du musst für jede Stockwaage einen neuen Ident erstellen. Die derzeitige Grenze liegt bei 10 Stockwaagen mit je einer Datenübertragung pro Stunde.

Die Informationen über die zu übertragenden Daten werden mit Query-Params angegeben, um es möglichst einfach zu machen. Auf der API-Einstellungsseite kannst du die Endpunkt-URL kopieren, um Daten mit einer einfachen GET-Anfrage zu senden: `https://api.btree.at/api/v1/external/scale/IDENTIFIER/API_KEY?action=CREATE_DEMO&datetime=2022-09-08T09:50:23.990Z&weight=10.5&temp1=10.2&temp2=8.9&rain=15&hum=53&hum2=61`

Die Abfrage-Parameter sind wie folgt definiert:

- action: 'CREATE' oder 'CREATE_DEMO' zum Testen, es werden keine Daten gespeichert, aber man erhält eine Server-Antwort
- datetime: Optional im ISO-8601-Format, wenn nicht angegeben, wird die Server-UTC-Zeit verwendet
- weight: Optional, numerisch für das gemessene Gewicht
- temp1: Optional, numerisch für Temperatur
- temp2: Optional, numerisch für eine zweite Temperaturmessung (z. B. im Stock)
- hum: Optional, numerisch für Luftfeuchtigkeit
- hum2: Optional, numerisch für eine zweite Messung der Luftfeuchtigkeit
- rain: Optional, numerisch für Regenmenge
- note: Optional, alphanumerischer Text mit maximal 300 Zeichen, hier kann z. B. der Batteriestatus oder Informationen zur Sendeleistung übertragen werden

b.tree speichert einen Wert, den du nicht sendest, als leer (`null`) und nicht als 0. Du kannst auch einen leeren Wert (`weight=`) oder den Text `null` (`weight=null`) senden. Verwende das, wenn ein Sensor ausfällt oder wenn deine Waage den Sensor nicht hat. Die Tabelle und der CSV-Export zeigen dann eine leere Zelle, das Gewichtsdiagramm zeigt eine Lücke, und der Tagesdurchschnitt im Kalender ignoriert den Messwert. Die Erfolgsantwort zeigt `null` für einen leeren Wert. Messwerte von vor dieser Änderung behalten 0 für einen Wert, der nicht gesendet wurde.

#### E-Mail-Warnungen

b.tree sendet in zwei Fällen eine E-Mail an die Administratoren deiner Imkerei:

- Das Gewicht weicht um mehr als 5 kg vom letzten gespeicherten Gewicht der Waage ab. Messwerte ohne Gewicht zwischen den beiden Messwerten verdecken die Änderung nicht.
- Ein Messwert hat kein Gewicht, aber der Messwert davor hatte eines. Du bekommst diese E-Mail nur für den ersten Messwert ohne Gewicht. Eine ausgefallene Wägezelle sendet daher nicht jede Stunde eine E-Mail.

Ein Gewicht von 0 ist ein echter Wert. Daher sendet eine Änderung von 40 kg auf 0 kg eine E-Mail. Anfragen mit `CREATE_DEMO` senden keine E-Mail. Die Warnungen gelten auch für den TTN-Webhook weiter unten.

#### Server-Antworten

Erfolgreiches Ereignis:

```json
{
  "datetime": "2022-09-08 10:02:54",
  "weight": 10.5,
  "temp1": 10.2,
  "temp2": 8.9,
  "rain": 15,
  "humidity": 53,
  "humidity2": 61,
  "note": "",
  "scale_id": 27, // your identifier ID on the server
  "id": 200977 // current entry
}
```

Error: Limit an Datenübertragungen erreicht:

```json
{
  "statusCode": 429,
  "statusText": "Too Many Requests",
  "errors": "you have exceeded your request limit"
}
```

Error: API Key oder Ident ist falsch oder nicht vorhanden, beides gibt dieselbe Antwort

```json
{
  "statusCode": 404,
  "statusText": "Not Found",
  "errors": {
    "type": "NotFound",
    "data": {}
  }
}
```

Error: Falscher Wert (zum Beispiel wurde hier 'weight' mit 'abc' übertragen)

```json
{
  "statusCode": 400,
  "statusText": "Bad Request",
  "errors": [
    {
      "value": "abc",
      "msg": "Invalid value",
      "param": "weight",
      "location": "query",
      "msgTranslation": {
        "de": "Falscher Wert",
        "en": "Invalid value"
      }
    }
  ]
}
```

### LoRaWAN-Waagen (The Things Network)

LoRaWAN-Stockwaagen, die ihre Daten an [The Things Network](https://www.thethingsnetwork.org/) (TTN) senden, können ihre Messwerte mit einem TTN-Webhook an b.tree schicken. Der Webhook nimmt die Payload-Schlüssel der Plattform [BEEP](https://beep.nl/) an. Eine Waage mit einem BEEP Payload Formatter funktioniert daher ohne Änderung, zum Beispiel die Open-Source-Waage [TanenBase](https://github.com/hmd83/tanen).

Die Webhook-URL findest du auf der API-Einstellungsseite. Sie sieht wie folgt aus: `https://api.btree.at/api/v1/external/ttn/API_KEY`. Ein Webhook genügt für alle Waagen deiner Imkerei, denn b.tree findet die Waage über die DevEUI des Geräts.

So richtest du den Webhook ein:

1. Lege die Waage in b.tree in der Stockwaagen-Tabelle [/table/scale_data](https://app.btree.at/table/scale_data) mit der Dropdown-Schaltfläche "Waagen" an.
2. Trage die DevEUI des Geräts im Feld "DevEUI (LoRaWAN)" der Waage ein. Die DevEUI hat 16 Hex-Zeichen. Trennzeichen und Kleinbuchstaben sind erlaubt.
3. Öffne in der TTN Console deine Anwendung und gehe zu "Integrations" > "Webhooks".
4. Füge einen Custom Webhook mit dem Webhook-Format "JSON" hinzu.
5. Trage die Webhook-URL von der API-Einstellungsseite als "Base URL" ein.
6. Aktiviere "Uplink message" und speichere den Webhook.
7. Setze für das Gerät oder die Anwendung einen Payload Formatter, der die BEEP-Schlüssel ausgibt.

b.tree liest diese Schlüssel aus `uplink_message.decoded_payload`:

- `weight_kg`: Gewicht, gespeichert als weight
- `t`: Temperatur 1, gespeichert als temp1
- `h`: Luftfeuchtigkeit 1, gespeichert als humidity
- `t_i`: Temperatur 2 (zum Beispiel im Stock), gespeichert als temp2
- `h_i`: Luftfeuchtigkeit 2 (zum Beispiel im Stock), gespeichert als humidity2

Ein Schlüssel mit dem Wert `null` und ein Schlüssel, den die Payload nicht hat, werden als leer (`null`) gespeichert und nicht als 0. Viele Payload-Formatter senden `null`, wenn ein Sensor ausfällt, zum Beispiel `"weight_kg": null`. b.tree speichert so einen Messwert und sendet die E-Mail-Warnung über das fehlende Gewicht, siehe [E-Mail-Warnungen](#e-mail-warnungen).

b.tree ignoriert alle anderen Schlüssel. Die Zeit des Messwerts ist `uplink_message.received_at`. Das Gerät muss in TTN eine DevEUI haben: Manche ABP-Geräte mit LoRaWAN 1.0.3 oder älter haben keine DevEUI, und b.tree lehnt den Uplink dann mit Status 400 ab.

Die Grenze von einem Messwert pro Stunde und Waage gilt auch für den Webhook. Viele LoRaWAN-Waagen senden zusätzliche Nachrichten, zum Beispiel wenn sich das Gewicht schnell ändert. Daher antwortet b.tree nicht mit einem Fehler, wenn ein Messwert innerhalb einer Stunde nach dem vorherigen Messwert kommt. b.tree verwirft den Messwert und antwortet mit Status 200. b.tree antwortet auch mit Status 200 und speichert nichts, wenn die Payload keinen der Schlüssel oben hat.

#### Server-Antworten des TTN-Webhooks

Messwert gespeichert:

```json
{ "stored": true, "id": 200977 }
```

Messwert verworfen, weil er innerhalb einer Stunde nach dem vorherigen Messwert kam:

```json
{ "stored": false, "reason": "rate_limit" }
```

Messwert verworfen, weil die Payload keinen der bekannten Schlüssel hat:

```json
{ "stored": false, "reason": "no_values" }
```

Fehler:

- 400: Der Body ist keine TTN-Uplink-Nachricht, oder er hat keine DevEUI.
- 402: Die Imkerei hat kein aktives Premium-Abonnement.
- 404: Der API-Schlüssel ist falsch, oder keine Waage der Imkerei hat diese DevEUI.
