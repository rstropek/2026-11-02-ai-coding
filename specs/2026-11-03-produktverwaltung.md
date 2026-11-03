# Produktverwaltung

In der nächsten Iteration möchten wir eine Stammdatenverwaltung implementieren. Wir wollen eine Liste an Produkten verwalten. Zu jedem Produkt gibt es freischaltbare Features. Bei jedem Feature kann eine Liste von Zusatzinformationen hinterlegt werden, beispielsweise, dass für die Freischaltung eines Features zusätzlich eine Zahleninformation eingegeben werden muss oder ein Datumswert, beispielsweise „gültig bis“. Wir fokussieren uns im Moment auf drei Datentypen: Text, Ganzzahl und Datum. 

Felder von Produkten:
* ID (kurzer Textcode, 20 Zeichen)
* Beschreibung (bis zu 1000 Zeichen)
* Aktuell verfügbar (boolean)
* Preis (Zahlenwert)
* Liste an externen Links (URLs, die mit https:// beginnen)
* Tag-Liste

Felder je Feature:
* ID (kurzer Textcode, 20 Zeichen)
* Beschreibung (bis zu 1000 Zeichen)
* Liste an Zusatzinformationen, die bei einer Freischaltung eingegeben werden müssen:
  * Feldnamen für die Zusatzinformationen
  * Feld-Datentyp (Ganzzahl, Datum oder Text)

Wir verwalten die Stammdaten im Dateisystem in Form von JSON-Dateien. In der Praxis wird es für den Docker Container einen Volume Mount geben, über den ein Host-Dateisystem (oder in Azure ein Azure File Share) gemounted wird. Dadurch gehen keine Daten verloren wenn der Container beendet wird.

In diesem Repository ist ein Ordner mit sinnvollen Testdaten zu erstellen, die wir zu Testzwecken mounten können:
* 5 Produkte
* Je Produkt zwischen 1 und 5 Features
* Mindestens ein Feature hat keine Zusatzinformationen
* All Feldtypen kommen irgendwo vor
* Mindestens ein Feature hat alle Feldtypen vereint

Wir brauchen Funktionen für die Produktverwaltung. Aktuell wissen wir noch nicht, was der beste Weg ist. Triff Annahmen auf Basis folgender Überlegungen:
* Produkte können nur inkl. aller Features angelegt und geändert werden. Gesonderte Schreiboperationen auf Feature-Ebene sind nicht gefordert.
* Wir können nur alle Produkte lesen, ohne Filtermöglichkeiten (kommt später). Dabei werden die gesamten Produktdaten inkl. Features zurückgeliefert.
* Jedes Produkt muss im Dateisystem einer Datei entsprechend, nicht alle Produkte gemeinsam in ein File.
* Die Schemaprüfung muss bei jedem lesenden Zugriff mit ZOD erfolgen.
