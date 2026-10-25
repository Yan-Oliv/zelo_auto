import fs from 'node:fs'
import crypto from 'node:crypto'
import lighthouse from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/index.js'
import * as launcher from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/chrome-launcher/dist/index.js'
import * as constants from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/config/constants.js'
import puppeteer from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'

const [variant='candidate', mode='mobile', state='cold', port='8888'] = process.argv.slice(2)
if (!/^[\w-]+$/.test(variant) || !['mobile','desktop'].includes(mode) || !['cold','warm'].includes(state) || !/^\d+$/.test(port)) throw new Error('Invalid benchmark arguments')
const dir='.nox/evidence/ZE-12/prerelease', url=`http://127.0.0.1:${port}/`
const chrome=await launcher.launch({chromeFlags:['--headless','--no-sandbox']})
let browser
try {
  browser=await puppeteer.connect({browserURL:'http://127.0.0.1:'+chrome.port,defaultViewport:null})
  const page=await browser.newPage()
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
  await page.evaluateOnNewDocument(()=>{
    window.__introSamples=[]; let last
    const timer=setInterval(()=>{
      const intro=document.querySelector('#hero')?.getAttribute('data-intro')
      if(intro&&intro!==last){last=intro;window.__introSamples.push({time:performance.now(),intro,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches})}
      if(intro==='settled')clearInterval(timer)
    },20)
  })
  const runtimeErrors=[]
  page.on('pageerror',error=>runtimeErrors.push(error.message))
  let sessionBefore=null
  if(state==='warm'){
    await page.setViewport(mode==='desktop'?{width:1440,height:900,deviceScaleFactor:1}:{width:412,height:823,deviceScaleFactor:1.75,isMobile:true})
    await page.goto(url)
    await page.waitForFunction(()=>sessionStorage.getItem('zelo:hero-intro:v4')==='complete',{timeout:15000})
    await page.waitForSelector('#servicos',{timeout:10000})
    await page.waitForNetworkIdle({idleTime:500,timeout:10000})
    sessionBefore=await page.evaluate(()=>({intro:document.querySelector('#hero')?.getAttribute('data-intro'),session:sessionStorage.getItem('zelo:hero-intro:v4')}))
  }
  const {lhr,artifacts}=await lighthouse(url,{
    port:chrome.port,onlyCategories:['performance','accessibility','best-practices','seo'],
    formFactor:mode,screenEmulation:mode==='desktop'?{mobile:false,width:1440,height:900,deviceScaleFactor:1}:constants.screenEmulationMetrics.mobile,
    emulatedUserAgent:constants.userAgents[mode],throttling:mode==='desktop'?constants.throttling.desktopDense4G:constants.throttling.mobileSlow4G,
    throttlingMethod:'simulate',disableStorageReset:state==='warm',pauseAfterLoadMs:4500,output:'json',logLevel:'error'
  },undefined,page)
  const metrics=lhr.audits.metrics.details.items[0]
  const name=`${variant}-${mode}-${state}`
  fs.writeFileSync(`${dir}/performance-native-${name}.json`,JSON.stringify(lhr))
  fs.writeFileSync(`${dir}/performance-native-${name}-trace.json`,JSON.stringify(artifacts.Trace))
  const html=await (await fetch(url)).text()
  const row={variant,mode,state,url,conditions:'Native Wrangler Pages transport with browser-negotiated Brotli. Fresh Chrome; explicit normal motion; cold has no preseeded storage. Warm completes a natural previsit, waits for #servicos and bounded network idle after intro, then reloads in same page/cache/session. CPU/network/UA explicitly profile-specific. APIs use isolated empty server configuration. Lighthouse simulated metrics and local observed trace are distinct; not field measurements. Warm results are descriptive, not compared to previous incomplete-cache/raw-transport warm profiles.',indexSHA256:crypto.createHash('sha256').update(html).digest('hex'),scores:Object.fromEntries(Object.entries(lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),LCP:metrics.largestContentfulPaint,observedLCP:metrics.observedLargestContentfulPaint,FCP:metrics.firstContentfulPaint,TBT:metrics.totalBlockingTime,CLS:metrics.cumulativeLayoutShift,intro:await page.evaluate(()=>window.__introSamples),sessionBefore,runtimeErrors,resources:lhr.audits['resource-summary'].details.items,breakdown:lhr.audits['lcp-breakdown-insight'].details.items,network:lhr.audits['network-requests'].details.items.map(({url,transferSize,networkRequestTime,networkEndTime})=>({url,bytes:transferSize,start:networkRequestTime,end:networkEndTime})),settings:lhr.configSettings}
  fs.writeFileSync(`${dir}/performance-native-${name}-summary.json`,JSON.stringify(row,null,2)+'\n')
  console.log(JSON.stringify({...row,resources:undefined,breakdown:undefined,network:undefined,settings:undefined}))
} finally {
  if(browser)await browser.disconnect()
  await chrome.kill()
}
