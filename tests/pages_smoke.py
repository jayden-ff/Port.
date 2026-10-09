"""Verify static Pages subpath and disconnected-backend behavior.
Crypto/FX fixtures test UI behavior; tests/live_backend.py verifies real providers.
"""
import json,os
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('PORT_PAGES_URL','http://127.0.0.1:4180/Port./')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');page.set_default_timeout(12000)
    errors=[];missing=[];bad_api=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    page.on('request',lambda r:bad_api.append(r.url) if '/api/news' in r.url or '/api/quotes' in r.url else None)
    page.route('https://api.frankfurter.dev/**',lambda r:r.fulfill(content_type='application/json',body=json.dumps({'base':'EUR','date':'2026-10-08','rates':{'USD':1.2}})))
    page.route('https://api.coingecko.com/api/v3/simple/price?**',lambda r:r.fulfill(content_type='application/json',body=json.dumps({'bitcoin':{'eur':90000,'last_updated_at':int(datetime.now(timezone.utc).timestamp())}})))
    page.route('https://api.coingecko.com/api/v3/search?**',lambda r:r.fulfill(content_type='application/json',body=json.dumps({'coins':[]})))
    page.goto(base,wait_until='networkidle');expect(page.locator('.first-position')).to_be_visible();expect(page.locator('.news-card')).to_have_count(0)
    page.get_by_role('button',name='Einstellungen',exact=True).click();expect(page.locator('.settings-grid')).to_contain_text('noch nicht veröffentlicht');assert page.locator('input[type=password]').count()==0
    page.locator('.main-nav button').filter(has_text='Übersicht').click();page.locator('.page-intro button').click();page.get_by_role('button',name='CSV importieren',exact=True).click()
    link=page.get_by_role('link',name='CSV-Vorlage');assert link.get_attribute('href')=='/Port./portfolio-beispiel.csv';assert page.request.get(base+'portfolio-beispiel.csv').status==200
    page.get_by_label('CSV-Datei auswählen').set_input_files({'name':'mine.csv','mimeType':'text/csv','buffer':b'symbol,quantity,price,currency\nAAPL,2,100,USD'})
    page.get_by_role('button',name='Positionen importieren',exact=True).click();expect(page.locator('.positions-table tbody tr')).to_have_count(1);expect(page.locator('.portfolio-value')).to_contain_text('—');expect(page.locator('.data-errors')).to_contain_text('noch nicht verbunden');expect(page.locator('.news-card')).to_have_count(0)
    page.locator('.page-intro button').click();page.get_by_role('button',name='Krypto',exact=True).click();page.get_by_role('button',name='BTC Bitcoin bitcoin',exact=False).click();page.get_by_label('Positionstyp').select_option('margin');page.get_by_label('Einstiegskurs',exact=True).fill('100000');page.get_by_label('Sicherheitsleistung',exact=True).fill('1000');page.get_by_label('Liquidationsmodell').select_option('estimate');expect(page.locator('.liquidation-preview')).to_contain_text('80.402,01');page.get_by_role('dialog').get_by_role('button',name='Position hinzufügen',exact=True).click()
    expect(page.locator('.portfolio-value')).to_contain_text('500,00');expect(page.locator('.portfolio-card-label')).to_contain_text('1/2 bewertet');expect(page.locator('.positions-table')).to_contain_text('Modellschätzung');expect(page.locator('.positions-table')).to_contain_text('CoinGecko');expect(page.locator('.news-card')).to_have_count(0)
    page.reload(wait_until='networkidle');expect(page.locator('.positions-table tbody tr')).to_have_count(2);expect(page.locator('.portfolio-value')).to_contain_text('500,00')
    page.set_viewport_size({'width':390,'height':844});assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.get_by_label('Navigation öffnen').click();page.get_by_role('button',name='Mein Portfolio',exact=True).click();expect(page.locator('.positions-table tbody tr')).to_have_count(2)
    assert not bad_api,bad_api;assert not missing,missing;assert not errors,errors
    print('PASS: static Pages subpath/assets, no demo, no personal API key, manual CSV, missing-stock state, keyless crypto fixture, estimated liquidation, reload and mobile; no nonexistent API requests')
    browser.close()
