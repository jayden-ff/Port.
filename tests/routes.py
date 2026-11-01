from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173/');expect(page.get_by_text('Your next frontier',exact=True)).to_be_visible()
 for h in ['__proto__','constructor','toString']:
  page.goto('http://127.0.0.1:4173/#'+h);expect(page.get_by_text('A little off the path.')).to_be_visible()
 assert not errors,errors
 b.close();print('Root and unknown-route regression checks passed')
