import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import lighthouse from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/index.js'
import * as launcher from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/chrome-launcher/dist/index.js'
import * as constants from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/config/constants.js'
import puppeteer from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'
const phase=process.argv[2]??'final',dir='.nox/evidence/ZE-11',root=phase==='baseline'?dir+'/baseline-dist':'dist',url='http://127.0.0.1:4211/'
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'}
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(req.url.split('?')[0])
 if(u.startsWith('/api/')){res.writeHead(503,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({error:{category:'configuration'}}));return}
 const f=path.resolve(root,u.replace(/^\/+/, '')||'index.html')
 if(!f.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return}
 res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream',...(u.startsWith('/assets/')?{'cache-control':'public,max-age=31536000,immutable'}:{})});res.end(fs.readFileSync(f))
})
await new Promise(r=>server.listen(4211,'127.0.0.1',r))
const summary={phase,root,baselineCommit:'0827b0d',conditions:'One sequential sample/scenario. Explicit normal motion via CDP; host default reduced motion measured separately. Fresh Chrome per profile, cold without session. Warm natural previsit completes intro then same page/session/cache. Explicit mobileSlow4G CPU4 and desktopDense4G CPU1 with correct UA. APIs503 deterministic. Local uncompressed static transport, identical to authoritative motion baseline; gzip diagnostics separate. pauseAfterLoad4500ms. Simulated LCP and unthrottled observed trace LCP are distinct, not field measurements.',runs:[]}
try {
 for(const[mode,state]of[['mobile','cold'],['mobile','warm'],['desktop','cold'],['desktop','warm']]) {
  const chrome=await launcher.launch({chromeFlags:['--headless','--no-sandbox']})
  const browser=await puppeteer.connect({browserURL:'http://127.0.0.1:'+chrome.port,defaultViewport:null})
  const page=await browser.newPage()
  try {
   const hostReduce=await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
   await page.evaluateOnNewDocument(()=>{window.__introSamples=[];let last;const id=setInterval(()=>{const intro=document.querySelector('#hero')?.getAttribute('data-intro');if(intro&&intro!==last){last=intro;window.__introSamples.push({time:performance.now(),intro,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches})}if(intro==='settled')clearInterval(id)},20)})
   let sessionBefore=null
   if(state==='warm'){
    await page.setViewport(mode==='desktop'?{width:1440,height:900,deviceScaleFactor:1}:{width:412,height:823,deviceScaleFactor:1.75,isMobile:true})
    await page.goto(url)
    await page.waitForFunction(()=>sessionStorage.getItem('zelo:hero-intro:v4')==='complete',{timeout:15000})
    sessionBefore=await page.evaluate(()=>({intro:document.querySelector('#hero')?.getAttribute('data-intro'),session:sessionStorage.getItem('zelo:hero-intro:v4')}))
   }
   const {lhr,artifacts}=await lighthouse(url,{port:chrome.port,onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:mode,screenEmulation:mode==='desktop'?{mobile:false,width:1440,height:900,deviceScaleFactor:1}:constants.screenEmulationMetrics.mobile,emulatedUserAgent:constants.userAgents[mode],throttling:mode==='desktop'?constants.throttling.desktopDense4G:constants.throttling.mobileSlow4G,throttlingMethod:'simulate',disableStorageReset:state==='warm',pauseAfterLoadMs:4500,output:'json',logLevel:'error'},undefined,page)
   const name=`${mode}-${state}-plain`
   fs.writeFileSync(`${dir}/performance-${phase}-${name}.json`,JSON.stringify(lhr))
   fs.writeFileSync(`${dir}/performance-${phase}-${name}-trace.json`,JSON.stringify(artifacts.Trace))
   const metrics=lhr.audits.metrics.details.items[0]
   const row={mode,state,transport:'plain',hostReduce,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),LCP:metrics.largestContentfulPaint,observedLCP:metrics.observedLargestContentfulPaint,FCP:metrics.firstContentfulPaint,TBT:metrics.totalBlockingTime,CLS:metrics.cumulativeLayoutShift,introSamples:await page.evaluate(()=>window.__introSamples),sessionBefore,resources:lhr.audits['resource-summary'].details.items,network:lhr.audits['network-requests'].details.items.map(x=>({url:x.url,start:x.networkRequestTime,end:x.networkEndTime,bytes:x.transferSize})),breakdown:lhr.audits['lcp-breakdown-insight'].details.items,settings:lhr.configSettings}
   summary.runs.push(row)
   fs.writeFileSync(`${dir}/performance-${phase}-summary.json`,JSON.stringify(summary,null,2)+'\n')
   console.log(JSON.stringify({...row,network:undefined,breakdown:undefined,settings:undefined}))
  }finally{await browser.disconnect();await chrome.kill()}
 }
}finally{await new Promise(r=>server.close(r))}
