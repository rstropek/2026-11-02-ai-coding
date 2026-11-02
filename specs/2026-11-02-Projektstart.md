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

Wir verwenden die aktuellsten Versionen aller referenzierten Abhängigkeiten. Prereleases setzen wir nur ein, wenn es für eine Abhängigkeit keine passende Release-Version gibt.

## Qualitätssicherungsrichtlinie

* Gesamter Code ist am Ende einer Coding-Session Warning Free und Error Free.
* Am Ende einer Coding-Session sind alle Tests grün.
* Wir bevorzugen Unit Tests über Komponententests über end-to-end-Tests. Alle Testkategorien sind möglich. Wenn möglich sollten aber vor allem kleine Einheiten getestet werden.
* Jede Änderung, die eingecheckt wird, muss auf ein zughöriges Issue verweisen. Im Issue muss dokumentiert sein, worum es bei der Änderung funktional geht und idealerweise auch warum sie gemacht wird.
* Die Sprache im Code (z.B. Kommentare, Funktionsnamen) und Sprache für alle technischen Dokumente ist Englisch. Die Benutzeroberfläche ist im Moment Deutsch und wird möglicherweise später mehrsprachig umgebaut (out-of-scope für das aktuelle Projekt).
