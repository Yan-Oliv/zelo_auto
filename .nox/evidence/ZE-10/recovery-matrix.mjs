import { chromium } from 'playwright'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.ZE10_QA_URL || 'http://127.0.0.1:5173'
const dir = '.nox/evidence/ZE-10'
fs.mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
const result = { kind: 'MOCKED UI CONTRACT TESTS - NOT REAL GOOGLE DATA', groups: [] }
const fixture = { source: 'google_business_profile', average: 4.7, total: 7, sourceUrl: 'https://www.google.com/maps?cid=123', reviewActionUrl: 'https://search.google.com/local/writereview?placeid=TEST_ONLY', reviews: Array.from({length: 3}, (_, i) => ({id: `mock-${i}`, author: `TESTE SIMULADO ${i + 1}`, rating: 5 - i, comment: i === 0 ? '<img src=x onerror=alert(1)> Texto de teste, sem cliente real. '.repeat(12) : 'Cenario simulado de QA; nao e depoimento real.', dateLabel: 'Data de teste', sourceUrl: 'https://www.google.com/maps?cid=123'})) }
async function pageFor(payload = fixture, status = 200, options = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: options.motion || 'reduce' })
  let calls = 0
  let release
  const wait = options.delayed ? new Promise(resolve => { release = resolve }) : Promise.resolve()
  await page.addInitScript(({consent}) => {
    window.__ZELO_ANALYTICS_DIAGNOSTIC__ = true
    window.__qaEvents = []
    addEventListener('zelo:analytics', event => window.__qaEvents.push(event.detail))
    if (window.top === window && consent) { try { localStorage.setItem('zelo:analytics-consent:v1', JSON.stringify({version: 1, choice: 'granted', savedAt: Date.now()})) } catch {} }
  }, {consent: options.consent})
  await page.route('**/api/google-reviews', async route => { calls++; await wait; await route.fulfill({status, contentType: 'application/json', body: JSON.stringify(payload)}) })
  await page.route('**/api/instagram-feed', route => route.fulfill({status: 503, contentType: 'application/json', body: '{}'}))
  await page.route('https://**/*', route => route.abort())
  await page.goto(base)
  return { page, calls: () => calls, release }
}
async function near(page) { await page.locator('#avaliacoes').scrollIntoViewIfNeeded() }
async function state(page, value) { await page.locator(`#avaliacoes[data-reviews-state="${value}"]`).waitFor() }
async function note(name, task) { await task(); result.groups.push({name, status: 'PASS'}) }
try {
  for (const motion of ['reduce','no-preference']) await note(`Mandatory recovery ${motion}`, async () => {
    const test = await pageFor({},503,{motion}); const p=test.page
    await p.unroute('**/api/google-reviews')
    let calls=0
    await p.route('**/api/google-reviews',async route=>{calls++; await new Promise(r=>setTimeout(r,300));await route.fulfill({status:calls===1?503:200,contentType:'application/json',body:JSON.stringify(calls===1?{error:{category:'upstream'}}:fixture)})})
    await near(p);await state(p,'unavailable');assert.equal(calls,1)
    const retry=p.locator('.ze4-review-retry');await p.waitForTimeout(2400);await retry.focus();await retry.press('Enter')
    await p.locator('#avaliacoes[aria-labelledby]').waitFor();await state(p,'loading')
    await retry.press('Space');await state(p,'verified');assert.equal(calls,2)
    assert.equal(await retry.evaluate(el=>document.activeElement===el),true)
    await p.evaluate(()=>scrollTo(0,0));await near(p);await p.waitForTimeout(500);assert.equal(calls,2)
    assert.equal(await p.locator('#avaliacoes .ze4-review-comment img').count(),0)
    await p.close()
  })
  for (const [code,raw,headers,hasRetry] of [[401,'html',{},false],[429,'html',{'retry-after':'120'},true],[429,'html',{'retry-after':new Date(Date.now()+180000).toUTCString()},true],[503,JSON.stringify({error:{category:'configuration'}}),{},false]]) await note(`Policy ${code} ${JSON.stringify(headers)}`,async()=>{
    const t=await pageFor();const p=t.page;await p.unroute('**/api/google-reviews');let calls=0
    await p.route('**/api/google-reviews',async route=>{calls++;await route.fulfill({status:code,body:raw,headers})})
    await near(p);await state(p,'unavailable');assert.equal(await p.locator('.ze4-review-retry').count(),hasRetry?1:0)
    if(hasRetry){assert.equal(await p.locator('.ze4-review-retry').getAttribute('aria-disabled'),'true');await p.locator('.ze4-review-retry').evaluate(el=>el.click());await p.waitForTimeout(100);assert.equal(calls,1)}await p.close()
  })
  const sizes=[[2560,1080],[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[360,740],[320,568]]
  for(const [width,height] of sizes) for(const scenario of ['loading','verified','empty','unavailable','retrying']) await note(`${scenario} ${width}x${height} MOCK`,async()=>{
    const t=await pageFor(scenario==='empty'?{...fixture,total:0,average:null,reviews:[]}:fixture,scenario==='unavailable'?503:200,{delayed:scenario==='loading'||scenario==='retrying'})
    const p=t.page;const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.setViewportSize({width,height});
    if(scenario==='retrying'){
      await p.unroute('**/api/google-reviews');let attempts=0
      await p.route('**/api/google-reviews',async route=>{attempts++;if(attempts===1)await route.fulfill({status:503,contentType:'application/json',body:'{}'});else await new Promise(()=>{})})
      await near(p);await state(p,'unavailable');await p.waitForTimeout(2300);await p.locator('.ze4-review-retry').click()
    }else await near(p)
    await state(p,scenario==='retrying'?'loading':scenario)
    await p.waitForTimeout(150)
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
    await p.evaluate(()=>{const label=document.createElement('p');label.textContent='QA MOCK - DADOS SIMULADOS, NAO REAIS';label.style.cssText='background:#111;color:#fff;padding:8px';document.querySelector('#avaliacoes').prepend(label)})
    await p.locator('.ze4-community').screenshot({style:'header { visibility:hidden !important } [role=dialog] { visibility:hidden !important }',path:`${dir}/MOCK-${scenario}-${width}x${height}.png`})
    assert.deepEqual(errors,[]);t.release?.();await p.close()
  })
  await note('Frontend timeout abort and manual recovery',async()=>{
    const t=await pageFor();const p=t.page;await p.unroute('**/api/google-reviews');let calls=0
    await p.route('**/api/google-reviews',async route=>{calls++;if(calls===1)return;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)})})
    await near(p);await state(p,'unavailable');await p.waitForTimeout(2300);await p.locator('.ze4-review-retry').click();await state(p,'verified');assert.equal(calls,2);await p.close()
  })
} finally {
  fs.writeFileSync(`${dir}/recovery-matrix.json`,JSON.stringify(result,null,2)); await browser.close()
}
console.log(JSON.stringify(result,null,2))
