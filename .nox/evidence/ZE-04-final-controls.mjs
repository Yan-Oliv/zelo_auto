import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
const checks=[],check=(name,pass,evidence)=>{checks.push({name,pass:!!pass,evidence});if(!pass)console.log('FAIL',name,evidence)}
const b=await chromium.launch()
for(const width of [1920,390]){
 const c=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<600,isMobile:width<600}),p=await c.newPage();await c.route('**/api/instagram-feed',r=>r.fulfill({status:503,contentType:'application/json',body:'{"error":{"message":"QA"}}'}));await p.goto('http://127.0.0.1:4210/');await p.waitForTimeout(400)
 const links=await p.locator('header nav a').evaluateAll(xs=>xs.map(x=>({href:x.getAttribute('href'),label:x.textContent})))
 for(const link of links){
  if(width<600){await p.getByRole('button',{name:'Abrir menu',exact:true}).click();await p.locator(`#zelo-mobile-menu a[href="${link.href}"]`).click();await p.locator('#zelo-mobile-menu').waitFor({state:'detached'})}else await p.locator(`header nav a[href="${link.href}"]`).click()
  await p.waitForTimeout(450);const state=await p.evaluate(href=>{const t=document.querySelector(href),header=document.querySelector('header');return{hash:location.hash,top:t.getBoundingClientRect().top,header:header.getBoundingClientRect().bottom,current:document.querySelector('header nav a[aria-current]')?.getAttribute('href'),dark:header.classList.contains('zelo-site-header-dark')}},link.href)
  check(`${width}: navigation ${link.label} reaches accessible section`,state.hash===link.href&&(link.href==='#hero'||state.top>=state.header-2),state)
  check(`${width}: navigation ${link.label} active aria-current`,state.current===link.href,state)
 }
 const outgoing=await p.locator('a[href^="https:"]').evaluateAll(xs=>xs.map(x=>({href:x.href,label:x.getAttribute('aria-label')||x.textContent.trim(),target:x.target,rel:x.rel})))
 check(`${width}: all outgoing links use existing real channels`,outgoing.every(x=>/^https:\/\/(wa\.me\/5564996161968|www\.instagram\.com\/zelo_autoestetica\/|maps\.app\.goo\.gl\/9twSEgWic6k4YYyf7)/.test(x.href)),outgoing)
 // Navigation blocked in QA after actual user click; no message or form sent.
 let captured=[];await c.route('https://wa.me/**',async r=>{captured.push(r.request().url());await r.abort()})
 for(let i=0;i<4;i++){const a=p.locator('.ze4-service-action').nth(i);const popup=p.waitForEvent('popup');await a.click();const out=await popup;await out.waitForTimeout(100);await out.close()}
 check(`${width}: four service actions open real WhatsApp URL`,captured.length===4&&captured.every(x=>x.includes('wa.me/5564996161968')),captured)
 await p.getByRole('button',{name:'Buscar no site',exact:true}).click();await p.locator('#zelo-search-input').fill('localizacao');await p.locator('.zelo-search-results a').click();await p.waitForTimeout(450)
 check(`${width}: search navigation lands location and closes`,new URL(p.url()).hash==='#localizacao'&&await p.locator('#zelo-site-search').count()===0)
 if(width<600){await p.getByRole('button',{name:'Abrir menu',exact:true}).click();await p.keyboard.press('Escape');await p.waitForTimeout(450);check(`${width}: mobile menu Escape closes and restores focus`,await p.locator('#zelo-mobile-menu').count()===0&&await p.getByRole('button',{name:'Abrir menu',exact:true}).evaluate(x=>x===document.activeElement),{menuCount:await p.locator('#zelo-mobile-menu').count()});if(await p.locator('#zelo-mobile-menu').count())await p.getByRole('button',{name:'Fechar menu',exact:true}).click()}
 await p.keyboard.press('Tab');await p.locator('.ze4-results-actions .ze4-button-outline').focus();const focus=await p.locator('.ze4-results-actions .ze4-button-outline').evaluate(x=>({outline:getComputedStyle(x).outlineStyle,width:getComputedStyle(x).outlineWidth}));check(`${width}: keyboard focus visible`,focus.outline==='solid'&&parseFloat(focus.width)>=2,focus)
 await c.close()
}
await b.close();const report={at:new Date().toISOString(),scope:'ZE-04 control and anchor regression, local-only, external navigation blocked at transport',checks,summary:{pass:checks.filter(x=>x.pass).length,fail:checks.filter(x=>!x.pass).length}};await writeFile(new URL('./ZE-04-final-controls.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary))
