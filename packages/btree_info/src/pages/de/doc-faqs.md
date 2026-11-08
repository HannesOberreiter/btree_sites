---
title: 'Häufige Fragen'
description: 'Antworten auf häufige Fragen zu b.tree: App Stores, Offline-Nutzung, NFC und QR-Scanner, Spracherkennung, Premium-Mitgliedschaft, Datenspeicherung und Löschen des Kontos.'
layout: '../../layouts/IndexLayout.astro'
faq: true
lang: 'de'
---

### Ich kann die App nicht im Apple iOS AppStore oder Google PlayStore finden

Die b.tree Imkerei-Applikation ist eine reine Web-Lösung und kann als PWA ([wikipedia.org/wiki/Progressive_Web_App](https://en.wikipedia.org/wiki/Progressive_Web_App)) installiert werden. Der beste Weg, die App zu nutzen, ist, die PWA auf dein Gerät zu laden (Firefox unterstützt diese Funktion derzeit nicht). Außerdem sind wir im Google PlayStore und im iOS App Store vertreten, aber es ist mehr oder weniger dasselbe wie die PWA. Du musst selbst testen, was für dich besser funktioniert.

#### Installation PWA

- Chrome Computer & Android
  - Videoanleitung: [b.tree - Tutorial - PWA Android - Deutsch](https://www.btree.tv/de/watch/pwa-android-de/)
  - Textanleitung: [support.google.com/chrome/answer/9658361](https://support.google.com/chrome/answer/9658361)
- Apple iOS
  - Videoanleitung: [b.tree - Tutorial - PWA iOS - Deutsch](https://www.btree.tv/de/watch/pwa-ios-de/)
  - Textanleitung: [marlem-software.de/marlemblog/2022/02/04/](https://www.marlem-software.de/marlemblog/2022/02/04/progressive-web-apps-installieren-in-den-betriebssystemen-windows-android-ios-ubuntu-und-macos/#Progressive_Web-App_Installation_im_Betriebssystem_IOS)

#### Store-Links

- [Android PlayStore](https://play.google.com/store/apps/details?id=com.bnative)

<!-- - [iOS AppStore](https://apps.apple.com/us/app/btree-app-professional-beekeeping-software/id1115267587) -->

### Aufgabe ist in der Tabelle nicht sichtbar

Ein Grund dafür könnte das Datum der ersten Wanderung des Bienenstocks sein. Das System verwendet die Informationen über die Wanderungen, um die Verbindung zwischen Bienenstöcken und Bienenständen herzustellen. Wenn du eine Aufgabe vor dem Datum der ersten Wanderung erstellst, wird sie nicht in der Aufgabentabelle angezeigt. Um dieses Problem zu beheben, musst du das Wanderdatum auf ein Datum vor der Aufgabe ändern oder das Datum der Aufgabe nach der Wanderung festlegen.

### Meine Fütterung, Behandlungsart ... sind nicht in der Auswahl verfügbar

Unser System ist so aufgebaut, dass individuelle Einstellungen möglich sind. Du kannst deine eigenen Typen in den Optionen [/setting/option](https://app.btree.at/setting/option/checkup_types) definieren. Die Reihenfolge des Auswahlmenüs ist alphabetisch bzw. der favorisierte Typ steht immer an erster Stelle. Wenn du einen Typ nicht mehr benötigst, kannst du den Modus auf inaktiv setzen. Vorsicht, wenn du einen Typ löschst, den du vorher benutzt hast, können Statistiken und Tabellenwerte falsch sein oder fehlen. Deswegen empfehlen wir grundsätzlich, Typen, die nicht mehr gebraucht werden, z. B. eine Behandlungsmethode, die nicht mehr eingesetzt wird, auf inaktiv zu setzen, um die Datenintegrität zu gewährleisten.

### Ich vermisse ein Feld / Feature für meine Aufgabe

In den Optionen [/setting/field](https://app.btree.at/setting/field) kannst du verschiedene Felder für deine Aufgaben aktivieren, zum Beispiel Königinnenbewertung für Kontrollen. Wenn du dennoch noch ein Feld vermisst, kannst du uns eine E-Mail mit deinem Vorschlag schreiben. Wir führen eine Benutzer-Wunschliste, und wenn genügend Benutzer eine fehlende Funktion angefragt haben, werden wir versuchen, sie zu implementieren. Wir versuchen jedoch, die Anzahl der angebotenen Felder zu minimieren, da wir der Meinung sind, dass Informationen, die in der Statistik nicht wichtig sind, auch einfach in das Notizfeld geschrieben werden können, bzw. hat sich gezeigt, dass viele Felder mit der Zeit in einer größeren Imkerei obsolet werden.

### Die Spracherkennung funktioniert nicht

> **Hinweis zur Einstellung:** Die Spracherkennung wird in einem zukünftigen Update als veraltet markiert und entfernt.

Die Spracherkennung ist abhängig von der verfügbaren Web-API und funktioniert bisher nur in den Browsern Google Chrome und Microsoft Edge, außerdem benötigt sie eine aktive Internetverbindung. Der Button zur Spracherkennung wird nur angezeigt, bei Systemen, die dieses auch unterstützen. Die Spracherkennung selbst ist nur aktiv, wenn du auf den Button klickst, ein kontinuierliches Abhören ist derzeit nicht möglich.

Die aktuelle Browserunterstützung findest du unter folgendem Link: [caniuse.com/mdn-api_speechrecognitionevent](https://caniuse.com/mdn-api_speechrecognitionevent)

Anmerkung: Safari wurde zurzeit ausgelassen, da gewisse Funktionen nur mit Fehlern funktionieren und die Spracherkennung um einiges schlechter funktioniert.

### NFC funktioniert nicht

Wie bei der Spracherkennung ist auch NFC durch die Browserunterstützung eingeschränkt. Du wirst eine Warnung erhalten, wenn du versuchst, NFC zu aktivieren, wenn dein Browser dies nicht unterstützt.

Die aktuelle Browserunterstützung findest du unter folgendem Link: [caniuse.com/webnfc](https://caniuse.com/webnfc)

Alternativ kann man auch eine beliebige NFC-App aus dem Google PlayStore oder iOS AppStore verwenden. Zumindest Android sollte NFCs auch ohne geöffnete App lesen, wenn du die Option aktivierst. Die NFC-Tags selbst kannst du in vielen Online-Shops kaufen, und sie sind im Allgemeinen sehr günstig.

### So verwendest du NFC oder den QR-Scanner

Sowohl der NFC- als auch der QR-Code-Scanner sollen dir dabei helfen, schneller im Feld am Bienenstand zu arbeiten. Die einfachste Funktion ist eine Weiterleitung zu der Seite, die du auf dem NFC-Tag oder QR-Code gespeichert hast. Die mehr fortgeschrittene Anwendung ist die Verwendung der Bienenstock-URL, wenn du z. B. die URL zu einem bestimmten Stock auf dem Tag speicherst, z. B. `https://app.btree.at/detail/hive/[hive_id]`, und dich auf einer Seite mit einem Stock-Dropdown/Auswahl befindest, z. B. im QuickTool oder beim Erstellen einer neuen Wanderung, wählt das System nach dem Scannen automatisch den Bienenstock in der Auswahlliste aus. Ein konkretes Beispiel: Du gehst zu deinem Bienenstand "A" und lädst zwanzig Bienenstöcke auf deinen Anhänger, um diese zum Bienenstand "B" zu transportieren. Nach dem Beladen öffnet man die b.tree Imkerei-App, wählt eine neue Wanderung [/new/movement](https://app.btree.at/new/movement) und scannt dann die zwanzig Bienenstöcke auf dem Anhänger mit dem NFC-Tag oder mit dem QR-Code. Dadurch sind alle 20 Stöcke ausgewählt und man muss nur noch abspeichern. Besonders bei sehr vielen Bienenstöcken ist die Auswahl um einiges schneller als die händische Selektion.

#### NFC exportieren

Videoerklärung: [b.tree - Tutorial - NFC - Deutsch](https://www.btree.tv/de/watch/nfc-de/)

Du kannst NFCs mit einem Tool eines Drittanbieters beschreiben oder die integrierte Schaltfläche "Teilen" verwenden. Du findest die Schaltfläche in der Fußzeile der App, wo die aktuelle URL steht. Wenn du auf den Text klickst, öffnet sich ein Dialog, mit dem du auf einen NFC-Tag schreiben kannst.

#### QR-Code exportieren

Videoerklärung: [b.tree - Tutorial - QR Code - Deutsch](https://www.btree.tv/de/watch/qr-code-de/)

In der Stock-Tabelle [/table/hive](https://app.btree.at/table/hive) wählst du die Stöcke aus, für die du einen QR-Code generieren möchtest. Dann klickst du auf die Dropdown-Schaltfläche und wählst "QR drucken". Es öffnet sich ein Dialog, in dem QR-Codes für jeden ausgewählten Bienenstock erzeugt werden. Mit einer zusätzlichen Schaltfläche kannst du ein separates Fenster zum Drucken öffnen. Alternativ kannst du ein QR-Code-Generierungstool eines Drittanbieters verwenden und einfach QR-Codes auf der Grundlage der URLs generieren.

### Premium-Mitgliedschaft

Auf der Seite [/premium](https://app.btree.at/premium) kannst du deine Premium-Mitgliedschaft gegen Bezahlung verlängern. Wenn du den Premium-Zugang kaufst, wird dein Konto um 365 Tage Premium-Zeit erweitert. Wenn du bereits ein Guthaben in Premium-Zeit hast, wird die neue Zeit zu deinem laufenden Guthaben hinzugefügt. Ansonsten wird das aktuelle Datum verwendet. Wenn du keine Premium-Tage mehr hast, kannst du die Anwendung immer noch nutzen, aber du kannst die Premium-Funktionen nicht mehr nutzen und befindest dich wieder innerhalb des Limits für Bienenstöcke und Stände. Auf diese Weise hoffen wir, dir ein faires System ohne monatliche oder jährliche automatische Zahlungen zu bieten, und du behältst die volle Kontrolle darüber, wann du zahlen möchtest. Sollte die Premium-Zeit nach der Bezahlung nicht automatisch angerechnet werden, versuche einmal auszuloggen und wieder einzusteigen in die App. Ansonsten melde dich bitte bei uns: office📧btree.at

### Gibt es eine Offline-Version?

Nein, b.tree funktioniert nur mit einer aktiven Internetverbindung. Eine Offline-Version ist nicht geplant.

### Wo werden meine Daten gespeichert und kann ich sie lokal speichern?

Der Serverstandort ist in Deutschland und alle Daten werden in einer Online-Speicherdatenbank gespeichert. Verschlüsselte Backups werden bei Bunny.net in Frankfurt, Deutschland, gespeichert. Du kannst eine Kopie deiner Daten im CSV-Format herunterladen [/setting/company](https://app.btree.at/setting/company), wir empfehlen dir, mindestens einmal im Jahr eine Kopie zur sicheren Aufbewahrung herunterzuladen. In den Tabellenansichten ist es auch möglich, die Daten im CSV-Format zu exportieren.

### Wie lösche ich mein Konto und entferne alle meine Daten?

Wenn du einer von vielen Benutzern in einem Imkereibetrieb bist, kannst du dein Profil und deine Benutzerdaten in den Profileinstellungen [/setting/profile](https://app.btree.at/setting/profile) löschen. Wenn du der einzige Benutzer in einem Betrieb bist, werden alle Daten des Betriebs, z. B. Bienenvölker, Standort des Bienenstocks, ebenfalls gelöscht. Wenn du nur einen deiner Betriebe löschen möchtest, kannst du diesen in den Betriebseinstellungen [/setting/company](https://app.btree.at/setting/company) löschen. Dies ist nur möglich, wenn du der letzte Benutzer in diesem Betrieb bist. In der Hauptsicherung der Datenbank werden die Daten nach 60 Tagen entfernt (automatische Löschung von Sicherungen, die älter als 60 Tage sind). Eventuelle Rechnungen oder Mailverkehr mit \*@btree.at werden nach 7 Jahren gelöscht. Wenn du uns eine E-Mail schreibst, um deinen Account zu löschen, lege bitte einen Nachweis vor, dass der Account dir gehört (z. B. Imkereinamen).

### Die Bienenstockzählung ist falsch

Der Hauptgrund, warum deine Zählung falsch sein kann, ist die Verwendung von Gruppenstöcken, da diese keine historischen Daten haben. Daher ist die Anzahl der Gruppenstöcke nur in der Bienenstand-Zählung sichtbar und spiegelt immer den aktuellen Wert wider. Ein weiterer Grund für eine falsche Anzahl ist, dass ein gelöschtes Bienenvolk nicht mehr in der Statistik auftaucht. Dies gilt für alle Statistiken, daher solltest du deine Völker inaktiv setzen, wenn diese abgeschwärmt sind oder verkauft wurden, und diese nicht löschen, da dann auch alle damit verbundenen Daten gelöscht werden!

### Was bedeuten die Zahlen im Navigationsmenü?

Die Zahlen bei Aufgaben und ToDo's kennzeichnen die Anzahl der noch offenen / nicht erledigten Aufgaben. Bei Stand, Stock und Königin stehen die Zahlen für die jeweilige Anzahl. Bei Stock ist die Zahl inklusive möglicher Gruppenstöcke. Die Zahlen werden alle 5 Minuten aktualisiert, d. h. Änderungen sind sofort erkennbar.

### Tutorial-Videos

Auf [b.tree Tutorials](https://www.btree.tv/de/) findest du eine Sammlung von Tutorial-Videos zu verschiedenen Themen.

### Kann ich mich mit Google oder Apple anmelden?

Ja, neben der Standard-E-Mail- und Passwort-Anmeldung unterstützt b.tree die Anmeldung mit Google und Apple. Diese Optionen findest du auf der Login-Seite [/visitor/login](https://app.btree.at/visitor/login). Wenn du dich erstmals mit einem sozialen Anbieter mit einer bei b.tree bereits registrierten E-Mail-Adresse anmeldest, werden die Konten automatisch verknüpft.

### Was ist WizBee?

WizBee ist dein persönlicher KI-Imkerei-Assistent auf Basis von Mistral AI, exklusiv für Premium-Mitglieder unter [/wizbee](https://app.btree.at/wizbee). Stelle Imkerei-Fragen in natürlicher Sprache. WizBee arbeitet auch mit deinen eigenen Daten: Fütterungen, Behandlungen, Ernten, Kontrollen, Aufgaben und Lagerbestand anlegen und ändern, Statistiken anzeigen und das Wetter am Bienenstand abfragen. Du kannst tippen oder die Spracheingabe verwenden. Der monatliche Verbrauch wird erfasst und ein Budget gilt, um den Dienst für alle Premium-Nutzer fair zu gestalten.

### Was ist das Temperatur- / GTS-Feature?

Premium-Mitglieder profitieren von automatischen Wetterdaten: Beim Ausfüllen einer Kontrolle wird das Temperaturfeld automatisch mit Daten des jeweiligen Bienenstandorts befüllt. Jeder Bienenstand hat außerdem eine Imker-Wettervorhersage mit Flugwetter für Bienen, Frost- und Hitzewarnungen sowie amtlichen Unwetterwarnungen. Zusätzlich kann die Standkarte eine Wetterüberlagerung anzeigen. Die **Grünlandtemperatursumme (GTS)** – ein in der mitteleuropäischen Imkerei genutzter Wärmesummenwert zur Einschätzung der Völkerstärke und optimaler Behandlungszeitpunkte – steht allen Nutzern je Bienenstand zur Verfügung.
