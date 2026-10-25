import fs from 'node:fs'
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import sharp from 'sharp'
const base='http://127.0.0.1:8890',dir='.nox/evidence/ZE-12/prerelease/qa-actual'
fs.mkdirSync(dir,{recursive:true})
const report={scope:'Exact isolated candidate676f1a5; actual local Pages runtime and intentionally unconfigured APIs. Not post-deploy or genuine Google validation.',http:[],screens:[],groups:[]}
for(const [url,status,type]of [['/',200,'html'],['/ze12-no-such-page',404,'html'],['/500',200,'html'],['/503',200,'html'],['/api/instagram-feed',503,'json'],['/api/google-reviews',503,'json'],['/robots.txt',200,'text'],['/sitemap.xml',200,'xml']]){
 const r=await fetch(base+url);const contentType=r.headers.get('content-type')??'';assert.equal(r.status,status,url);assert.ok(contentType.includes(type),url);report.http.push({url,status:r.status,contentType,cacheControl:r.headers.get('cache-control')})
}
const browser=await chromium.launch()
try{
for(const width of[1440,390]){
 const context=await browser.newContext({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],analytics=[]
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/googletagmanager|google-analytics\.com/.test(r.url()))analytics.push(r.url())})
 await page.addInitScript(()=>{localStorage.setItem('zelo:analytics-consent:v1',JSON.stringify({version:1,choice:'granted',savedAt:Date.now()}))})
 await page.goto(base);await page.locator('#servicos').waitFor();await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=innerHeight*.65){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)});await page.waitForTimeout(1200);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.querySelector('.ze4-page')?.dataset.editorialFont==='ready')
 assert.equal(await page.locator('.ze4-instagram-tile').count(),0);assert.equal(await page.locator('.ze4-review-score,.ze4-review-avatar').count(),0);assert.equal(await page.locator('#avaliacoes').getAttribute('data-reviews-state'),'unavailable');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);assert.deepEqual(analytics,[])
 const full=`${dir}/LOCAL-unconfigured-full-${width}.png`;await page.screenshot({path:full,fullPage:true});report.screens.push(full)
 for(const [label,selectors]of [['1-hero',['#hero']],['2-services-results',['#servicos','#resultados']],['3-process-quality',['#processo','#marcas']],['4-community',['.ze4-community']],['5-location-footer',['#localizacao','footer']]]){
  const a=await page.locator(selectors[0]).boundingBox(),b=await page.locator(selectors.at(-1)).boundingBox();const y=Math.max(0,Math.floor(a.y)),height=Math.ceil(b.y+b.height-y);const file=`${dir}/LOCAL-unconfigured-${label}-${width}.png`;await sharp(full).extract({left:0,top:y,width,height}).toFile(file);report.screens.push(file)
 }
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>({href:e.href,name:e.getAttribute('aria-label')??e.textContent})))
 for(const href of['https://www.vonixx.com.br/','https://vintex.com.br/','https://zacs.com.br/','https://www.instagram.com/skgclub.lamartine/'])assert.ok(links.some(x=>x.href===href),href)
 assert.equal(await page.locator('#parceiros a').count(),1)
 report.groups.push({name:`Actual local unavailable integrations, links and noncanonical analytics ${width}`,status:'PASS',noMockedProviderData:true,noRuntimeErrors:true,noAnalyticsRequestsDespiteConsent:true})
 await context.close()
}
}finally{await browser.close();fs.writeFileSync(dir+'/results.json',JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({HTTP:report.http.length,groups:report.groups.length,screens:report.screens.length}))
