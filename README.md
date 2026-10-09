# Port.

Ein minimalistisches Portfolio-Dashboard mit persönlichen Nachrichten, CSV-Import, manuellen Positionen und lokal gespeicherter Merkliste. React, Vite, Framer Motion und ein kleiner Node-RSS-Endpunkt. Die Website ist auf Deutsch und funktioniert auf Desktop und Mobilgeräten.

## Entwicklung

Node.js 22.12+ (hier getestet mit 24.19.0) und npm.

```sh
cd /workspace/Port.
npm ci
npm run dev
```

Der Entwicklungsserver läuft auf Port 5173 und bedient auch `/api/news`. Fonts werden lokal ausgeliefert. Kein Login und keine Zugangsdaten erforderlich.

```sh
npm test
npm run build
npm start
```

Der Produktionsserver bedient `dist/` und die Nachrichten-API auf Port 3000; `PORT` kann überschrieben werden. Alternativ startet `npm run preview` auf Port 4173, ebenfalls mit der Nachrichten-API. Ein reiner statischer Host benötigt einen gesonderten API-Server bzw. eine Anpassung des API-Pfads.

## Portfolioimport

Im Dialog „Portfolio hinzufügen“ die Quelle wählen: Trade Republic, Robinhood, Revolut, Fomo oder eine andere Quelle. Diese Angaben sind lokale Quellennamen; es gibt noch keine OAuth- oder direkten Brokeranbindungen.

Ein kompatibler Export enthält `symbol,quantity,price` oder `ticker,anzahl,kurs`. Komma oder Semikolon als Trennzeichen; deutsche Dezimalwerte müssen bei Kommatrennung in Anführungszeichen stehen. Alle Kurse in EUR. Native Brokerexporte müssen bei abweichenden Formaten zunächst in dieses Schema gebracht werden. Eine Beispieldatei liegt in `public/portfolio-beispiel.csv` und ist im Importdialog downloadbar.

Beim ersten Import verschwinden die Demopositionen. Weitere CSV-Importe ersetzen nur dieselbe Quelle. Doppelte Kürzel innerhalb einer Quelle werden mit gewichtetem Kurs zusammengeführt. Manuelle Eingaben ergänzen die Quelle. Kurse sind Werte aus dem Import, keine aktuellen Marktpreise. Importierte Portfolios zeigen daher eine Verteilung statt eines erfundenen historischen Verlaufs.

Positionen, Merkliste und der lokale Feed-Hinweis werden in `localStorage` gespeichert. Es gibt noch keine Konten, geräteübergreifende Synchronisation, automatischen Depotabgleich, Push-Nachrichten oder Orderausführung.

## Nachrichten

„Live abrufen“ aktiviert `/api/news?symbols=NVDA,AAPL`. Der Server fragt Google News RSS über verifiziertes HTTPS ab, berücksichtigt die Proxyvariablen der Umgebung und hält Ergebnisse maximal 55 Sekunden im Cache. Der Browser fragt jede Minute nach. Die Abfrage umfasst die ersten 15 eindeutigen Kürzel des Portfolios und die letzten zwei Tage. Eine Abfrage pro Minute garantiert keine Echtzeit: Aktualität und Verzögerung hängen vom RSS-Index ab.

Benötigte Netzwerkfreigabe: **news.google.com**. Ohne diese Freigabe zeigt die Oberfläche einen Verbindungsfehler. Es werden keine fiktiven Meldungen als aktuelle Nachrichten ausgegeben. Die Demomeldungen sind ausdrücklich gekennzeichnet.

Unternehmen und Kürzel im Titel bestimmen die Zuordnung. Erkannte Zins-/Inflationsmeldungen werden dem gesamten Portfolio zugeordnet. Der Relevanzwert ist `55 + 44 × betroffener Portfolioanteil` (maximal 99), ein einfacher Orientierungswert. Es gibt keine Sentimentanalyse, Kursprognose oder Anlageempfehlung. Vollständige Artikel werden über die externe Quelle geöffnet.

Beim Live-Abruf werden Unternehmensnamen und Kürzel an den Nachrichtenindex übermittelt; Stückzahlen und Kurse bleiben im Browser. RSS wird vor dem Rendern auf Text, HTTPS-Links und gültige Datumsangaben normalisiert. Keine Secret-Werte erforderlich.

## Validierung

`npm test` prüft CSV-Formate, fehlerhafte Eingaben, Positionszusammenführung, Relevanzberechnung, RSS-Zuordnung und API-Eingabevalidierung. Der Build und Browserabläufe für Import, Merkliste, Filter, Modaldialoge und mobile Navigation werden zusätzlich geprüft.

Die Sites-App ist in dieser Sitzung nicht verfügbar; es wurde keine Website dort veröffentlicht. Für echte Direktanbindungen sind ein geeigneter Aggregator bzw. offizielle Anbieter-APIs, ein Backend, sichere Authentifizierung und ein Datenanbieter auszuwählen.

## GitHub Pages

```sh
npm run deploy:pages
```

Dieses Kommando erstellt den statischen Pages-Build mit dem Basispfad `/Port./` und lädt ausschließlich `dist/` in den Branch `gh-pages` hoch. Es verwendet vorhandene Git-Authentifizierung, erzwingt keinen Push und verändert den Checkout nicht. Ein bestehender `CNAME` bleibt erhalten. Fremde `gh-pages`-Inhalte ohne die Port.-Buildmarkierung werden nicht überschrieben. Nur bauen: `npm run build:pages`.

Im Repository unter **Settings → Pages** als Quelle **Deploy from a branch**, Branch **gh-pages**, Ordner **/ (root)** auswählen und speichern. Die Seite ist nach erfolgreicher Bereitstellung unter `https://jayden-ff.github.io/Port./` erreichbar. Die GitHub-Verbindung dieser Cloud-Sitzung kann Code und den Build hochladen, hat jedoch keine Pages-Verwaltungsrechte (die Pages-API meldet HTTP 403). Die Aktivierung muss deshalb in den GitHub-Einstellungen erfolgen. Für private Repositories muss der GitHub-Tarif Pages unterstützen; das Repository wird vom Veröffentlichungsskript nicht auf öffentlich umgestellt.

GitHub Pages führt den Node-Nachrichtenserver nicht aus. Dieser Build zeigt deshalb „Live-Feed: nicht verbunden“ und ruft keine fehlende `/api/news`-Route ab. CSV-Import, manuelle Positionen, Merkliste und Beispiele funktionieren. Der normale Node-/Vite-Build behält seine lokale Nachrichten-API.

Ein separat gehosteter Nachrichtendienst kann beim Pages-Build mit einer öffentlichen, nicht geheimen HTTPS-Endpunkt-URL konfiguriert werden:

```sh
VITE_NEWS_API_URL=https://feed.example.com/api/news npm run deploy:pages
```

Der Dienst benötigt das gleiche JSON-Format wie `server/news.js` und muss Browserzugriffe von `https://jayden-ff.github.io` per CORS erlauben. Die URL wird im öffentlichen Build sichtbar; keine Zugangsdaten hineinlegen. Ohne expliziten Dienst werden keine Firmennamen oder Kürzel an einen externen Feed geschickt.
