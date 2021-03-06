## Aufgaben zum Kickoff-Workshop
### Grundlegende Informationen
Node.js bietet hat das Modul _fs_ integriert, welches den Zugriff auf Dateien erm�glicht.

```javascript
var fs = require('fs');
```

Die Funktion `fs.readFile(__dirname+"/dateiname", function(err, data) { ... });` erm�glicht 
das asynchrone Auslesen von Dateien.

Die Variable `__dirname` enth�lt den Namen des Verzeichnisses, in dem das aktuelle Programm liegt.
Er wird in diesem Beispiel vor den Pfad angeh�ngt, um eine vollst�ndige Pfadangabe zu vermeiden.
Der Parameter `data` ist normalerweise ein Buffer mit Bin�rdaten, der mittels `data.toString()` 
in einen String umgewandelt werden kann.

Die Funktion `fs.writeFile(__dirname+"dateiname", data, function(err) { ... });` erm�glicht 
das asynchrone Schreiben von Dateien.

Weitere Informationen zum fs-Modul von node.js finden sie in der [node.js-Dokumentation]
(https://nodejs.org/api/fs.html).

Mittels `JSON.stringify( ... )` und `JSON.parse( ... )` k�nnen Objekte in einen JSON-String 
umgewandelt werden und umgekehrt.


**Wichtig: Aus ihrer Git-Historie sollte hervorgehen, dass die Aufgaben in der hier vorgegebenen 
Reihenfolge gel�st wurden. Erstellen sie also pro Aufgabe mindestens einen seperaten Commit.**

### Aufgabe 1
Schreiben sie ein Programm in Node.js, das die Datei [wolkenkratzer.json](wolkenkratzer.json) 
ausliest und die darin enthaltene Liste von Wolkenkratzern in folgender Form auf der Konsole ausgibt:

```
Name: Burj Khalifa
Stadt: Dubai
H�he: 828m
--------------------
Name: Shanghai Tower
Stadt: Shanghai
H�he: 632m
--------------------
...
```

Verwenden sie zum Auslesen der Datei die oben genannten **asynchronen** Funktionen des fs-Moduls.

### Aufgabe 2
Erweitern sie das Programm aus Aufgabe 2 so, dass die Namen, St�dte und H�henangaben jeweils **farbig** 
ausgegeben werden. Hierzu k�nnen sie das Modul ```chalk``` verwenden, welches auch im Workshop 
vorgestellt wurde. Mehr zum Chalk-Modul finden sie [hier](https://www.npmjs.com/package/chalk). 
Erstellen zu ihrem Programm auch eine ```package.json```-Datei, welche unter anderem die 
Modulabh�ngigkeiten definiert. 
Weitere Informationen zur ```package.json```-Datei finden sie in der [NPM-Dokumentation]
(https://docs.npmjs.com/files/package.json).

### Aufgabe 3
Erweitern sie das Programm aus Aufgabe 2 so, dass es die Wolkenkratzer der H�he nach sortiert, 
die sortierte Liste in der neuen Datei `wolkenkratzer_sortiert.json` speichert und sie erst 
danach auf der Konsole ausgibt.

Informationen zum sortieren von Arrays in Javascript finden sie beispielsweise [hier]
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).