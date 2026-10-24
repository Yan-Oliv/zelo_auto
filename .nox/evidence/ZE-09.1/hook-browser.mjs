// TEST DATA ONLY. Real React StrictMode in Chromium; all Google traffic intercepted.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const browser = await chromium.launch(), page = await browser.newPage(), results = [], errors = [], expectedHttpErrors = [], pending = []
let calls = 0
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() !== 'error') return
  const text = message.text()
  if (/Failed to load resource: the server responded with a status of (503|500)/.test(text)) expectedHttpErrors.push(text)
  else errors.push(text)
})
await page.clock.install({ time: new Date('2026-10-23T12:00:00Z') })
await page.route('**/ze091-hook-harness', route => route.fulfill({ contentType: 'text/html', body: `<div id="test"></div><script type="module">
import React from '/node_modules/.vite/deps/react.js';
import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js';
import { useGoogleReviews } from '/src/features/landing/hooks/useGoogleReviews.ts';
window.observers=[]; window.IntersectionObserver=class{constructor(callback){this.callback=callback;window.observers.push(this)}observe(){}disconnect(){this.disconnected=true}};
window.enter=near=>window.observers.filter(observer=>!observer.disconnected).forEach(observer=>observer.callback([{isIntersecting:near}]));
function Test(){const state=useGoogleReviews();window.state=state;return React.createElement('section',{ref:state.ref},'TEST DATA ONLY — '+state.status)}
window.mount=()=>{window.root=ReactDOM.createRoot(document.getElementById('test'));window.root.render(React.createElement(React.StrictMode,null,React.createElement(Test)))};
window.unmount=()=>window.root.unmount();window.mount();
</script>` }))
await page.route('**/api/google-reviews', route => { calls++; pending.push(route) })
const fixture = (average = 4.7, total = 37) => ({ source: 'google_business_profile', average, total,
  reviews: [{ id: 'TEST-DATA', author: 'TEST DATA ONLY', rating: 4, comment: 'Isolated browser fixture.', dateLabel: '20 de out. de 2026', sourceUrl: 'https://www.google.com/maps?cid=123' }], sourceUrl: 'https://www.google.com/maps?cid=123' })
const respond = async (body, status = 200, index = pending.length - 1) => {
  await pending[index].fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }).catch(() => {})
}
try {
  await page.goto('http://127.0.0.1:5173/ze091-hook-harness')
  await page.waitForFunction(() => !!window.state)
  assert.equal(calls, 0); await page.evaluate(() => window.enter(true)); await page.waitForFunction(() => window.state.status === 'loading')
  await page.waitForTimeout(100); assert.equal(calls, 1)
  results.push('Real React StrictMode lazy request dedup PASS')
  await respond({ error: { category: 'configuration' } }, 503)
  await page.waitForFunction(() => window.state.status === 'unavailable')
  assert.equal(await page.evaluate(() => window.state.data), null)
  await page.evaluate(() => window.state.retry()); assert.equal(calls, 1)
  await page.clock.fastForward(60000)
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); window.enter(false); window.enter(true) })
  assert.equal(calls, 1)
  results.push('A: no false data, cooldown, no automatic config-error storm PASS')
  await page.evaluate(() => window.state.retry()); await page.waitForTimeout(100); assert.equal(calls, 2)
  await respond(fixture()); await page.waitForFunction(() => window.state.status === 'verified')
  assert.equal(await page.evaluate(() => window.state.data.average), 4.7)
  results.push('B: same-page API activation via retry without code/reload/build PASS')
  await page.evaluate(() => { window.state.refresh(); window.dispatchEvent(new Event('focus')) }); assert.equal(calls, 2)
  await page.clock.fastForward(5 * 60000)
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); window.enter(false); window.enter(true) })
  await page.waitForTimeout(100); assert.equal(calls, 3)
  await page.waitForFunction(() => window.state.refreshing)
  assert.equal(await page.evaluate(() => window.state.data.average), 4.7)
  await respond(fixture(4.2, 38)); await page.waitForFunction(() => window.state.data?.average === 4.2)
  results.push('C: fresh cooldown + stale focus/visibility/reentry dedup + stable refreshed data PASS')
  await page.clock.fastForward(5 * 60000); await page.evaluate(() => window.state.refresh()); await page.waitForTimeout(100)
  await respond({ error: { category: 'upstream' } }, 500); await page.waitForFunction(() => window.state.refreshError)
  assert.equal(await page.evaluate(() => window.state.status), 'verified')
  await page.clock.fastForward(2000); await page.evaluate(() => window.state.retry()); await page.waitForTimeout(100)
  await respond(fixture(4.9, 39)); await page.waitForFunction(() => window.state.data?.average === 4.9 && !window.state.refreshError)
  results.push('D: temporary failure retains bounded data, error announced, controlled recovery PASS')
  const beforeExpiry = calls
  await page.clock.fastForward(15 * 60000); await page.waitForFunction(() => window.state.status === 'unavailable' && !window.state.data)
  assert.equal(calls, beforeExpiry)
  results.push('15 min hard expiry without request polling PASS')
  // Expiry also applies while a revalidation response is suspended.
  await page.evaluate(() => window.state.retry()); await page.waitForTimeout(100)
  await respond(fixture()); await page.waitForFunction(() => window.state.status === 'verified')
  await page.clock.fastForward(15 * 60000 - 5000)
  await page.evaluate(() => window.state.refresh()); await page.waitForTimeout(100)
  assert.equal(await page.evaluate(() => window.state.refreshing), true)
  await page.clock.fastForward(5000); await page.waitForFunction(() => !window.state.data && window.state.status === 'loading')
  await respond(fixture(4.6, 40)); await page.waitForFunction(() => window.state.data?.average === 4.6)
  results.push('Suspended refresh cannot display data beyond retention deadline; valid response recovers PASS')
  await page.clock.fastForward(5 * 60000); await page.evaluate(() => window.state.refresh()); await page.waitForTimeout(100)
  const abandoned = pending.length - 1
  await page.evaluate(() => window.unmount()); await page.clock.runFor(1); await page.evaluate(() => window.mount())
  await page.waitForTimeout(100); await page.evaluate(() => window.enter(true)); await page.waitForTimeout(100)
  const current = pending.length - 1
  assert.ok(current > abandoned)
  await respond(fixture(4.8, 41), 200, current); await page.waitForFunction(() => window.state.data?.average === 4.8)
  await respond(fixture(1, 1), 200, abandoned); await page.waitForTimeout(100)
  assert.equal(await page.evaluate(() => window.state.data.average), 4.8)
  results.push('Actual React unmount abort/remount and old response isolation PASS')
  assert.deepEqual(errors, [])
  results.push('No React/browser errors PASS')
  console.log(results.join('\n'))
} finally {
  fs.writeFileSync('.nox/evidence/ZE-09.1/hook-browser.json', JSON.stringify({ label: 'TEST DATA ONLY — mocked endpoint, real Chromium and React lifecycle', results, errors, expectedHttpErrors, calls }, null, 2))
  await browser.close()
}
