---
title: Sonstiges
description: 'Weitere Funktionen von b.tree: Tastaturkurzbefehle, Dropbox, Kalender, Schnellsuche, Zuchtserien, QR-Code-Scanner, Spracherkennung, mehrere Benutzer, Königinnen-Stammbaum und öffentliche Karten.'
layout: '../../layouts/IndexLayout.astro'
lang: 'de'
---

### Tastaturkurzbefehle

- Allgemein
  - (h) Öffnet das Hilfefenster
  - (s) Aktiviert die Spracherkennung
- Kalender
  - (← Pfeil nach links) Voriger Monat / Woche
  - (→ Pfeil nach rechts) Nächster Monat / nächste Woche
- Tabellen
  - (← Pfeil nach links) Vorherige Tabellenseite
  - (→ Pfeil nach rechts) Nächste Tabellenseite
  - (↑ Pfeil nach oben) Erste Tabellenseite
  - (↓ Pfeil nach unten) Letzte Tabellenseite

### Passwort ändern

Auf der Profilseite, Registerkarte Anmeldedaten, kannst du dein Passwort ändern [/setting/profile/credentials](https://app.btree.at/setting/profile/credentials). Aus Sicherheitsgründen musst du auch dein altes Passwort angeben. Auf der Registerkarte Benutzer kannst du die Sprache ändern, Profileinstellungen vornehmen und dein Konto löschen [/setting/profile/user](https://app.btree.at/setting/profile/user) (keine Wiederherstellung möglich!).

### Aufgelöster Filemanager

In unserer Vorgängerversion 5.x.x war es möglich, Dateien auf unseren Server hochzuladen. Wir haben diesen Dienst eingestellt, die einzige Möglichkeit ist die Nutzung von Dropbox als Drittanbieterdienst, der mit unserer Imkerei-App verbunden werden kann.

### Dropbox

Eine Videoerklärung findet man auf b.tree Tutorials: [b.tree - Tutorial - Dropbox als Datenverwaltung - Deutsch](https://www.btree.tv/de/watch/dropbox/)

Um Fotos oder Dateien zu Aufgaben etc. hinzuzufügen, kannst du ein Dropbox-Konto verbinden [/setting/dropbox](https://app.btree.at/setting/dropbox). Dropbox ist zwar nicht kostenlos, bietet aber einen einfach zu bedienenden Cloud-Dienst für die Dateiverwaltung. Wenn die Verbindung zu deinem Dropbox-Konto authentifiziert ist, wird ein spezieller Ordner (b.tree - Beekeeping) in deinem Dropbox-Konto erstellt. Der Zugriff auf diesen Ordner ist dann für dich und **alle deine Benutzer auf demselben Imkereibetrieb** verfügbar. Um den Zugriff zu entfernen, kannst du die entsprechende Schaltfläche auf der Einstellungsseite verwenden oder [dropbox.com/account/connected_apps](https://www.dropbox.com/account/connected_apps) besuchen.

Nachdem du dein Dropbox-Konto verbunden hast, kannst du deine Dateien und Ordner auf der Einstellungsseite [/setting/dropbox](https://app.btree.at/setting/dropbox) verwalten. Um auf den Dropbox-Ordner zuzugreifen oder neue Bilder und Dateien hochzuladen, wenn du neue Aufgaben erstellst, aktiviere die Schaltfläche "Link" in den Feldeinstellungen [/setting/field](https://app.btree.at/setting/field). Beim Speichern eines Bildes oder einer Datei zu deiner Aufgabe wird eine ID mitgespeichert und du kannst darauf klicken, um den Inhalt in einem kleinen Fenster anzuzeigen.

### Kalender

Auf der Hauptseite soll ein Kalender einen guten Überblick über die aktuellen, vergangenen und zukünftigen Aufgaben geben [/](https://app.btree.at/). Hier kannst du auch Aufgaben per Drag and Drop verschieben, wenn du schnell ein Datum ändern willst, oder eine Aufgabe anklicken, um mehr Details zu erfahren. Bei Königinnenzucht-Serien bekommst du alle Schritte entsprechend der Aufzuchtmethode aufgelistet. ToDo's sind im Kalender auch sichtbar und du kannst neue erstellen, indem du auf das gleiche Datum doppelklickst.

Wenn du eine eigene Bienenstockwaage hast, die mit unserer API verbunden ist, wird der tägliche Gewichtsdurchschnitt in einem separaten Kalender [/calendar_scale](https://app.btree.at/calendar_scale) angezeigt.

### Suche / Schnellzugriff

Wenn du in der oberen Menüleiste auf das Lupensymbol klickst, kannst du schnell auf einzelne Bienenstöcke oder Stände zugreifen. Du wirst auf die jeweilige Detailübersicht des Bienenstandes oder Bienenstocks weitergeleitet, was ein guter Ausgangspunkt für die Suche nach schnellen Informationen ist.

### Zuchtserien

Da Zuchtmethoden sich unterscheiden zwischen Imkereibetrieben, bietet b.tree die Möglichkeit, diese selber zu definieren. Das Anlegen dieser Zuchtmethoden [/setting/rearing](https://app.btree.at/setting/rearing) erfordert etwas Zeit und ist in diesem Video erklärt: [b.tree - Tutorial - Zuchtmethode und Zuchtserie - Deutsch](https://www.btree.tv/de/watch/breeding/). Ein Hinweis dazu: Die Wartezeit bei den Zuchtschritten bezieht sich immer auf die Zeit in Stunden zu dem vorhergegangenen Schritt.

Nachdem die Zuchtmethoden definiert sind, können Zuchtserien einfach über folgendes Formular hinzugefügt werden: [/new/rearing](https://app.btree.at/new/rearing). Diese Zuchtserien werden auch im Kalender dargestellt und können als iCal abonniert werden. Achtung: Ein Löschen von Zuchtserien oder Methoden, die bereits verwendet wurden, führt zur unwiderruflichen Löschung. Sie können nicht wiederhergestellt werden.

### QR-Code-Scanner

Mit dem QR-Code-Scanner kannst du schnell Bienenstock- oder Bienenstand-QR-Codes scannen, um direkt zu deren Detailseiten zu navigieren. Die Scanner-Schaltfläche ist standardmäßig ausgeblendet und kann pro Gerät in den lokalen Geräteeinstellungen aktiviert werden [/setting/field/localSettings](https://app.btree.at/setting/field/localSettings).

### Spracherkennung

Dieses Feature funktioniert noch nicht in allen Browsern, bisher funktioniert es nur mit Chrome und Microsoft Edge. Die Spracherkennungs-Schaltfläche ist standardmäßig ausgeblendet und kann pro Gerät in den lokalen Geräteeinstellungen aktiviert werden [/setting/field/localSettings](https://app.btree.at/setting/field/localSettings). Die Spracherkennung soll dir helfen, schneller und einfacher mit der App zu arbeiten. Folgende Befehle sind integriert:

- Dashboard, Kalender: Weiterleitung zur Startseite mit Kalender
- Fütterung: Weiterleitung zum Quicktool mit Fütterung als Aufgabe ausgewählt
- Behandlung: Weiterleitung zum Quicktool mit Behandlung als Aufgabe ausgewählt
- Ernte: Weiterleitung zum Quicktool mit Ernte als Aufgabe ausgewählt
- Kontrollieren: Weiterleitung zum Quicktool mit Kontrolle als Aufgabe ausgewählt
- Name des Bienenstandes oder Bienenstocks: Weiterleitung zur Übersichtsseite des Bienenstandes oder des Bienenstocks

### Mehrere Benutzer / Imker

Wenn du einen weiteren Benutzer zu deinem Imkereibetrieb hinzufügen möchtest, besuche die Seite mit den Unternehmenseinstellungen [/setting/company](https://app.btree.at/setting/company). Wenn die E-Mail-Adresse noch nicht bei uns registriert ist, wird automatisch ein Konto erstellt und eine E-Mail an den neuen Benutzer geschickt, in der er aufgefordert wird, sein Passwort zurückzusetzen, da wir keine Passwörter per E-Mail verschicken.

Eine Videoerklärung zum Thema Imkereien und User findest du auf b.tree Tutorials: [b.tree - Tutorial - Betriebe und Benutzer Management - Deutsch](https://www.btree.tv/de/watch/business-user-management/)

Für Benutzer gibt es drei Ränge, die durch Klicken auf das Rangsymbol geändert werden können. Um Benutzer zu entfernen, klicke auf das Symbol "Benutzer entfernen".

- Admin: Kann alles hinzufügen, ändern und löschen und Benutzer hinzufügen oder entfernen.
- User: Kann keine Bienenstöcke löschen, den API-Zugang nicht ändern und die Benutzer nicht ändern.
- Read-Only: Dieser Benutzer kann sich die Daten nur ansehen, aber keine Änderungen vornehmen.

Hinweis: Die Premium-Mitgliedschaft gilt pro Unternehmen und nicht pro Benutzer, d. h. du musst nur einmal Premium bezahlen, egal wie viele Benutzer in deiner Imkerei aktiv sind.

### WizBee KI-Assistent (Premium)

WizBee [/wizbee](https://app.btree.at/wizbee) ist ein KI-gestützter Imkerei-Assistent für Premium-Mitglieder. Stelle Imkerei-Fragen in natürlicher Sprache. WizBee arbeitet auch mit deinen eigenen Daten: Fütterungen, Behandlungen, Ernten, Kontrollen, Aufgaben und Lagerbestand anlegen und ändern, Statistiken anzeigen und das Wetter am Bienenstand abfragen. Du kannst tippen oder die Spracheingabe verwenden. Jede Anfrage zählt zum monatlichen Nutzungsbudget. WizBee ist über das Hauptnavigationsmenü erreichbar.

### Hilfsprogramme

Zwei kleine Hilfswerkzeuge sind über die Navigation verfügbar:

- **Zuckerwasserrechner** [/sugar_water_calculator](https://app.btree.at/sugar_water_calculator) — Gib ein Zielvolumen und eine Zuckerkonzentration ein, um die genauen Mengen an Zucker und Wasser für die Futtermischung zu erhalten.
- **Bienenentwicklung** [/lifecycle](https://app.btree.at/lifecycle) — Referenztabelle mit den Entwicklungsdauern (Ei, offene Brut, verdeckelte Brut, Adulte) für Arbeiterin, Drohne und Königin. Nützlich bei der Planung von Behandlungen oder Zuchtschritten.

### Königinnen-Stammbaum

Wenn Königinnen über das Feld „Mutter“ verknüpft sind, erstellt b.tree eine Zuchtabstammung. Du kannst die vollständige Ahnenlinie als Stammbaum in der Königinnentabelle [/table/queen](https://app.btree.at/table/queen) einsehen. Dies ist besonders für Königinnenzüchter hilfreich, die genetische Linien verfolgen.

### Öffentliche Karten

Folgende Karten sind ohne Login öffentlich zugänglich:

- **Vespa velutina (Asiatische Hornisse)** [/pub/vespa-velutina/map](https://app.btree.at/pub/vespa-velutina/map) — Gemeinschaftlich gepflegte Sichtungskarte der Asiatischen Hornisse, einem invasiven Räuber von Honigbienen.
- **Aethina tumida (Kleiner Beutenkäfer)** [/pub/aethina-tumida/map](https://app.btree.at/pub/aethina-tumida/map) — Sichtungskarte des Kleinen Beutenkäfers.
- **Amerikanische Faulbrut / AFB (Österreich)** — Karte bekannter AFB-Ausbrüche in Österreich, innerhalb der App abrufbar, um die Ausbreitung der Krankheit zu beobachten.

### Soziale Anmeldung

Neben E-Mail und Passwort unterstützt b.tree die Anmeldung mit **Google**- und **Apple**-Konten. Verwende die entsprechenden Schaltflächen auf der Anmeldeseite [/visitor/login](https://app.btree.at/visitor/login). Wenn die E-Mail-Adresse des sozialen Anbieters mit einem bestehenden b.tree-Konto übereinstimmt, werden die Konten automatisch verknüpft.
