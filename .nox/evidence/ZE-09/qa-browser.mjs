import { chromium } from 'playwright'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.ZE09_QA_URL || 'http://127.0.0.1:5180'
const dir = '.nox/evidence/ZE-09'
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
  await note('Lazy fetch / skeleton / dedup / safe text / fractional stars', async () => {
    const test = await pageFor(fixture, 200, {delayed: true})
    const p = test.page
    await p.waitForTimeout(500)
    assert.equal(test.calls(), 0)
    await near(p)
    await p.locator('#avaliacoes .ze4-review-skeleton').first().waitFor()
    assert.equal(await p.locator('#avaliacoes .ze4-review-skeleton').count(), 4)
    assert.equal(await p.locator('#avaliacoes .ze4-review-content').getAttribute('aria-busy'), 'true')
    test.release()
    await state(p, 'verified')
    assert.equal(await p.locator('#avaliacoes .ze4-review-card').count(), 3)
    assert.equal(await p.locator('#avaliacoes .ze4-review-comment img').count(), 0)
    assert.match(await p.locator('#avaliacoes .ze4-review-comment').first().textContent(), /<img/)
    assert.equal(await p.locator('#avaliacoes [role="img"]').first().getAttribute('aria-label'), '4,7 de 5 estrelas')
    const fill = await p.locator('#avaliacoes .ze4-review-stars').first().locator('.ze4-review-star > span').last().getAttribute('style')
    assert.match(fill, /70/)
    await p.evaluate(() => scrollTo(0, 0)); await near(p)
    assert.equal(test.calls(), 1)
    assert.equal(await p.locator('#avaliacoes [data-analytics-review="write"]').getAttribute('href'), fixture.reviewActionUrl)
    assert.match(await p.locator('#avaliacoes').innerText(), /VER TODAS AS/)
    await p.close()
  })
  for (const [name, payload, code, expected] of [
    ['unconfigured', {}, 503, 'unavailable'], ['malformed', { ...fixture, average: 9 }, 200, 'unavailable'],
    ['untrusted URL', { ...fixture, sourceUrl: 'https://evil.example' }, 200, 'unavailable'],
    ['google redirect rejected', { ...fixture, sourceUrl: 'https://www.google.com/url?q=example.com' }, 200, 'unavailable'],
    ['inconsistent empty', { ...fixture, total: 0 }, 200, 'unavailable'],
    ['invalid review rejected', { ...fixture, reviews: [{...fixture.reviews[0], rating: 0}] }, 200, 'unavailable'],
    ['empty', { ...fixture, average: null, total: 0, reviews: [] }, 200, 'empty']
  ]) await note(name, async () => {
    const { page } = await pageFor(payload, code)
    await near(page); await state(page, expected)
    assert.equal(await page.locator('#avaliacoes .ze4-review-score').count(), 0)
    if (expected === 'unavailable') {
      assert.equal(await page.locator('#avaliacoes [data-analytics-review="write"]').count(), 1)
      assert.equal(await page.locator('#avaliacoes .ze4-review-unavailable').count(), 3)
      assert.match(await page.locator('#avaliacoes').innerText(), /indispon/)
    }
    await page.close()
  })
  await note('Owner-approved fallback when API write link absent', async () => {
    const {reviewActionUrl, ...without} = fixture
    const { page } = await pageFor(without)
    await near(page); await state(page, 'verified')
    assert.match(await page.locator('#avaliacoes [data-analytics-review="write"]').getAttribute('href'), /#lrd=0x94a667c8105c5275:0x14e35d89087019ae,3/)
    await page.close()
  })
  await note('Owner-approved fallback when API write target invalid', async () => {
    const { page } = await pageFor({...fixture, reviewActionUrl: 'https://www.google.com/maps?cid=123'})
    await near(page); await state(page, 'verified')
    assert.match(await page.locator('#avaliacoes [data-analytics-review="write"]').getAttribute('href'), /#lrd=0x94a667c8105c5275:0x14e35d89087019ae,3/)
    await page.close()
  })
  for (const consent of [false, true]) await note(`Analytics consent ${consent}`, async () => {
    const { page } = await pageFor(fixture, 200, {consent})
    await near(page); await state(page, 'verified')
    await page.evaluate(() => {
      document.querySelector('#avaliacoes').addEventListener('click', event => event.preventDefault())
      document.querySelector('#avaliacoes [data-analytics-review="write"]').click()
      document.querySelector('#avaliacoes [data-analytics-review="view"]').click()
    })
    const events = await page.evaluate(() => window.__qaEvents.filter(event => event.event === 'google_reviews_click'))
    assert.equal(events.length, consent ? 2 : 0)
    if (consent) assert.deepEqual(events.map(event => event.params.review_action), ['write', 'view'])
    await page.close()
  })
  for (const [name, width, height] of [['ultrawide',1920,1080],['desktop',1440,900],['notebook',1366,768],['tablet',768,1024],['mobile',390,844],['mobile-compact',360,740]]) await note(`Responsive mock ${name}`, async () => {
    const { page } = await pageFor(fixture, 200, {consent:true})
    const errors = []; page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({width,height})
    await near(page); await state(page, 'verified')
    await page.evaluate(() => {
      const label = document.createElement('div'); label.textContent = 'QA MOCK - DADOS SIMULADOS, NAO REAIS';
      label.style.cssText = 'position:absolute;top:0;left:0;right:0;z-index:99;background:#111;color:white;text-align:center;padding:8px;font:12px sans-serif';document.querySelector('.ze4-community').append(label)
    })
    await page.waitForTimeout(300)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    const dimensions = await page.locator('#avaliacoes').boundingBox()
    assert.ok(dimensions.width <= width)
    assert.equal(await page.locator('#avaliacoes .ze4-review-skeleton').count(), 0)
    assert.deepEqual(errors, [])
    await page.evaluate(() => scrollTo(0,0))
    await page.screenshot({path:`${dir}/MOCK-ui-${name}.png`,fullPage:true})
    if (name === 'mobile') {
      const animation = await page.locator('#avaliacoes .ze4-review-card').first().evaluate(el => getComputedStyle(el).transform)
      assert.equal(animation, 'none')
    }
    await page.close()
  })
} finally {
  fs.writeFileSync(`${dir}/qa-browser.json`,JSON.stringify(result,null,2)); await browser.close()
}
console.log(JSON.stringify(result,null,2))
