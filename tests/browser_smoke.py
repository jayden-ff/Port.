"""Optional browser checks: start npm run dev, then run with Python Playwright installed.

Uses the cloud machine's Chromium. PORT_BASE_URL and CHROMIUM_PATH can override defaults.
The live response fixture validates UI behavior, not external-provider connectivity.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

base = os.environ.get('PORT_BASE_URL', 'http://127.0.0.1:5173')
artifacts = Path('/workspace/artifacts')
artifacts.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
    context = browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    page = context.new_page()
    page.set_default_timeout(10000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def navigate(name):
        page.locator('.main-nav button').filter(has_text=name).click()

    def open_import():
        page.locator('.page-intro button').click()
        expect(page.get_by_role('dialog')).to_be_visible()

    page.goto(base, wait_until='networkidle')
    expect(page.locator('.news-card')).to_have_count(6)
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    page.locator('.news-search input').fill('NVDA')
    expect(page.locator('.news-card')).to_have_count(2)
    page.get_by_role('button', name='Suche löschen').click()
    page.locator('.feed-tabs button').filter(has_text='Makro').click()
    expect(page.locator('.news-card')).to_have_count(1)
    page.locator('.feed-tabs button').filter(has_text='Für dich').click()
    expect(page.locator('.news-card')).to_have_count(6)
    print('PASS: search and category filters')

    page.locator('.card-save').first.click()
    navigate('Merkliste')
    expect(page.locator('.news-card')).to_have_count(1)
    page.locator('.article-title').click()
    expect(page.get_by_role('dialog')).to_contain_text('Beispielnachricht')
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    page.reload(wait_until='networkidle')
    navigate('Merkliste')
    expect(page.locator('.news-card')).to_have_count(1)
    page.locator('.card-save').click()
    expect(page.locator('.news-card')).to_have_count(0)
    expect(page.locator('.empty-state')).to_be_visible()
    print('PASS: article details, bookmarking, reload persistence, and removal')

    navigate('Übersicht')
    open_import()
    page.locator('.broker-options button').filter(has_text='Fomo').click()
    page.locator('input[type=file]').set_input_files({'name':'portfolio.csv','mimeType':'text/csv','buffer':b'symbol,quantity,price\nNVDA,10,100\nAAPL,5,200'})
    expect(page.locator('.upload-zone')).to_contain_text('2 Positionen')
    page.get_by_role('button', name='Portfolio importieren', exact=True).click()
    expect(page.get_by_role('dialog')).to_have_count(0)
    expect(page.locator('.portfolio-value')).to_contain_text('2.000,00')
    expect(page.locator('.allocation-chart')).to_be_visible()
    expect(page.locator('.chart-area')).to_have_count(0)
    expect(page.locator('.news-card')).to_have_count(0)
    navigate('Mein Portfolio')
    expect(page.locator('.positions-table tbody tr')).to_have_count(2)
    expect(page.locator('.positions-table tbody')).to_contain_text('Fomo')
    print('PASS: real CSV import replaces demo, recalculates value, and avoids fabricated price history/news')

    open_import()
    page.locator('.broker-options button').filter(has_text='Revolut').click()
    page.get_by_role('button', name='Manuell hinzufügen', exact=True).click()
    fields = page.locator('.manual-fields input')
    fields.nth(0).fill('MSFT')
    fields.nth(1).fill('3')
    fields.nth(2).fill('150,00')
    page.get_by_role('button', name='Position hinzufügen', exact=True).click()
    expect(page.locator('.portfolio-value')).to_contain_text('2.450,00')
    expect(page.locator('.positions-table tbody tr')).to_have_count(3)
    page.reload(wait_until='networkidle')
    navigate('Mein Portfolio')
    expect(page.locator('.positions-table tbody tr')).to_have_count(3)
    expect(page.locator('.portfolio-value')).to_contain_text('2.450,00')
    print('PASS: multiple sources and manual positions persist after reload')

    open_import()
    page.locator('input[type=file]').set_input_files({'name':'invalid.csv','mimeType':'text/csv','buffer':b'symbol,quantity,price\nNVDA,-10,100'})
    expect(page.get_by_role('alert')).to_contain_text('Zeile 2')
    expect(page.get_by_role('button', name='Portfolio importieren', exact=True)).to_be_disabled()
    page.keyboard.press('Escape')
    expect(page.locator('.portfolio-value')).to_contain_text('2.450,00')
    print('PASS: invalid imports do not mutate the portfolio')

    navigate('Nachrichten')
    # Stable fixture verifies live errors in any network policy.
    page.route('**/api/news?**', lambda route: route.fulfill(status=503, content_type='application/json', body=json.dumps({'error':'Test: Nachrichtendienst nicht erreichbar.'})))
    page.get_by_role('button',name='Live abrufen',exact=True).click()
    expect(page.locator('.feed-error')).to_be_visible()
    expect(page.locator('.news-card')).to_have_count(0)
    page.unroute('**/api/news?**')
    fixture = {'articles':[{'id':'live-fixture','source':'RSS-Testquelle','category':'Unternehmen','publishedAt':'2026-10-09T12:00:00.000Z','symbols':['NVDA'],'title':'NVIDIA RSS test article','summary':'A real-feed format fixture.','body':'Feed-format test.','url':'https://example.com/article','image':'news','tone':'Neue Meldung'}], 'fetchedAt':'2026-10-09T12:00:00.000Z'}
    page.route('**/api/news?**', lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps(fixture)))
    page.get_by_role('button',name='Aktualisieren',exact=True).click()
    expect(page.locator('.news-card')).to_have_count(1)
    expect(page.locator('.feed-error')).to_have_count(0)
    expect(page.locator('.feed-info')).to_contain_text('RSS-Abfrage alle 60 Sekunden')
    page.locator('.article-title').click()
    expect(page.get_by_role('link',name='Originalquelle öffnen')).to_have_attribute('href','https://example.com/article')
    page.keyboard.press('Escape')
    print('PASS: live error handling and recovery with a controlled RSS response fixture')

    # Fresh demo context for clean visual artifacts.
    visual = browser.new_context(viewport={'width':1440,'height':1000})
    shot = visual.new_page()
    shot.goto(base,wait_until='networkidle')
    shot.wait_for_timeout(1700)
    shot.screenshot(path=str(artifacts / 'port-desktop.png'),full_page=True)
    shot.screenshot(path=str(artifacts / 'port-desktop-viewport.png'))

    mobile_context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
    mobile=mobile_context.new_page()
    mobile.on('pageerror',lambda error: errors.append(str(error)))
    mobile.goto(base,wait_until='networkidle')
    assert not mobile.evaluate('document.documentElement.scrollWidth > innerWidth')
    mobile.screenshot(path=str(artifacts / 'port-mobile.png'),full_page=True)
    mobile.screenshot(path=str(artifacts / 'port-mobile-viewport.png'))
    mobile.get_by_role('button',name='Navigation öffnen').click()
    mobile.get_by_role('button',name='Mein Portfolio',exact=True).click()
    expect(mobile.locator('.positions-table tbody tr')).to_have_count(5)
    mobile.locator('.page-intro button').click()
    expect(mobile.get_by_role('dialog')).to_be_visible()
    mobile.wait_for_timeout(350)
    mobile.screenshot(path=str(artifacts / 'port-mobile-import.png'))
    assert not mobile.evaluate('document.documentElement.scrollWidth > innerWidth')
    mobile.keyboard.press('Shift+Tab')
    assert mobile.evaluate('document.activeElement.closest("[role=dialog]") !== null')
    mobile.get_by_role('button',name='Schließen',exact=True).click()
    expect(mobile.get_by_role('dialog')).to_have_count(0)
    for width in [320,390,768,1024,1440]:
        shot.set_viewport_size({'width':width,'height':900})
        assert not shot.evaluate('document.documentElement.scrollWidth > innerWidth'), f'Overflow at {width}'
    assert mobile.locator('.focus-orb').evaluate('(element)=>getComputedStyle(element).animationName') == 'none'
    assert not errors, errors
    print('PASS: mobile navigation, modal focus, reduced motion, no overflow at 320–1440 px, no JavaScript errors')
    browser.close()
