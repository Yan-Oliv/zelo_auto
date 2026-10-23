import { chromium } from 'playwright'
import fs from 'node:fs'
const dir = '.nox/evidence/ZE-03-REWORK-POST-ZE09'
const browser = await chromium.launch(), checks = []
const record = (name, pass, data) => { checks.push({ name, pass, data }); if (!pass) throw Error(name) }
async function setup(options = {}) {
 const c = await browser.newContext({ viewport: { width: 1672, height: 940 }, ...options }), p = await c.newPage()
 await p.addInitScript(() => {
  localStorage.setItem('zelo:analytics-consent:v1', JSON.stringify({version:1,choice:'denied',savedAt:Date.now()}))
  window.__states = []
  new MutationObserver(() => { const state = document.querySelector('#hero')?.dataset.intro; if (state && window.__states.at(-1)?.state !== state) window.__states.push({state,at:performance.now()}) }).observe(document, {subtree:true,childList:true,attributes:true,attributeFilter:['data-intro']})
 })
 return { c, p }
}
try {
 const {c,p} = await setup({recordVideo:{dir:dir+'/video',size:{width:1672,height:940}}})
 let release; const gate = new Promise(resolve => { release = resolve })
 await p.route('**/hero/responsive/car-final-*', async route => { await gate; await route.continue() })
 await p.goto('http://127.0.0.1:5173/', {waitUntil:'domcontentloaded'})
 await p.waitForFunction(() => document.querySelector('#hero')?.dataset.intro === 'waiting')
 record('waiting before decoded artwork',true); release()
 await p.waitForFunction(() => document.querySelector('#hero')?.dataset.intro === 'playing')
 const start = Date.now(), frames = []
 for (const time of [0,400,800,1200,1800,3400]) {
  await p.waitForTimeout(Math.max(0,start+time-Date.now()))
  const data = await p.evaluate(() => Object.fromEntries(['stage','wordmark','car','slogan-left','slogan-right','scroll-hint'].map(n => { const s = getComputedStyle(document.querySelector('.zelo-hero-'+n)); return [n,{opacity:+s.opacity,transform:s.transform,clip:s.clipPath}] })))
  frames.push({time,data}); await p.screenshot({path:dir+'/intro-'+time+'.png'})
 }
 record('car opacity grows in rendered frames',frames[0].data.car.opacity < frames.at(-1).data.car.opacity,frames)
 record('wordmark progressively clipped',frames[1].data.wordmark.clip !== frames.at(-1).data.wordmark.clip)
 record('slogans render motion',frames[2].data['slogan-left'].transform !== frames.at(-1).data['slogan-left'].transform)
 const states = await p.evaluate(() => window.__states)
 record('waiting playing settled observed',states.map(x=>x.state).join(',') === 'waiting,playing,settled',states)
 await p.reload(); record('reload immediately settled',await p.locator('#hero').getAttribute('data-intro') === 'settled')
 await p.locator('.zelo-hero-scroll-hint').click(); await p.waitForTimeout(500); await p.locator('.zelo-header-brand').click()
 record('anchor return settled',await p.locator('#hero').getAttribute('data-intro') === 'settled'); await c.close()
 for (const variant of ['reduced','storage-blocked','asset-error','slow-art']) {
  const {c,p} = await setup({reducedMotion:variant==='reduced'?'reduce':'no-preference'})
  if (variant==='storage-blocked') await p.addInitScript(() => Object.defineProperty(window,'sessionStorage',{get(){throw Error('test')}}))
  if (variant==='asset-error') await p.route('**/*-final*',r=>r.abort())
  if (variant==='slow-art') await p.route('**/hero/responsive/car-final-*', async r=>{ await new Promise(resolve=>setTimeout(resolve,6000)); await r.continue().catch(()=>{}) })
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'})
  await p.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='settled',{},{timeout:10000}); record(variant+' settles',true)
  if (variant==='asset-error') {
   record('error fallback car decoded',await p.locator('.zelo-hero-car-body').evaluate(el=>el.complete&&el.naturalWidth>0))
   record('error fallback scene decoded',await p.locator('.zelo-hero-backdrop').evaluate(el=>el.complete&&el.naturalWidth>0))
  }
  await p.screenshot({path:dir+'/'+variant+'.png'}); await c.close()
 }
} finally { fs.writeFileSync(dir+'/animation-results.json',JSON.stringify({checks},null,2)); await browser.close() }
console.log(checks.map(({name,pass})=>({name,pass})))
