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

