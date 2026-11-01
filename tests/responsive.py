from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':601,'height':800});page.goto('http://127.0.0.1:4173/');page.wait_for_function('document.fonts.status === "loaded"')
 assert page.locator('.hero-words h1').evaluate('el=>el.scrollWidth<=el.clientWidth'), 'Tablet title is clipped'
 page.set_viewport_size({'width':844,'height':390});page.locator('#motion').scroll_into_view_if_needed();assert page.locator('#motion').bounding_box()['y']<350,'Landscape motion control inaccessible'
 page.set_viewport_size({'width':390,'height':844});page.get_by_role('button',name='Motion: system').click();assert page.locator('.kinetic-object').first.evaluate('el=>getComputedStyle(el).animationName')=='none'
 expect(page.get_by_role('button',name='Motion: reduced')).to_be_visible()
 b.close();print('Tablet title, landscape sidebar and mobile motion control checks passed')
