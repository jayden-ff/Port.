"""Optional integration check against real providers; start npm run dev first."""
import json,os,urllib.request
from urllib.parse import urlencode
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('PORT_BASE_URL','http://127.0.0.1:5173').rstrip('/')
def get(path):
    with urllib.request.urlopen(base+'/api/'+path,timeout=45) as r:
        assert r.status==200
        return json.load(r)
assert get('health')['ok']
q=get('quotes?'+urlencode({'assets':'stock:AAPL,stock:SAP.DE,crypto:bitcoin'}))
assert not q['errors'],q['errors']
assert q['quotes']['stock:AAPL']['currency']=='USD'
assert q['quotes']['stock:SAP.DE']['currency']=='EUR'
assert q['quotes']['crypto:bitcoin']['currency']=='EUR'
assert all(v['price']>0 and v['marketTime'] and v['fetchedAt'] for v in q['quotes'].values())
assert get('fx')['rates']['USD']>0
news=get('news?'+urlencode({'symbols':'AAPL,BTC','names':json.dumps({'AAPL':'Apple','BTC':'Bitcoin'})}))
assert news['provider']=='Google News RSS'
assert all(a['url'].startswith('https://') and a['publishedAt'] and set(a['symbols'])<={'AAPL','BTC'} for a in news['articles'])
print('PASS: actual US and German stock quotes, crypto, FX, RSS:',len(news['articles']),'articles')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');page.set_default_timeout(30000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base,wait_until='networkidle');expect(page.locator('.first-position')).to_be_visible()
    page.locator('.page-intro button').click();page.get_by_role('button',name='AAPL Apple',exact=False).click();page.get_by_label('Einstiegskurs',exact=True).fill('300');page.get_by_label('Anzahl',exact=True).fill('2');page.get_by_role('dialog').get_by_role('button',name='Position hinzufügen',exact=True).click()
    expect(page.locator('.positions-table')).to_contain_text('Yahoo Finance');expect(page.locator('.positions-table')).to_contain_text('Kurszeit');expect(page.locator('.portfolio-value')).not_to_contain_text('—');expect(page.locator('.feed-info')).to_contain_text('Google News RSS')
    assert page.locator('.news-card').count()>0
    assert not errors,errors
    page.screenshot(path='/workspace/artifacts/port-live.png',full_page=True)
    browser.close()
print('PASS: real quotes and real RSS rendered through the shared backend, without browser fixtures')
