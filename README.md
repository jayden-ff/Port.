# Port.

Ein Portfolio-Dashboard mit manuell erfassten Aktien, ETFs und Kryptowährungen, echten Kursen, relevanten RSS-Nachrichten und einem Risikoblick für isolierte, lineare Hebelpositionen. React/Vite, cremefarbene Oberfläche, grüne Akzente und Animationen mit Unterstützung für reduzierte Bewegung.

## Was funktioniert

- Leerer Start ohne Demo-Positionen oder erfundene Nachrichten. Alte Demo-Portfolios werden entfernt; tatsächlich importierte Altbestände werden übernommen.
- Positionen hinzufügen, bearbeiten, löschen und per CSV importieren. Die Depotnamen Trade Republic, Robinhood, Revolut und Fomo kennzeichnen die Herkunft; sie sind keine automatischen Brokerverbindungen.
- Aktien/ETFs über Yahoo Finance, Krypto über CoinGecko; Coinbase ist für unterstützte Coins ein Ersatzanbieter. Kurswährung und tatsächliche Kurszeit bleiben sichtbar. Frankfurter/EZB liefert tägliche Referenzkurse zur EUR-Umrechnung.
- Ein gemeinsames Backend für alle Besucher. Keine persönlichen Markt-API-Schlüssel und keine Zugangsdaten im Frontend.
- Passende Originalmeldungen aus Google News RSS mit Quelle, Veröffentlichungszeit, Filtern, Suche und lokaler Merkliste. Zuordnung nach Unternehmen, Coin-Namen, Kürzeln oder Makrothemen; Relevanz nach Brutto-Exposure.
- Spot sowie isolierte lineare Long-/Short-Positionen: Einstieg, Währung, Margin, Hebel und optional ein eingetragener Liquidationspreis. Stattdessen ist eine ausdrücklich gekennzeichnete Schätzung möglich.
- Positionen, Merkliste und Kurscache bleiben im Browser. Nur Asset-Kürzel, Coin-IDs und Namen werden an das Backend bzw. Anbieter gesendet; Stückzahlen, Margin und Einstieg werden lokal verarbeitet.

Es gibt keinen kostenlosen Dienst mit garantierten Echtzeitkursen für sämtliche Aktien, Börsen und Kryptowährungen. Die öffentliche Yahoo-Schnittstelle ist inoffiziell und kann sich ändern oder Abfragen ablehnen. CoinGecko und Coinbase können Limits setzen. RSS-Indexierung kann verzögert sein. Die Seite fragt Kurse und Nachrichten jede Minute ab; das ist keine garantierte Echtzeit. Fehlende Kurse werden nicht durch Einstiegspreise ersetzt, Teilbewertungen werden gekennzeichnet und alte Abrufe bleiben erkennbar. Marktquoten sind keine ausführbaren Brokerkurse oder Liquidations-Markpreise.

## Entwicklung

Node.js >=22.12, npm:

```sh
npm ci
npm test
npm run dev
```

Vite auf Port 5173 liefert das Frontend und die gemeinsame API unter `/api`. `npm run build` und `npm start` starten den Produktionsserver auf Port 3000 (`PORT` optional). Serverabrufe nutzen `undici` mit `EnvHttpProxyAgent`, also auch eine konfigurierte HTTPS-Proxy-Umgebung mit bestehender CA-Verifikation.

```sh
curl -fsS http://127.0.0.1:5173/api/health
curl -fsS 'http://127.0.0.1:5173/api/quotes?assets=stock:AAPL,stock:SAP.DE,crypto:bitcoin'
curl -fsS 'http://127.0.0.1:5173/api/news?symbols=AAPL,BTC'
```

`npm test` führt deterministische Tests der Berechnungen, CSV-Verarbeitung, RSS-Normalisierung, Cache-Verwendung und API-Grenzen aus. Mit Python Playwright und Chromium sind zusätzlich verfügbar:

```sh
python tests/browser_smoke.py
python tests/live_backend.py
```

Der erste Browsercheck nutzt kontrollierte API-Antworten und prüft Bedienung, Long/Short, Fehlerfälle, lokale Speicherung, mobile Navigation und Layouts. Der zweite prüft echte Anbieterabrufe und die Darstellung ohne Browser-Fixtures. Die externen Quellen müssen erreichbar sein. `PORT_BASE_URL` und `CHROMIUM_PATH` können überschrieben werden. Zertifikatsprüfung wird nicht deaktiviert.

## Gemeinsames Backend auf Cloudflare Workers

GitHub Pages kann nur statische Dateien ausliefern. `worker/index.js` enthält deshalb einen separaten, kostenlosen Worker für die Datenabrufe. Er speichert keine Nutzerportfolios und benötigt für die verwendeten Marktquellen keinen Markt-API-Schlüssel.

Für das Deployment werden ein Cloudflare-Konto, dessen Account-ID und ein API-Token benötigt. Der Token sollte auf dieses Konto begrenzt sein und **Account / Workers Scripts / Edit** sowie **Account / Account Settings / Read** erlauben. Zugangsdaten sicher in den Umgebungseinstellungen oder einem Secret Store setzen; niemals in Chat, Git, `.env.example`, `public/backend.json` oder `VITE_*` eintragen.

```sh
npm run build:api
npm run deploy:api
```

Das Deployment liest `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID`. `build:api` erstellt nur das Worker-Bundle, ohne etwas zu veröffentlichen. Die CLI verwendet einen lokalen, ignorierten Konfigurationsordner `.wrangler/`, damit sie in eingeschränkten Cloud-Umgebungen funktioniert. Cloudflare nennt beim Deployment die tatsächliche `https://port-market-api.<subdomain>.workers.dev`-Adresse. Prüfe dort `/health`, `/quotes` und `/news`, bevor die Seite diese Adresse verwendet. Ein lokaler Test beweist nicht, dass die Anbieter aus Cloudflares Netzwerk erreichbar sind.

`wrangler.jsonc` erlaubt CORS für `https://jayden-ff.github.io`. Bei einem anderen Frontend-Host `ALLOWED_ORIGINS` anpassen. CORS ist kein Zugangsschutz; die Read-only-API ist öffentlich. Cache und Abfragegrößen begrenzen Anbieterlast. Ein zusätzliches Limit von 120 Abrufen/IP/Minute gilt je laufender Worker-Isolate; es ist kein globaler Quotaschutz. Cloudflare-Free-Kontingente und Anbieterlimits gelten weiterhin. Keine automatischen Wechsel auf kostenpflichtige Tarife.

API-Endpunkte:

| Endpunkt | Zweck |
| --- | --- |
| `/health` | Dienstkennung und Konfiguration |
| `/quotes?assets=stock:AAPL,crypto:bitcoin` | maximal 30 eindeutige Assets, Kurse und Fehler je Asset |
| `/search?type=stock&q=Apple` | Aktie/ETF oder `type=crypto` suchen |
| `/news?symbols=AAPL,BTC&names={...}` | maximal 15 Kürzel mit optionalen Namen; echte RSS-Meldungen |
| `/fx` | EZB-Referenzkurse mit Referenzdatum |

Große Portfolios werden im Client in begrenzten Gruppen abgefragt. Erfolgreiche Ergebnisse bleiben bei Teilfehlern erhalten. Der Server akzeptiert nur feste Anbieterziele und validierte Suchparameter; er ist kein beliebiger URL-Proxy.

## GitHub Pages

Öffentliche Seite: <https://jayden-ff.github.io/Port./>

Die gemeinsame Backend-Adresse kann vor dem Build als öffentliche `VITE_API_BASE_URL` gesetzt werden. Alternativ in `public/backend.json` `apiBaseUrl` auf die echte HTTPS-Adresse setzen. Diese Adresse ist öffentlich und enthält keine Secrets. Besucher verwenden automatisch den gemeinsamen Dienst. Ein eigener kompatibler Dienst lässt sich optional unter Einstellungen verbinden.

```sh
npm run deploy:pages
```

Das Skript erstellt den Build mit Basis `/Port./` und aktualisiert `gh-pages`. Es erhält CNAME, verwendet keinen Force-Push und überschreibt nur einen Branch, der durch `.port-pages` als eigener Build erkennbar ist. In GitHub Settings → Pages muss `gh-pages / (root)` als Quelle gewählt sein. `main` enthält den Quellcode; `gh-pages` enthält die statischen Dateien.

**Aktueller Zustand:** Das Backend ist vorbereitet und lokal mit echten Daten geprüft, aber ohne Cloudflare-Zugangsdaten noch nicht öffentlich deployt. `public/backend.json` enthält deshalb `null`. Auf Pages funktionieren manuelle Positionen und Schlüssel-freie Kryptokurse bereits; Aktienkurse und News benötigen die einmalige Backend-Veröffentlichung. Dieser Zustand wird im Produkt sichtbar dargestellt.

## Positionen und CSV

`public/portfolio-beispiel.csv` ist ausschließlich eine herunterladbare Formatvorlage und wird niemals automatisch als Portfolio geladen. Ersetze die Beispielzeilen durch deine eigenen Trades.

Pflichtfelder für Spot: `symbol,quantity,entry_price` (`price` wird ebenfalls als Einstieg akzeptiert). Optional: `currency` (Standard EUR), `asset_type` (`stock` oder `crypto`), `coin_id`. Für Margin: `kind=margin,direction=long|short,margin,leverage`, optional `liquidation_price` oder `liquidation_mode=estimate,maintenance_margin` (Prozent). Margin und Einstieg stehen in der ausgewählten Positionswährung. Stückzahl wird bei linearen Margin-Positionen aus `margin × leverage / entry_price` abgeleitet.

Mehrere Spot-Zeilen desselben Assets in gleicher Währung werden mit gewichtetem Einstieg zusammengefasst. Margin-Trades bleiben getrennt. Ein CSV-Import ersetzt alle lokal erfassten Positionen der ausgewählten Depotquelle. Ungültige Dateien ändern nichts.

## Berechnung und Liquidation

Für Stückzahl `q`, Einstieg `E`, Referenzkurs `P`, isolierte Margin `M` und Richtung `d` (+1 Long, −1 Short):

- Unrealisierter Gewinn: `d × q × (P − E)`.
- Spot-Wert: `q × P`; Margin-Eigenkapital: `M + unrealisierter Gewinn`.
- Exposure: `q × P`. Es wird separat vom Eigenkapital angezeigt.
- Modellschwelle mit konstantem Maintenance-Satz `m`: Long `E × (1 − 1/L) / (1 − m)`; Short `E × (1 + 1/L) / (1 + m)`.
- Abstand: Long `(P − Schwelle) / P`; Short `(Schwelle − P) / P`.

Ein eingetragener Anbieterpreis hat Vorrang. Ohne Kurs oder manuelle Schwelle wird kein Abstand erfunden. Unter 5% Abstand erscheint ein Hinweis; bei berührter Schwelle muss der Anbieterstatus überprüft werden. Bereits liquidierte Positionen müssen manuell angepasst werden.

Das Modell umfasst keine Cross-Margin, inversen Kontrakte, Optionen, Knock-outs, Finanzierung, Funding, Zinsen, Gebühren oder gestaffelte Maintenance-Sätze. Anbieter nutzen eigene Markpreise und Regeln. Hinweise in der geöffneten Seite sind keine Push-Benachrichtigungen oder Brokerüberwachung. Für den Gewinn werden keine Gebühren oder Finanzierungskosten behauptet; EUR-Werte verwenden die tägliche FX-Referenz, keine historischen Einstieg-Wechselkurse.
