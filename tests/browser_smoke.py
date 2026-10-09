"""UI checks use controlled API fixtures. tests/live_backend.py checks real providers separately."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('PORT_BASE_URL','http://127.0.0.1:5173')
artifacts=Path('/workspace/artifacts');artifacts.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page=context.new_page();page.set_default_timeout(12000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    quote_failure=[False]
    def api(route):
        from urllib.parse import urlparse,parse_qs
        url=urlparse(route.request.url);params=parse_qs(url.query)
        if url.path.endswith('/quotes'):
            if quote_failure[0]:route.fulfill(status=503,content_type='application/json',body=json.dumps({'error':'Test: Kurse nicht erreichbar.'}));return
            prices={'stock:AAPL':(120,'USD'),'crypto:bitcoin':(90000,'EUR')}
            quotes={key:{'price':prices[key][0],'currency':prices[key][1],'fetchedAt':'2026-10-09T18:00:00.000Z','marketTime':'2026-10-09T17:59:00.000Z','source':'UI-Testquelle'} for key in params.get('assets',[''])[0].split(',') if key in prices}
            payload={'quotes':quotes,'errors':{}}
        elif url.path.endswith('/fx'):payload={'rates':{'USD':1.2},'date':'2026-10-08','source':'Testquelle'}
        elif url.path.endswith('/news'):
            payload={'articles':[{'id':'test-news','source':'RSS-Testquelle','category':'Unternehmen','publishedAt':'2026-10-09T12:00:00.000Z','symbols':['AAPL'],'title':'Apple Unternehmensmeldung','summary':'Kontrollierte UI-Fixture.','body':'Kontrollierte Nachricht für den UI-Test.','url':'https://example.com/article','image':'news'}],'errors':[],'fetchedAt':'2026-10-09T18:00:00.000Z'}
        elif url.path.endswith('/search'):payload={'assets':[]}
        else:payload={'ok':True,'service':'Port. Market API'}
        route.fulfill(status=200,content_type='application/json',body=json.dumps(payload))
    page.route('**/api/**',api)
    def nav(name):page.locator('.main-nav button').filter(has_text=name).click()
    def open_form():page.locator('.page-intro button').click();expect(page.get_by_role('dialog')).to_be_visible()
    def save_form():page.get_by_role('dialog').get_by_role('button',name='Position hinzufügen',exact=True).click();expect(page.get_by_role('dialog')).to_have_count(0)
    page.goto(base,wait_until='networkidle');expect(page.locator('.first-position')).to_be_visible();expect(page.locator('.news-card')).to_have_count(0)
    assert page.evaluate('JSON.parse(localStorage.getItem("port:portfolio")).holdings.length')==0
    page.screenshot(path=str(artifacts/'port-empty.png'),full_page=True)
    open_form();page.get_by_role('button',name='AAPL Apple',exact=False).click();page.get_by_label('Einstiegskurs',exact=True).fill('100');page.get_by_label('Anzahl',exact=True).fill('2');save_form()
    expect(page.locator('.positions-table tbody tr')).to_have_count(1);expect(page.locator('.portfolio-value')).to_contain_text('200,00');expect(page.locator('.news-card')).to_have_count(1)
    print('PASS: empty start, manual stock, market currency conversion, actual-feed format')
    open_form();page.get_by_role('button',name='Krypto',exact=True).click();page.get_by_role('button',name='BTC Bitcoin bitcoin',exact=False).click();page.get_by_label('Positionstyp').select_option('margin');page.get_by_label('Einstiegskurs',exact=True).fill('100000');page.get_by_label('Sicherheitsleistung',exact=True).fill('1000');page.get_by_label('Hebel',exact=True).fill('5');page.get_by_label('Liquidationspreis',exact=True).fill('88000');save_form()
    expect(page.locator('.positions-table tbody tr')).to_have_count(2);expect(page.locator('.portfolio-value')).to_contain_text('700,00');expect(page.locator('.risk-focus')).to_contain_text('2,2%');expect(page.locator('.positions-table')).to_contain_text('88.000,00')
    page.get_by_label('BTC bearbeiten',exact=True).click();page.get_by_role('button',name='Short · fallende Kurse').click();page.get_by_label('Liquidationspreis',exact=True).fill('120000');page.get_by_role('button',name='Position speichern',exact=True).click();expect(page.locator('.portfolio-value')).to_contain_text('1.700,00');expect(page.locator('.positions-table')).to_contain_text('5× SHORT')
    page.reload(wait_until='networkidle');expect(page.locator('.positions-table tbody tr')).to_have_count(2);expect(page.locator('.portfolio-value')).to_contain_text('1.700,00')
    print('PASS: leveraged long/short, collateral-based equity, manual liquidation distance, edit and reload')
    page.locator('.card-save').first.click();nav('Merkliste');expect(page.locator('.news-card')).to_have_count(1);page.locator('.article-title').click();expect(page.get_by_role('link',name='Originalquelle öffnen')).to_have_attribute('href','https://example.com/article');page.keyboard.press('Escape');nav('Übersicht')
    open_form();page.get_by_role('button',name='CSV importieren',exact=True).click();page.get_by_label('CSV-Datei auswählen',exact=True).set_input_files({'name':'invalid.csv','mimeType':'text/csv','buffer':b'symbol,quantity,price\nAAPL,-2,100'});expect(page.get_by_role('alert')).to_contain_text('Zeile 2');expect(page.get_by_role('button',name='Positionen importieren',exact=True)).to_be_disabled();page.keyboard.press('Escape');expect(page.locator('.positions-table tbody tr')).to_have_count(2)
    quote_failure[0]=True;page.get_by_label('Kurse aktualisieren',exact=True).click();expect(page.locator('.data-errors')).to_contain_text('Test: Kurse nicht erreichbar.');expect(page.locator('.portfolio-value')).to_contain_text('1.700,00');quote_failure[0]=False;page.get_by_label('Kurse aktualisieren',exact=True).click();expect(page.locator('.data-errors')).to_have_count(0)
    print('PASS: bookmarks and source links, invalid CSV isolation, cached quotes on outage and recovery')
    page.screenshot(path=str(artifacts/'port-desktop.png'),full_page=True)
    for width in [320,390,768,1024,1440]:
        page.set_viewport_size({'width':width,'height':900});assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'),f'Overflow at {width}'
    page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(artifacts/'port-mobile.png'),full_page=True);page.get_by_label('Navigation öffnen').click();page.get_by_role('button',name='Mein Portfolio',exact=True).click();open_form();page.keyboard.press('Shift+Tab');assert page.evaluate('document.activeElement.closest("[role=dialog]")!==null');page.get_by_label('Schließen',exact=True).click();expect(page.get_by_role('dialog')).to_have_count(0)
    assert not errors,errors
    print('PASS: mobile navigation, modal focus, responsive layouts 320–1440 px, no JavaScript errors')
    browser.close()
