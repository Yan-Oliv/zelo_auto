// Runs the production bundle in an isolated browser origin; all traffic is routed locally or aborted.
// This is not a deployment and cannot establish reception in Google.
import {chromium} from 'playwright'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const browser=await chromium.launch(),results=[]
try{
for(const failure of ['adblock','tag-download-failure','google-unavailable','tag-timeout']){
 const page=await browser.newPage({reducedMotion:'reduce'})
 let tags=0,unexpected=0;const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url())
  if(url.hostname==='zelo.omnyatech.com.br'){
   const response=await fetch('http://127.0.0.1:4178'+url.pathname+url.search)
   const headers=Object.fromEntries(response.headers);delete headers['content-encoding'];delete headers['content-length']
   return route.fulfill({status:response.status,headers,body:Buffer.from(await response.arrayBuffer())})
  }
  if(url.hostname==='www.googletagmanager.com'){
   tags++
   if(failure==='adblock')return route.abort('blockedbyclient')
   if(failure==='tag-download-failure')return route.fulfill({status:503,body:''})
   if(failure==='tag-timeout'){await new Promise(r=>setTimeout(r,2000));return route.abort('timedout')}
   return route.fulfill({status:200,contentType:'application/javascript',body:'/* GA offline stub: no outbound requests. */'})
  }
  if(/google-analytics|analytics.google/.test(url.hostname))unexpected++
  return route.abort()
 })
 await page.goto('https://zelo.omnyatech.com.br/?email=private@example.test#token=DO_NOT_SEND')
 assert.equal(tags,0)
 await page.getByRole('button',{name:'Aceitar analytics',exact:true}).click();await page.waitForTimeout(500)
 assert.equal(tags,1);assert.equal(await page.locator('#zelo-ga4').count(),1)
 const script=await page.locator('#zelo-ga4').getAttribute('src');assert.equal(script,'https://www.googletagmanager.com/gtag/js?id=G-E9SKGKCQXX')
 assert.equal(await page.locator('#zelo-ga4').evaluate(el=>el.async),true)
 await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href^="https://wa.me"]'))e.preventDefault()}))
 await page.locator('.zelo-header-budget svg').first().click()
 const queue=await page.evaluate(()=>window.dataLayer.map(v=>Array.from(v)))
 assert.equal(queue.filter(v=>v[0]==='config').length,1)
 assert.equal(queue.filter(v=>v[0]==='event'&&v[1]==='page_view').length,1)
 assert.equal(queue.filter(v=>v[0]==='event'&&v[1]==='quote_click').length,1)
 assert.equal(queue.filter(v=>v[0]==='event'&&v[1]==='whatsapp_click').length,1)
 assert.equal(queue.find(v=>v[0]==='config')[2].send_page_view,false)
 assert.doesNotMatch(JSON.stringify(queue),/private@example|DO_NOT_SEND|wa\.me/)
 const consent=queue.filter(v=>v[0]==='consent');assert.equal(consent[0][1],'default')
 for(const command of consent)for(const name of ['ad_storage','ad_user_data','ad_personalization'])assert.equal(command[2][name],'denied')
 await page.evaluate(()=>{document.cookie='_ga=qa;path=/';document.cookie='_ga_TEST=qa;path=/'})
 await page.getByRole('button',{name:'Privacidade e cookies',exact:true}).click();await page.getByRole('button',{name:'Revogar analytics'}).click()
 assert.equal(await page.evaluate(()=>window['ga-disable-G-E9SKGKCQXX']),true)
 assert.doesNotMatch(await page.evaluate(()=>document.cookie),/_ga/)
 assert.equal(await page.evaluate(()=>window.dataLayer.filter(v=>v[0]==='event').length),0)
 await page.locator('.zelo-header-budget').click()
 assert.equal(await page.evaluate(()=>window.dataLayer.filter(v=>v[0]==='event').length),0)
 await page.getByRole('button',{name:'Privacidade e cookies',exact:true}).click()
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Salvar preferências'}).click()
 assert.equal(tags,1)
 assert.deepEqual(errors,[]);assert.equal(unexpected,0)
 results.push({failure,result:'PASS',tagRequests:tags,tagAsync:true,configCount:1,pageviewCount:1,sanitized:true,revocationStops:true,cookiesRemoved:true,reactErrors:0,realAnalyticsRequests:0})
 await page.close()
}
}catch(error){results.push({result:'FAIL',error:error.stack});process.exitCode=1}
await browser.close();fs.writeFileSync('.nox/evidence/ZE-08/qa-production-simulation.json',JSON.stringify({scope:'Production build under locally routed official browser origin; no deployment or real GA receipt',results},null,2));console.log(JSON.stringify(results,null,2))
