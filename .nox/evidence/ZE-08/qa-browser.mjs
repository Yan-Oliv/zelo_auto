import { chromium } from 'playwright'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const base='http://127.0.0.1:4178', out='.nox/evidence/ZE-08', key='zelo:analytics-consent:v1'
const browser=await chromium.launch()
const result={checks:[],viewports:[],external:{ga4Reception:'PENDING: Google account not accessed',searchConsole:'PENDING: Google account not accessed'}}
const check=(name,detail)=>{result.checks.push({name,result:'PASS',detail});console.log('PASS',name)}
async function setup({diagnostic=true,storageBlocked=false,route='/',consent,viewport={width:1440,height:900}}={}){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'})
 const errors=[],requests=[]
 page.on('pageerror',e=>errors.push(e.message))
 page.on('request',r=>{if(/googletagmanager|google-analytics|analytics.google/.test(r.url()))requests.push(r.url())})
 await page.addInitScript(({diagnostic,key,consent,storageBlocked})=>{
  window.__ZELO_ANALYTICS_DIAGNOSTIC__=diagnostic;window.qaEvents=[]
  window.addEventListener('zelo:analytics',e=>window.qaEvents.push(e.detail))
  if(consent&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,choice:consent,savedAt:Date.now()}))
  if(storageBlocked){Storage.prototype.getItem=()=>{throw new Error('storage denied')};Storage.prototype.setItem=()=>{throw new Error('storage denied')}}
 },{diagnostic,key,consent,storageBlocked})
 await page.goto(base+route);await page.waitForTimeout(600)
 return {page,errors,requests}
}
async function ev(page){return page.evaluate(()=>window.qaEvents)}
async function accept(page){await page.getByRole('button',{name:'Aceitar analytics',exact:true}).click();await page.waitForTimeout(450)}
try{
 const {page,errors,requests}=await setup()
 assert.deepEqual(await ev(page),[]);assert.equal(requests.length,0)
 assert.equal(await page.locator('script[src*="googletagmanager"]').count(),0)
 check('No analytics before choice','No diagnostic event, tag, or analytics request')
 await page.getByRole('button',{name:'Recusar opcionais'}).click();await page.waitForTimeout(450)
 assert.equal(await page.locator('.zelo-consent').count(),0)
 await page.reload();await page.waitForTimeout(500)
 assert.equal(await page.locator('.zelo-consent').count(),0);assert.deepEqual(await ev(page),[])
 check('Refusal persists','Reload retains refusal; no events or tag')
 await page.getByRole('button',{name:'Privacidade e cookies',exact:true}).click()
 assert.equal(await page.getByRole('checkbox').isChecked(),false)
 await page.getByRole('button',{name:'Fechar preferências'}).focus();await page.keyboard.press('Shift+Tab')
 assert.equal(await page.getByRole('button',{name:'Revogar analytics'}).evaluate(el=>el===document.activeElement),true)
 await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Fechar preferências'}).evaluate(el=>el===document.activeElement),true)
 await page.screenshot({path:out+'/qa-preferences-desktop.png'})
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Salvar preferências'}).click()
 await page.waitForTimeout(400)
 assert.equal((await ev(page)).filter(e=>e.event==='page_view').length,1)
 await page.evaluate(()=>scrollTo(0,800));await page.waitForTimeout(200)
 assert.equal((await ev(page)).filter(e=>e.event==='page_view').length,1)
 check('One pageview after consent','Acceptance and anchor/scroll do not duplicate pageview')
 // Preserve external CTA behavior without leaving this tab or opening external sites.
 await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[target="_blank"],a[href^="https://wa.me"]'))e.preventDefault()}))
 const eventsBefore=(await ev(page)).length
 const quote=page.locator('.zelo-header-budget');await quote.click()
 assert.equal((await ev(page)).length,eventsBefore+2)
 assert.deepEqual((await ev(page)).slice(eventsBefore).map(e=>e.event),['quote_click','whatsapp_click'])
 check('Budget has no duplicate event names','Exactly one quote_click and one whatsapp_click; separate dimensions, never summed as contacts')
 for(const selector of ['.ze4-service-action','.ze4-instagram-actions a','.ze4-location a[href*="maps"]']){
  const link=page.locator(selector).first();if(await link.count())await link.click()
 }
 await page.getByRole('button',{name:'Buscar no site'}).click()
 await page.locator('#zelo-search-input').fill('lavagem')
 await page.locator('.zelo-search-results a').first().click()
 const range=page.locator('input[type="range"]').first()
 await range.focus();await range.press('ArrowRight');await range.press('ArrowRight');await range.press('Tab')
 await page.waitForTimeout(500)
 const events=await ev(page)
 assert.ok(events.some(e=>e.event==='select_service'))
 assert.ok(events.some(e=>e.event==='instagram_click'))
 assert.ok(events.some(e=>e.event==='internal_search'))
 assert.ok(events.some(e=>e.event==='before_after_interaction'))
 assert.ok(events.some(e=>e.event==='directions_click'))
 assert.equal(events.filter(e=>e.event==='before_after_interaction').length,1)
 assert.doesNotMatch(JSON.stringify(events),/lavagem(?!_completa)|wa\.me|access_token|@|purchase|generate_lead/)
 fs.writeFileSync(out+'/qa-events.json',JSON.stringify(events,null,2))
 check('Service, Instagram, search, comparator events','Sanitized fixed taxonomy; no search text, messages, outbound URL, sale or lead')
 await page.getByRole('button',{name:'Privacidade e cookies',exact:true}).click()
 await page.getByRole('button',{name:'Revogar analytics'}).click();await page.waitForTimeout(400)
 const revoked=(await ev(page)).length;await quote.click();assert.equal((await ev(page)).length,revoked)
 assert.equal(requests.length,0);assert.deepEqual(errors,[])
 check('Revocation blocks new tracking','Subsequent CTA does not emit; local diagnostics make zero network requests')
 await page.close()
 for(const diagnostic of [false,true]){
  const t=await setup({diagnostic,consent:'granted'});assert.equal(t.requests.length,0)
  assert.equal((await ev(t.page)).length,diagnostic?1:0)
  await t.page.reload();await t.page.waitForTimeout(500)
  assert.equal((await ev(t.page)).length,diagnostic?1:0)
  await t.page.close()
 }
 check('Preview disabled by default; diagnostic opt-in','No requests either way; diagnostic produces one page_view per real reload')
 const blocked=await setup({storageBlocked:true});await accept(blocked.page)
 assert.equal((await ev(blocked.page)).filter(e=>e.event==='page_view').length,1)
 await blocked.page.reload();await blocked.page.waitForTimeout(500)
 assert.ok(await blocked.page.getByRole('button',{name:'Recusar opcionais'}).isVisible())
 assert.deepEqual(blocked.errors,[]);await blocked.page.close()
 check('Storage blocked','In-memory consent works; next document fails closed without errors')
 const debug=await setup({route:'/debug-crossfade',consent:'granted'})
 assert.deepEqual(await ev(debug.page),[]);assert.equal(debug.requests.length,0)
 assert.match(await debug.page.locator('meta[name="robots"]').getAttribute('content'),/noindex/)
 await debug.page.close();check('Debug route excluded','No event or tag; noindex preserved')
 for(const [name,width,height] of [['ultrawide',1920,1080],['desktop',1440,900],['notebook',1366,768],['tablet',768,1024],['mobile',390,844],['mobile-compact',360,740]]){
  const t=await setup({viewport:{width,height}});await t.page.waitForTimeout(400)
  assert.equal(await t.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  const box=await t.page.locator('.zelo-consent').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height)
  assert.equal(await t.page.locator('.zelo-consent').evaluate(el=>getComputedStyle(el).transform),'none')
  await t.page.screenshot({path:`${out}/qa-consent-${name}.png`})
  await t.page.getByRole('button',{name:'Recusar opcionais'}).click();await t.page.waitForTimeout(450)
  await t.page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,100))}scrollTo(0,0)})
  await t.page.waitForTimeout(500)
  await t.page.screenshot({path:`${out}/qa-${name}.png`,fullPage:true})
  assert.deepEqual(t.errors,[]);result.viewports.push({name,width,height,overflow:false,consentWithinViewport:true,browserErrors:0})
  await t.page.close()
 }
 check('Six viewports','Screenshots with/without banner; no overflow or browser errors')
 const html=await(await fetch(base)).text()
 assert.match(html,/rel="canonical" href="https:\/\/zelo\.omnyatech\.com\.br\/"/)
 assert.match(html,/name="google-site-verification"/)
 const ld=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(ld['@type'],'AutoWash')
 assert.match(await(await fetch(base+'/sitemap.xml')).text(),/<loc>https:\/\/zelo\.omnyatech\.com\.br\/<\/loc>/)
 assert.match(await(await fetch(base+'/robots.txt')).text(),/Sitemap: https:\/\/zelo\.omnyatech\.com\.br\/sitemap.xml/)
 check('SEO regression','Canonical, verification, structured data, sitemap, robots preserved locally')
 result.status='PASS'
}catch(error){result.status='FAIL';result.error=error.stack;console.error(error)}
finally{await browser.close();fs.writeFileSync(out+'/qa-browser-results.json',JSON.stringify(result,null,2))}
if(result.status==='FAIL')process.exitCode=1
