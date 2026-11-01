from playwright.sync_api import sync_playwright,expect
import json
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173/dist/')
 page.keyboard.press('Tab');expect(page.get_by_role('link',name='Skip to content')).to_be_focused();page.keyboard.press('Enter');expect(page.locator('#main')).to_be_focused();expect(page.get_by_text('Your next frontier',exact=True)).to_be_visible()
 page.goto('http://127.0.0.1:4173/dist/#progress');page.get_by_role('button',name='Import progress').focus();expect(page.get_by_role('button',name='Import progress')).to_be_focused()
 with page.expect_file_chooser() as chooser:page.get_by_role('button',name='Import progress').press('Enter')
 chooser.value.set_files({'name':'progress.json','mimeType':'application/json','buffer':json.dumps({'completed':['prediction'],'days':['2026-11-01'],'steps':{'regression':1.5},'notes':{'prediction':'A saved note'}}).encode()})
 expect(page.locator('.progress-stats')).to_contain_text('100')
 with page.expect_download() as dl:page.get_by_role('button',name='Export progress').click()
 assert dl.value.suggested_filename=='port-progress.json'
 page.goto('http://127.0.0.1:4173/dist/#lesson/regression');expect(page.locator('#experiment')).to_be_visible()
 page.get_by_role('link',name='Back to class').click();expect(page.get_by_text('Your path through the ideas')).to_be_visible()
 # Imported completion must not get XP again.
 page.goto('http://127.0.0.1:4173/dist/#lesson/prediction');page.get_by_role('button',name='Explore the theory').click();page.reload();expect(page.locator('.scientific-text')).to_be_visible()
 page.get_by_role('button',name='Test your understanding').click();page.locator('[data-answer="1"]').click();page.get_by_role('button',name='Check answer').click();page.get_by_role('button',name='Continue',exact=True).click()
 payload='"><img src=x onerror="window.injected=true">'
 page.locator('#numeric').fill(payload);page.get_by_role('button',name='Save lesson',exact=True).click();assert page.locator('#numeric').input_value()==payload;assert not page.evaluate('window.injected === true');assert page.locator('.answers img').count()==0
 page.locator('#numeric').fill('7');page.get_by_role('button',name='Check answer').click();page.get_by_role('button',name='Continue',exact=True).click();page.goto('http://127.0.0.1:4173/dist/#progress');expect(page.locator('.progress-stats')).to_contain_text('100')
 # Blank answers cannot become zero through a bookmark rerender.
 page.goto('http://127.0.0.1:4173/dist/#lesson/neuron');page.get_by_role('button',name='Explore the theory').click();page.get_by_role('button',name='Test your understanding').click();page.locator('[data-answer="1"]').click();page.get_by_role('button',name='Check answer').click();page.get_by_role('button',name='Continue',exact=True).click()
 page.locator('#numeric').fill('0');page.locator('#numeric').fill('');page.get_by_role('button',name='Save lesson',exact=True).click();expect(page.locator('#next')).to_be_disabled()
 # Storage can be disabled without preventing learning.
 blocked=b.new_context();blocked.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked')}})")
 bp=blocked.new_page();bp.goto('http://127.0.0.1:4173/dist/#lesson/vectors');bp.get_by_role('button',name='Explore the theory').click();expect(bp.locator('.scientific-text')).to_be_visible();expect(bp.get_by_role('status')).to_contain_text('storage is unavailable')
 assert not errors,errors
 b.close();print('Keyboard, import/export, malformed steps, duplicate XP, escaped input, step resume, and blocked storage checks passed')
