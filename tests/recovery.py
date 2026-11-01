from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');page.goto('http://127.0.0.1:4173/#lesson/classification/challenge/1')
 page.locator('#numeric').fill('-0,2');page.get_by_role('button',name='Check answer').click();expect(page.get_by_text('That’s the idea.')).to_be_visible()
 feedback=page.locator('#feedback').bounding_box();bar=page.locator('.lesson-bottom').bounding_box();assert feedback['y']+feedback['height']<=bar['y'],'Feedback hidden behind fixed controls'
 # Direct access to a later question must not grant completion.
 page.goto('http://127.0.0.1:4173/#lesson/prediction/challenge/2');page.locator('#numeric').fill('7');page.get_by_role('button',name='Check answer').click();page.get_by_role('button',name='Continue',exact=True).click();expect(page.locator('.challenge-tag')).to_contain_text('1 / 2');assert not page.evaluate('JSON.parse(localStorage.getItem("port.learning.v1")).completed.includes("prediction")')
 # Filters have a visible reset path.
 page.goto('http://127.0.0.1:4173/#explore');page.get_by_label('Search classes and lessons').fill('does-not-exist');page.get_by_role('button',name='Clear filters').click();expect(page.locator('.class-card')).to_have_count(3)
 # Denied storage is persistently explained, including on profile.
 ctx=b.new_context();ctx.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw Error('Unavailable')}})")
 blocked=ctx.new_page();blocked.goto('http://127.0.0.1:4173/#profile');expect(blocked.locator('.storage-warning')).to_be_visible();blocked.get_by_label('Display name').fill('Grace');blocked.get_by_role('button',name='Save name').click();expect(blocked.locator('#toast')).to_contain_text('this session')
 b.close();print('Feedback visibility, decimal input, completion guard, search recovery and storage warning checks passed')
