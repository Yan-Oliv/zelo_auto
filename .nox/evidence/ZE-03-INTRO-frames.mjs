import {chromium} from 'playwright'
import {writeFile,mkdir} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'

const base='http://127.0.0.1:4210/'
const directory=fileURLToPath(new URL('./',import.meta.url))
const artifact=name=>directory+'ZE-03-INTRO-'+name
const report={at:new Date().toISOString(),base,method:'Real wall-clock progression; no animation pause/currentTime/finish or screenshot animation disabling. Visibility test explicitly simulates the document Visibility API.',checks:[],runs:[]}
const check=(name,pass,evidence)=>report.checks.push({name,pass:!!pass,evidence})
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const browser=await chromium.launch({headless:true})
async function context(options={}){
 const ctx=await browser.newContext({viewport:{width:1672,height:940},deviceScaleFactor:1,reducedMotion:'no-preference',...options})
 await ctx.route('**/api/instagram-feed',r=>r.fulfill({status:503,contentType:'application/json',body:'{"error":{"message":"Controlled QA feed unavailability"}}'}))
 await ctx.addInitScript(()=>{
  window.__initialHeroStorage={v3:sessionStorage.getItem('zelo:hero-intro:v3'),v4:sessionStorage.getItem('zelo:hero-intro:v4')}
  window.__heroSamples=[]
  window.__sampleHero=()=>{
   const hero=document.querySelector('#hero')
   if(!hero)return null
   const one=selector=>{
    const el=document.querySelector(selector)
    if(!el)return null
    const css=getComputedStyle(el)
    return {opacity:Number(css.opacity),transform:css.transform,clip:css.clipPath,animation:css.animationName,duration:css.animationDuration,delay:css.animationDelay}
   }
   const car=document.querySelector('.zelo-hero-car-body'),scene=document.querySelector('.zelo-hero-backdrop')
   return {at:performance.now(),state:hero.dataset.intro,visibility:document.visibilityState,fonts:document.fonts.status,carReady:!!car?.complete&&car.naturalWidth>0,sceneReady:!!scene?.complete&&scene.naturalWidth>0,stored:sessionStorage.getItem('zelo:hero-intro:v4'),layers:{car:one('.zelo-hero-car'),left:one('.zelo-hero-slogan-left'),right:one('.zelo-hero-slogan-right'),wordmark:one('.zelo-hero-wordmark'),header:one('.zelo-header-brand'),hint:one('.zelo-hero-scroll-hint'),scene:one('.zelo-hero-stage')},headerParts:{brand:one('.zelo-header-brand'),navigation:one('.zelo-header-nav a'),budget:one('.zelo-header-budget'),search:one('.zelo-header-search'),menu:one('.zelo-header-menu')}}
  }
  let last=-100
  function sample(now){if(now-last>=45){const value=window.__sampleHero();if(value&&window.__heroSamples.length<450)window.__heroSamples.push(value);last=now}requestAnimationFrame(sample)}
  requestAnimationFrame(sample)
 })
 return ctx
}
try{
 for(const v of [{name:'desktop',width:1672,height:940},{name:'mobile',width:390,height:844}]){
  await mkdir(artifact('video-temp'),{recursive:true})
  const ctx=await context({viewport:{width:v.width,height:v.height},isMobile:v.name==='mobile',hasTouch:v.name==='mobile',recordVideo:{dir:artifact('video-temp'),size:{width:v.width,height:v.height}}})
  await ctx.addInitScript(()=>{
   if(!sessionStorage.getItem('__qa:hero-v3-seeded')){
    sessionStorage.setItem('zelo:hero-intro:v3','complete');sessionStorage.removeItem('zelo:hero-intro:v4');sessionStorage.setItem('__qa:hero-v3-seeded','complete')
   }
  })
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
  const video=page.video()
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'})
   await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='playing',{},{timeout:20000})
   const started=Date.now(),frames=[]
   for(const [index,target] of [0,350,900,1600,2500,3600,5000].entries()){
    await wait(Math.max(0,target-(Date.now()-started)))
    const sample=await page.evaluate(()=>window.__sampleHero())
    const path=artifact(`${v.name}-frame-${String(index).padStart(2,'0')}.png`)
    await page.screenshot({path,timeout:15000})
    frames.push({index,targetMs:target,actualMs:Date.now()-started,sample,path})
   }
   await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='settled',{},{timeout:20000})
   const samples=await page.evaluate(()=>window.__heroSamples)
   const played=samples.filter(x=>x.state==='playing'),final=await page.evaluate(()=>window.__sampleHero())
   check(`${v.name}: v3 complete does not suppress v4 intro`,played.length>0&&await page.evaluate(()=>sessionStorage.getItem('zelo:hero-intro:v3'))==='complete',{played:played.length})
   check(`${v.name}: intro begins only after decoded assets and fonts`,played.length>0&&played.every(x=>x.carReady&&x.sceneReady&&x.fonts==='loaded'),played.slice(0,3))
   check(`${v.name}: actual car fade has visible intermediate frames`,played.some(x=>x.layers.car.opacity===0)&&played.some(x=>x.layers.car.opacity>.05&&x.layers.car.opacity<.95)&&final.layers.car.opacity===1,{first:played[0]?.layers.car,last:final.layers.car})
   for(const layer of ['left','right','wordmark','header','hint','scene']){
    const values=samples.map(x=>x.layers[layer]).filter(Boolean)
    check(`${v.name}: ${layer} visibly transitions in real elapsed time`,values.some(x=>x.opacity<.95)&&values.some(x=>x.opacity>=.99),{first:values[0],last:values.at(-1),uniqueOpacities:new Set(values.map(x=>x.opacity)).size})
   }
   const reveal=played.map(x=>x.layers.wordmark.clip)
   check(`${v.name}: ZELO real clip changes over time`,new Set(reveal).size>3,{first:reveal[0],last:reveal.at(-1),distinct:new Set(reveal).size})
   check(`${v.name}: animation persists long enough for perceptible entrance`,played.at(-1)?.at-played[0]?.at>=2200,{playingDurationMs:played.at(-1)?.at-played[0]?.at})
   check(`${v.name}: intro stored only for v4 and complete after entrance`,final.state==='settled'&&final.stored==='complete',final)
   await page.screenshot({path:artifact(`${v.name}-final.png`)})
   await page.reload({waitUntil:'domcontentloaded'});await page.locator('#hero').waitFor()
   const reload=await page.evaluate(()=>({state:document.querySelector('#hero').dataset.intro,sample:window.__sampleHero()}))
   check(`${v.name}: v4 complete refresh immediately settled`,reload.state==='settled',reload)
   await page.locator('.zelo-hero-scroll-hint').click();await wait(700);await page.locator('.zelo-header-brand').click();await wait(700)
   check(`${v.name}: return navigation never replays v4`,await page.locator('#hero').getAttribute('data-intro')==='settled')
   check(`${v.name}: video run has no JS exception`,errors.length===0,errors)
   report.runs.push({name:v.name,frames,samples,final,reload,errors,video:artifact(`${v.name}-intro.webm`)})
  }catch(error){check(`${v.name}: real frames/video execution completed`,false,error.stack)}finally{
   await ctx.close();await video.saveAs(artifact(`${v.name}-intro.webm`))
  }
 }
 for(const mode of ['delayed-assets-fonts','hidden-visibility-api','reduced']){
  const ctx=await context({reducedMotion:mode==='reduced'?'reduce':'no-preference'})
  if(mode==='delayed-assets-fonts'){
   await ctx.route('**/hero/car-reference.webp',async r=>{await wait(1800);await r.continue()})
   await ctx.route(/\/assets\/Montserrat-.*\.otf$/,async r=>{await wait(1400);await r.continue()})
  }
  if(mode==='hidden-visibility-api')await ctx.addInitScript(()=>{
   window.__qaVisibility='hidden'
   Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.__qaVisibility})
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__qaVisibility==='hidden'})
  })
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'})
   await page.locator('#hero').waitFor()
   if(mode==='reduced'){
    const value=await page.evaluate(()=>window.__sampleHero())
    check('reduced motion bypasses all seven entrance layers immediately',value.state==='settled'&&Object.values(value.layers).every(x=>x.opacity===1&&x.animation==='none'),value)
   }else{
    await wait(mode==='delayed-assets-fonts'?200:2200)
    const before=await page.evaluate(()=>window.__sampleHero())
    check(`${mode}: v4 not consumed before readiness/visibility`,before.state==='waiting'&&before.stored===null,before)
    if(mode==='hidden-visibility-api')await page.evaluate(()=>{window.__qaVisibility='visible';document.dispatchEvent(new Event('visibilitychange'))})
    await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='playing',{},{timeout:15000})
    const playing=await page.evaluate(()=>window.__sampleHero())
    check(`${mode}: intro starts after condition cleared`,playing.visibility==='visible'&&playing.carReady&&playing.sceneReady&&playing.fonts==='loaded',playing)
    await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='settled',{},{timeout:15000})
    report.runs.push({name:mode,before,playing})
   }
   check(`${mode}: no JS exceptions`,errors.length===0,errors)
  }catch(error){check(`${mode}: execution completed`,false,error.stack)}finally{await ctx.close()}
 }
}finally{await browser.close()}
report.result=report.checks.every(x=>x.pass)?'PASS':'FAIL'
await writeFile(artifact('frames-results.json'),JSON.stringify(report,null,2))
console.log(JSON.stringify({result:report.result,checks:report.checks.length,passed:report.checks.filter(x=>x.pass).length,failures:report.checks.filter(x=>!x.pass)},null,2))
if(report.result!=='PASS')process.exitCode=1
