---
title: API (Premium Feature)
description: 'Use the b.tree API (Premium): subscribe to your tasks with iCal in any calendar, send hive scale data, and connect AI agents to your beekeeping records.'
layout: '../layouts/IndexLayout.astro'
lang: 'en'
---

Active premium users do have access to our external API endpoints. Before you use it, you need to activate it in the settings [/setting/profile/api](https://app.btree.at/setting/profile/api). Although it is managed at your profile level, the API will be active on company level. If you manage multiple beekeeping operations, you need to activate it for each one separately, as you will also get a different key every time.

### Agent API (LLM / AI Bot Access)

Looking to connect an AI agent like **Claude**, **ChatGPT**, or a custom LLM bot to your beekeeping data? We offer a dedicated **[Agent API](/doc-agent/)** with its own API keys, rate limiting, and OpenAPI specification. The Agent API provides full read/write access to your hives, tasks, statistics and more — designed specifically for AI tool use and function calling. Head to [Agent API documentation](/doc-agent/) for setup instructions.

### Calendar, iCal

To get your tasks, breeding events and ToDos onto your local calendar on your phone, Google Calendar or computer, you can subscribe to our iCal endpoint. iCal is a standardized format understood by most calendar apps. The calendar will automatically update, dependent on your calendar settings, and will show you the past and future 6 months of events. You will need to subscribe to each task separately, e.g. feeding, harvest, ToDo. The calendar subscription is read-only; that means you cannot edit any task in your calendar.

On the API settings page you can copy the endpoint URL for subscriptions. It will look as follows: `https://api.btree.at/api/v1/external/ical/TASK_NAME/API_KEY`.

The following links will help you set up your subscription:

- Google Calendar (Computer, Android and iPhone): [support.google.com/calendar/answer/37100](https://support.google.com/calendar/answer/37100)
- Mac: [support.apple.com/en-gb/guide/calendar/icl1022/mac](https://support.apple.com/en-gb/guide/calendar/icl1022/mac)
- Windows Outlook: [support.microsoft.com/en-gb/topic/cff1429c-5af6-41ec-a5b4-74f2c278e98c](https://support.microsoft.com/en-gb/topic/cff1429c-5af6-41ec-a5b4-74f2c278e98c)

Hint: If you only download the iCal file, it is not a live data subscription and will only show you the currently downloaded events.

### Hive Scales

First of all, we do not make or sell any hive scales. This API is simply for users who like to DIY. Our hive scale system was very simple ([/HannesOberreiter/bScale](https://github.com/HannesOberreiter/bScale)), but we stopped working on it. There are plenty of alternative systems on the market, and if you need a professional setup, we recommend the German producer [Wolf-Waagen](https://www.wolf-waagen.de/) and if you like open source and tinkering, we recommend [HiveEyes](https://hiveeyes.org/); both have their own hardware and software solutions. Our beekeeping app does not integrate with any third-party hive scale software, as we believe they already offer a perfect software solution on their own. The only exception is the [TTN webhook for LoRaWAN scales](#lorawan-scales-the-things-network), which accepts the same payload keys as BEEP.

In addition to activating the API, you also need to first create your unique identifiers. This can be done on the scale table [/table/scale_data](https://app.btree.at/table/scale_data) with the dropdown button "scale". You need to create a new identifier for each hive scale. The current limit is 10 identifiers, and per identifier you have one data transfer per hour.

The information on the data you want to transfer is given with query params. On the API settings page you can copy the endpoint URL to send data with a simple GET request. It will look as follows: `https://api.btree.at/api/v1/external/scale/IDENTIFIER/API_KEY?action=CREATE_DEMO&datetime=2022-09-08T09:50:23.990Z&weight=10.5&temp1=10.2&temp2=8.9&rain=15&hum=53&hum2=61`

The query params are defined as follows:

- action: 'CREATE' or 'CREATE_DEMO' for testing, will not save data, but you will receive a response
- datetime: Optional in ISO8601 format, otherwise UTC server time will be used
- weight: Optional, numeric.
- temp1: Optional, numeric for temperature
- temp2: Optional, numeric for temperature
- hum: Optional, numeric for humidity
- hum2: Optional, numeric for a second humidity measurement
- rain: Optional, numeric for rain amount
- note: Optional, string with a maximum length of 300 characters

b.tree saves a value that you do not send as empty (`null`), not as 0. You can also send an empty value (`weight=`) or the text `null` (`weight=null`). Use this when a sensor fails or when your scale does not have the sensor. The table and the CSV export then show an empty cell, the weight chart shows a gap, and the daily average in the calendar ignores the reading. The success response shows `null` for an empty value. Readings from before this change keep 0 for a value that was not sent.

#### E-mail Warnings

b.tree sends an e-mail to the administrators of your beekeeping operation in two cases:

- The weight differs by more than 5 kg from the last saved weight of the scale. Readings without a weight between the two readings do not hide the change.
- A reading has no weight, but the reading before it had one. You get this e-mail only for the first reading without a weight, so a failed load cell does not send an e-mail each hour.

A weight of 0 is a real value. Thus a change from 40 kg to 0 kg sends an e-mail. Requests with `CREATE_DEMO` send no e-mail. The warnings also apply to the TTN webhook below.

#### Server Responses

Success:

```json
{
  "datetime": "2022-09-08 10:02:54", // UTC time of server
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

Error: Limit of data transfers reached:

```json
{
  "statusCode": 429,
  "statusText": "Too Many Requests",
  "errors": "you have exceeded your request limit"
}
```

Error: API or identifier wrong:

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

Error: Invalid value transferred (example: weight was given as string 'abc')

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

### LoRaWAN Scales (The Things Network)

LoRaWAN hive scales that send their data to [The Things Network](https://www.thethingsnetwork.org/) (TTN) can send their readings to b.tree with a TTN webhook. The webhook accepts the payload keys of the [BEEP](https://beep.nl/) platform, so a scale with a BEEP payload formatter works without changes, for example the open-source [TanenBase](https://github.com/hmd83/tanen) scale.

The webhook URL is on the API settings page. It looks as follows: `https://api.btree.at/api/v1/external/ttn/API_KEY`. One webhook serves all scales of your beekeeping operation, because b.tree finds the scale by the DevEUI of the device.

To set up the webhook:

1. Create the scale in b.tree on the scale table [/table/scale_data](https://app.btree.at/table/scale_data) with the dropdown button "scale".
2. Enter the DevEUI of the device in the field "DevEUI (LoRaWAN)" of the scale. The DevEUI has 16 hex characters. Separators and lowercase letters are allowed.
3. In the TTN Console, open your application and go to "Integrations" > "Webhooks".
4. Add a custom webhook with the webhook format "JSON".
5. Enter the webhook URL from the API settings page as "Base URL".
6. Turn on "Uplink message" and save the webhook.
7. Set a payload formatter for the device or the application that gives the BEEP keys.

b.tree reads these keys from `uplink_message.decoded_payload`:

- `weight_kg`: weight, saved as weight
- `t`: temperature 1, saved as temp1
- `h`: humidity 1, saved as humidity
- `t_i`: temperature 2 (for example inside the hive), saved as temp2
- `h_i`: humidity 2 (for example inside the hive), saved as humidity2

A key with the value `null` and a key that the payload does not have are saved as empty (`null`), not as 0. Many payload formatters send `null` when a sensor fails, for example `"weight_kg": null`. b.tree saves such a reading and sends the e-mail warning about the missing weight, see [E-mail Warnings](#e-mail-warnings).

b.tree ignores all other keys. The time of the reading is `uplink_message.received_at`. The device must have a DevEUI in TTN: some ABP devices with LoRaWAN 1.0.3 or older have no DevEUI, and b.tree then rejects the uplink with status 400.

The limit of one reading per hour per scale also applies to the webhook. Many LoRaWAN scales send extra messages, for example when the weight changes fast. Thus b.tree does not answer with an error when a reading comes within one hour of the previous reading. b.tree drops the reading and answers with status 200. b.tree also answers with status 200 and saves nothing when the payload has none of the keys above.

#### TTN Webhook Server Responses

Reading saved:

```json
{ "stored": true, "id": 200977 }
```

Reading dropped, because it came within one hour of the previous reading:

```json
{ "stored": false, "reason": "rate_limit" }
```

Reading dropped, because the payload has none of the known keys:

```json
{ "stored": false, "reason": "no_values" }
```

Errors:

- 400: The body is not a TTN uplink message, or it has no DevEUI.
- 402: The beekeeping operation has no active premium subscription.
- 404: The API key is wrong, or no scale in the beekeeping operation has this DevEUI.
