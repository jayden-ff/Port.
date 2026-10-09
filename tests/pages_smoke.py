"""Verify a plain static Pages build served at the repository subpath.

Set PORT_PAGES_URL for a deployed website; no Node/API backend is used.
"""
import os
from playwright.sync_api import sync_playwright, expect

base=os.environ.get('PORT_PAGES_URL','http://127.0.0.1:4180/Port./')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    errors=[]
    missing=[]
    api_requests=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    page.on('response',lambda response: missing.append(response.url) if response.status>=400 else None)
    page.on('request',lambda request: api_requests.append(request.url) if '/api/news' in request.url else None)
    page.goto(base,wait_until='networkidle')
    expect(page.locator('.news-card')).to_have_count(6)
    expect(page.get_by_role('button',name='Live-Feed: nicht verbunden')).to_be_visible()
    page.get_by_role('button',name='Live-Feed: nicht verbunden').click()
    expect(page.get_by_role('dialog')).to_contain_text('Noch kein Nachrichtendienst verbunden')
    page.keyboard.press('Escape')
    page.locator('.card-save').first.click()
    page.locator('.main-nav button').filter(has_text='Merkliste').click()
    expect(page.locator('.news-card')).to_have_count(1)
    page.locator('.page-intro button').click()
    link=page.get_by_role('link',name='Beispiel')
    href=link.get_attribute('href')
    assert href=='/Port./portfolio-beispiel.csv',href
    csv=page.request.get(base+'portfolio-beispiel.csv')
    assert csv.status==200
    page.locator('input[type=file]').set_input_files({'name':'portfolio.csv','mimeType':'text/csv','buffer':csv.body()})
    page.get_by_role('button',name='Portfolio importieren',exact=True).click()
    page.locator('.main-nav button').filter(has_text='Mein Portfolio').click()
    expect(page.locator('.portfolio-value')).to_contain_text('3.837,86')
    expect(page.locator('.positions-table tbody tr')).to_have_count(3)
    page.reload(wait_until='networkidle')
    page.locator('.main-nav button').filter(has_text='Mein Portfolio').click()
    expect(page.locator('.positions-table tbody tr')).to_have_count(3)
    page.set_viewport_size({'width':390,'height':844})
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    page.get_by_role('button',name='Navigation öffnen').click()
    page.get_by_role('button',name='Übersicht',exact=True).click()
    expect(page.locator('.portfolio-value')).to_contain_text('3.837,86')
    assert not missing,missing
    assert not api_requests,api_requests
    assert not errors,errors
    print('PASS: static Pages subpath, CSS/fonts/assets, sample download, import, bookmarks, persistence, mobile navigation, and no nonexistent API requests')
    browser.close()
