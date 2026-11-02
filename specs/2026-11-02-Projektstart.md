# Lizenzverwaltung

## Projektinhalt

Wir verkaufen verschiedene Produkte, bei denen gewisse Funktionen durch das Kaufen eines Lizenzschlüssels freigeschaltet werden können. Das bedeutet, dass die Produkte gewisse Hardware eingabaut haben. Der Kunde muss die Funktion aber softwareseitig aktivieren und das geschieht mit den gekaufen Lizenzschlüsseln.

Wir haben eine Benutzerverwaltung, in der wir zwischen Kunden und Administator:innen unterscheiden. Admins sind Mitarbeiter:innen unserer Firma. Kunden kaufen unsere Produkte und schalten Funktionen frei.

## Technologie

* Node.js mit npm
* Next.js
* Typescript mit strict type checking
* Biome für statische Codeanalyse und Code Formatting
* Vitest und Playwright für Tests
* Da es sich um einen Prototyp handelt, werden alle Daten nicht in einer Datenbank, sondern im Dateisystem (sinnvolle Ordnerstruktur, JSON-Dateien) gespeichert
* Die Anwendung muss in Form eines Dockerimage verteilt werden können

Wir verwenden die aktuellsten Versionen aller referenzierten Abhängigkeiten. Prereleases setzen wir nur ein, wenn es für eine Abhängigkeit keine passende Release-Version gibt.

## Ordnerstruktur

* Die Next.js-Anwendung wird direkt im Wurzelverzeichnis des Repositories angelegt
* Testdateien sind im gleichen Ordner wie der zu testende Code. Ausnahme sind end-to-end-Tests. Diese sollen in einem eigenen `e2e` Ordner zusammengefasst werden

## Qualitätssicherungsrichtlinie

* Gesamter Code ist am Ende einer Coding-Session Warning Free und Error Free.
* Am Ende einer Coding-Session sind alle Tests grün.
* Wir bevorzugen Unit Tests über Komponententests über end-to-end-Tests. Alle Testkategorien sind möglich. Wenn möglich sollten aber vor allem kleine Einheiten getestet werden.
* Jede Änderung, die eingecheckt wird, muss auf ein zughöriges Issue verweisen. Im Issue muss dokumentiert sein, worum es bei der Änderung funktional geht und idealerweise auch warum sie gemacht wird.
* Die Sprache im Code (z.B. Kommentare, Funktionsnamen) und Sprache für alle technischen Dokumente ist Englisch. Die Benutzeroberfläche ist im Moment Deutsch und wird möglicherweise später mehrsprachig umgebaut (out-of-scope für das aktuelle Projekt).
* Verwende vorhandene, deterministische Werkzeuge zum Anlegen und Verwaltung von Projektstrukturen. Projektkonfigurationsdateien wie package.json, etc. sollen wenn möglich nicht manuell geändert oder erstellt werden. Beispiel: `npm install somedepency` statt manuelles Eintragen dieser Abhängigkeit in `package.json`.
* Docker: Übliche good Practices für Next.js Images

## Iterationen

### Erste Iteration

In der ersten Iteration wollen wir das Skelett unserer Anwendung erstellen. Folgende Teile müssen abgedeckt werden:

* Neue Next.js-Anwendung mit den oben genannten Eigenschaften
* Um die Projektkonfiguration zu testen, füge eine simple Logik (z.B. addieren von zwei Zahlen) mit UI-Komponente und Tests auf allen Ebenen (Unit, Component, e2e Tests) hinzu
* README.md wird geschrieben. Zielgruppe: Menschen, die rasch einen Überblick über den Inhalt des Projekts gewinnen wollen.
* AGENTS.md wird geschrieben. Zielgruppe: Agents, die an diesem Projekt arbeiten. Halte dich bewusst kurz. Alles, was ein Agent durch Lesen von einer Hand voll Codedateien herausfinden kann, gehört nicht in AGENTS.md. Weiters gehört in AGENTS.md:
  * Liste aller wichtigen Kommandos zum Umgang mit dem Projekt wie z.B. Build, Tests ausführen, Linting, etc.
  * Es muss ein Hinweis enthalten sein, dass zukünftige AGENTS die AGENTS.md-Datei nach den hier festgelegten Regeln automatisch warten.
* Diese erste Interation ist erfolgreich beendet, wenn alle folgenden Punkte erledigt sind:
  * Alle Tests sind grün. Auf jeder Ebene wurde bewusst ein Fehler eingebaut, der zu einem Fehlschlagen des entsprechenden Tests geführt hat.
  * Warning- und Error free. Es wurde ein "Code Smell" eingebaut, der durch Biome entdeckt wurde. Es wurde ein Typ-Fehler eingebaut, der durch TypeScript entdeckt wurde.
  * Das Dockerfile wurde geschrieben, kann korrekt gebaut werden, ein Container kann darauf aufbauen erfolgreich gestartet werden und ein curl HTTP GET an den Endpunkt im Container liefert Erfolg.
  * Am Ende wenn alle anderen Prüfungen erfolgreich waren, starte einen eigenen Subagenten, der nochmals mit frischem Blick alle Festlegungen aus diesem Dokument gegen den geschriebenen Code prüft.

## Zweite Iteration

* Anlegen der für die Anwendung notwendigen Ressourcen in der verbundenen (Azure CLI) Azure Subscription:
  * Resource Group `rg-licensemanagement`
  * Separate Azure App Service Linux for containers (smallest Pro SKU, P0something)
  * Azure App Service für Next.js app
* QA-Schritte bei Commit auf Feature Branch
* QA-Schritte bei Merge auf Main
* CD (wenn QA grün) in GitHub Container Registry
* CD (wenn Image in Container Registry) in Microsoft Azure
* Erhöhen der Patch-Version in package.json bei jedem Feature Branch, Patch-Version muss in health Endpoint veröffentlicht werden, prüfbar, ob neue Version online
