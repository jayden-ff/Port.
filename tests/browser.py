from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json,os
base=os.environ.get('PORT_BASE_URL','http://127.0.0.1:4173')
artifacts=Path('artifacts');artifacts.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 context=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base);page.wait_for_function('document.fonts.status === "loaded"')
 data=page.evaluate("async()=> (await import('./curriculum.js')).lessons")
 def overflow():
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'Overflow: {page.url}'
 for width in [360,390,768,1440]:
  page.set_viewport_size({'width':width,'height':900});page.goto(base+'/#home');page.wait_for_timeout(350);overflow()
  page.screenshot(path=str(artifacts/f'home-{width}.png'),full_page=True,animations='disabled')
  for route in ['explore','class/deep-learning','notebook','progress','lesson/attention']:
   page.goto(base+'/#'+route);page.wait_for_timeout(50);overflow()
 page.set_viewport_size({'width':390,'height':844})
 page.goto(base+'/#explore');page.get_by_label('Search classes and lessons').fill('backprop');expect(page.locator('.class-card')).to_have_count(1)
 page.get_by_label('Filter by level').select_option('Foundational');expect(page.get_by_text('No matching classes yet.')).to_be_visible()
 page.get_by_label('Filter by level').select_option('All levels');page.get_by_label('Search classes and lessons').fill('')
 for lesson in data:
  page.goto(base+'/#lesson/'+lesson['id']);page.wait_for_timeout(50);overflow()
  expect(page.locator('#experiment')).to_be_visible()
  slider=page.locator('input[type=range]').first
  slider.evaluate('(el)=>{el.value=el.max;el.dispatchEvent(new Event("input",{bubbles:true}))}')
  if lesson['experiment']=='gradient':
   page.get_by_role('button',name='Take a step').click();expect(page.locator('#theta')).to_have_text('-5.600')
  if lesson['id']=='attention':page.screenshot(path=str(artifacts/'mobile-attention.png'),full_page=True)
  page.get_by_role('button',name='Explore the theory').click();expect(page.locator('.scientific-text')).to_be_visible();overflow()
  page.locator('#lesson-note').fill('An idea worth keeping: '+lesson['title'])
  page.get_by_role('button',name='Save lesson',exact=True).click()
  page.get_by_role('button',name='Test your understanding').click()
  for qi,q in enumerate(lesson['questions']):
   expect(page.locator('#next')).to_be_disabled()
   if qi==0:
    if 'options' in q:page.locator('[data-answer]').nth((q['correct']+1)%len(q['options'])).click()
    else:page.locator('#numeric').fill('99999')
    page.get_by_role('button',name='Check answer').click();expect(page.get_by_text('Not quite. Take another look.')).to_be_visible()
   if 'options' in q:page.locator('[data-answer]').nth(q['correct']).click()
   else:page.locator('#numeric').fill(str(q['correct']))
   page.get_by_role('button',name='Check answer').click();expect(page.get_by_text('That’s the idea.')).to_be_visible();overflow()
   page.get_by_role('button',name='Continue',exact=True).click()
  expect(page.locator('.celebration')).to_be_visible();overflow()
  if lesson['id']=='prediction':page.screenshot(path=str(artifacts/'mobile-complete.png'),full_page=True)
 page.goto(base+'/#progress');expect(page.locator('.progress-stats')).to_contain_text('1200');page.reload();expect(page.locator('.progress-stats')).to_contain_text('1200')
 page.goto(base+'/#notebook');expect(page.locator('.note-card')).to_have_count(12)
 page.goto(base+'/#lesson/no-such-lesson');expect(page.get_by_text('A little off the path.')).to_be_visible()
 page.goto(base+'/#home');page.set_viewport_size({'width':1440,'height':1000});page.get_by_role('button',name='Motion: system').click();assert page.locator('.kinetic-object').first.evaluate('el=>getComputedStyle(el).animationName')=='none'
 page.reload();assert page.locator('.kinetic-object').first.evaluate('el=>getComputedStyle(el).animationName')=='none'
 # New browser storage must be empty; malformed storage must recover.
 page.evaluate('localStorage.setItem("port.learning.v1", "{bad")');page.reload();expect(page.locator('.top-stats')).to_contain_text('0')
 # Native reduced-motion preference stops decorative animation.
 page.emulate_media(reduced_motion='reduce');assert page.locator('.kinetic-object').first.evaluate('el=>getComputedStyle(el).animationName')=='none'
 page.emulate_media(reduced_motion='no-preference');assert page.locator('.kinetic-object').first.evaluate('el=>getComputedStyle(el).animationName')=='sculpture-drift'
 # Sample actual requestAnimationFrame intervals, under desktop headless execution.
 timing=page.evaluate('''()=>new Promise(resolve=>{let times=[],last;function tick(t){if(last)times.push(t-last);last=t;if(times.length<120)requestAnimationFrame(tick);else resolve({median:times.sort((a,b)=>a-b)[60],over34:times.filter(t=>t>34).length,max:Math.max(...times)})}requestAnimationFrame(tick)})''')
 assert not errors,errors
 print(json.dumps({'lessons_completed':12,'viewports':[360,390,768,1440],'console_errors':errors,'frame_timing_ms':timing},indent=2))
 b.close()
