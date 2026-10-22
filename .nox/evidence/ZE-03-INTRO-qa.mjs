import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base='http://127.0.0.1:4210/'
const report={at:new Date().toISOString(),base,scope:'ZE-03 intro v4 and transparent original logo correction; no ZE-04 or production actions',mock:'Only /api/instagram-feed returns controlled 503 JSON; official feed integration outside scope',visualResult:'PENDING_MANUAL_REVIEW',checks:[],viewports:[]}
const check=(name,pass,evidence)=>report.checks.push({name,pass:!!pass,evidence})
const selectors={car:'.zelo-hero-car',wordmark:'.zelo-hero-wordmark',left:'.zelo-hero-slogan-left',right:'.zelo-hero-slogan-right'}
const screenshot=(name)=>fileURLToPath(new URL(`./ZE-03-INTRO-${name}.png`,import.meta.url))
const browser=await chromium.launch({headless:true})
async function setup(options={}) {
 const ctx=await browser.newContext({viewport:{width:1672,height:940},deviceScaleFactor:1,reducedMotion:'no-preference',...options})
 await ctx.route('**/api/instagram-feed',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'Controlled QA feed unavailability'}})}))
 const page=await ctx.newPage(),errors=[],requests=[]
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(new URL(r.url()).pathname))
 await page.addInitScript(()=>{
   window.__introStates=[]
   new MutationObserver(()=>{
     const current=document.querySelector('#hero')?.getAttribute('data-intro')
     if(current&&window.__introStates.at(-1)?.state!==current)window.__introStates.push({state:current,at:performance.now()})
   }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-intro']})
 })
 return {ctx,page,errors,requests}
}
async function settled(page){await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='settled',{},{timeout:15000});await page.evaluate(()=>document.fonts.ready)}
async function interactionChecks(page,label,mobile) {
 await page.getByRole('button',{name:'Buscar no site',exact:true}).click()
 await page.locator('#zelo-search-input').fill('higienizacao')
 check(`${label}: search opens, autofocus and accent-insensitive results`,await page.locator('#zelo-search-input').evaluate(x=>x===document.activeElement)&&await page.locator('.zelo-search-results a').count()>0,await page.locator('.zelo-search-results').innerText())
 await page.keyboard.press('Escape')
 check(`${label}: Escape closes search and returns focus`,await page.locator('#zelo-site-search').count()===0&&await page.getByRole('button',{name:'Buscar no site',exact:true}).evaluate(x=>x===document.activeElement))
 await page.getByRole('button',{name:'Buscar no site',exact:true}).click()
 await page.locator('#zelo-search-input').fill('xyz-sem-resultado')
 check(`${label}: search empty state`,await page.locator('.zelo-search-results a').count()===0&&await page.locator('.zelo-search-results p').count()===1,await page.locator('.zelo-search-results').innerText())
 await page.getByRole('button',{name:'Fechar busca'}).click()
 if(mobile){
   await page.getByRole('button',{name:'Abrir menu',exact:true}).click()
   await page.getByRole('button',{name:'Fechar menu',exact:true}).waitFor({state:'visible'})
   check(`${label}: mobile menu links`,await page.locator('#zelo-mobile-menu a[href^="#"]').count()===6)
   await page.locator('#zelo-mobile-menu a[href="#servicos"]').click()
   await page.locator('#zelo-mobile-menu').waitFor({state:'detached'})
 }else await page.locator('header a[href="#servicos"]').click()
 await page.waitForTimeout(1500)
 check(`${label}: navigation services`,new URL(page.url()).hash==='#servicos'&&await page.locator('header').evaluate(x=>x.classList.contains('zelo-site-header-dark')),await page.evaluate(()=>({hash:location.hash,scrollY,header:document.querySelector('header').className,section:document.querySelector('#servicos').getBoundingClientRect().toJSON()})))
 await page.locator('.zelo-header-brand').click()
 await page.waitForTimeout(700)
 check(`${label}: return hero remains settled`,await page.locator('#hero').getAttribute('data-intro')==='settled')
 await page.locator('.zelo-hero-scroll-hint').click()
 await page.waitForTimeout(650)
 check(`${label}: scroll hint targets services`,new URL(page.url()).hash==='#servicos'&&await page.evaluate(()=>scrollY)>300)
 await page.locator('.zelo-header-brand').click()
 await page.waitForTimeout(650)
 const original=page.url();let cta=null
 const stop=async route=>{cta=route.request().url();await route.abort()}
 await page.route('https://wa.me/**',stop)
 await page.locator('.zelo-header-budget').click({noWaitAfter:true})
 await page.waitForTimeout(150)
 check(`${label}: budget click reaches existing WhatsApp target`,!!cta&&/^https:\/\/wa\.me\/\d+/.test(cta),cta)
 await page.unroute('https://wa.me/**',stop)
 if(!page.url().startsWith(base))await page.goto(original)
}
try {
 for(const v of [
  {name:'reference',width:1672,height:940},
  {name:'desktop',width:1440,height:900},
  {name:'ultrawide',width:2560,height:1080},
  {name:'tablet',width:768,height:1024,mobile:true},
  {name:'mobile',width:390,height:844,mobile:true},
  {name:'compact',width:360,height:740,mobile:true}
 ]) {
  const {ctx,page,errors,requests}=await setup({viewport:{width:v.width,height:v.height},isMobile:!!v.mobile,hasTouch:!!v.mobile})
  try {
   const response=await page.goto(base,{waitUntil:'domcontentloaded'})
   check(`${v.name}: HTTP 200`,response.status()===200)
   await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='playing',{},{timeout:15000})
   const intro=await page.evaluate(selectors=>Object.fromEntries(Object.entries(selectors).map(([name,selector])=>{
     const el=document.querySelector(selector),cs=getComputedStyle(el),anim=el.getAnimations()[0]
     return [name,{animation:cs.animationName,opacity:cs.opacity,transform:cs.transform,keyframes:anim?.effect.getKeyframes()}]
   })),selectors)
   check(`${v.name}: four first-visit animations`,Object.values(intro).every(x=>x.animation.startsWith('zelo-')),intro)
   const leftX=parseFloat(intro.left.keyframes?.[0].transform?.match(/translate\((-?[\d.]+)px\)/)?.[1]),rightX=parseFloat(intro.right.keyframes?.[0].transform?.match(/translate\((-?[\d.]+)px\)/)?.[1])
   check(`${v.name}: opposite slogan ingress`,leftX<0&&rightX>0,{left:intro.left.keyframes,right:intro.right.keyframes})
   check(`${v.name}: car fade and premium reveal`,intro.car.keyframes?.[0].opacity==='0'&&intro.wordmark.keyframes?.[0].clipPath==='inset(0px 100% 0px 0px)',{car:intro.car.keyframes,wordmark:intro.wordmark.keyframes})
   if(v.name==='reference')await page.screenshot({path:screenshot('intro'),timeout:15000})
   await settled(page)
   const dom=await page.evaluate(()=>{
    const box=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}}
    const hero=document.querySelector('#hero'),car=document.querySelector('.zelo-hero-car'),bg=document.querySelector('.zelo-hero-backdrop'),img=car.querySelector('.zelo-hero-car-body'),header=document.querySelector('header')
    const ids=['hero','servicos','marcas','instagram','localizacao','contato','parceiros']
    return {states:window.__introStates,intro:hero.dataset.intro,stored:sessionStorage.getItem('zelo:hero-intro:v4'),hero:box(hero),car:box(car),carImage:[img.naturalWidth,img.naturalHeight],background:[bg.naturalWidth,bg.naturalHeight],wordmarkPaths:document.querySelectorAll('.zelo-hero-wordmark g path').length,layers:['.zelo-hero-stage','.zelo-hero-backdrop','.zelo-hero-car','.zelo-hero-edge-fade','.zelo-hero-wordmark','.zelo-hero-slogan-left','.zelo-hero-slogan-right','.zelo-hero-scroll-hint','header'].map(s=>({s,count:document.querySelectorAll(s).length})),slogans:[...document.querySelectorAll('.zelo-hero-slogan span')].map(el=>({text:el.textContent,box:box(el),font:getComputedStyle(el).fontSize,color:getComputedStyle(el).color,opacity:getComputedStyle(el).opacity})),header:{box:box(header),borderBottom:getComputedStyle(header).borderBottomWidth,shadow:getComputedStyle(header).boxShadow},sections:Object.fromEntries(ids.map(id=>[id,!!document.getElementById(id)])),services:document.querySelectorAll('.service-card').length,instagram:document.querySelectorAll('.instagram-tile').length,whatsapp:document.querySelectorAll('a[href*="wa.me"]').length,canvas:document.querySelectorAll('canvas').length,overflow:document.documentElement.scrollWidth-innerWidth,heroBytes:performance.getEntriesByType('resource').filter(x=>x.name.includes('/hero/')).map(x=>({name:new URL(x.name).pathname,bytes:x.transferSize})),totalTransferKB:Math.round(performance.getEntriesByType('resource').reduce((a,x)=>a+x.transferSize,0)/1024)}
   })
   check(`${v.name}: first visit recorded and settled`,dom.intro==='settled'&&dom.stored==='complete'&&dom.states.some(x=>x.state==='playing'),dom.states)
   check(`${v.name}: independent layers and four vector paths`,dom.layers.every(x=>x.count===1)&&dom.wordmarkPaths===4,dom.layers)
   check(`${v.name}: slogans literal, visible and fit`,dom.slogans[0].text==='MAIS QUE ESTÉTICA.'&&dom.slogans[1].text==='É VALORIZAÇÃO.'&&dom.slogans.every(x=>x.opacity==='1'&&x.box.x>=0&&x.box.x+x.box.width<=v.width+1),dom.slogans)
   if(v.name==='reference'){const b=dom.car,h=dom.hero;const fractions=[b.x/h.width,b.y/h.height,b.width/h.width,b.height/h.height];check(`${v.name}: car reference bounds (within five CSS px)`,fractions.every((x,i)=>Math.abs(x-[.2859,.4287,.4235,.3809][i])*(i%2?h.height:h.width)<=5),fractions)}
   check(`${v.name}: car preserves natural aspect ratio`,Math.abs(dom.car.width/dom.car.height-dom.carImage[0]/dom.carImage[1])<.015,{rendered:dom.car.width/dom.car.height,natural:dom.carImage[0]/dom.carImage[1]})
   const wordmark=await page.locator('.zelo-hero-wordmark').boundingBox()
   if(v.width<=600) {
    const left=dom.slogans[0].box,right=dom.slogans[1].box
    check(`${v.name}: first slogan above ZELO without overlap`,left.y+left.height<wordmark.y,{slogan:left,wordmark})
    check(`${v.name}: second slogan below ZELO without overlap`,right.y>wordmark.y+wordmark.height,{slogan:right,wordmark})
    check(`${v.name}: lower slogan stays above car`,right.y+right.height<dom.car.y,{slogan:right,car:dom.car})
   } else check(`${v.name}: outlined wordmark remains behind car`,wordmark.y+wordmark.height>=dom.car.y+10,{wordmark,car:dom.car})
   check(`${v.name}: vector lettering preserves aspect ratio`,Math.abs(wordmark.width/wordmark.height-825/286)<.015,{rendered:wordmark.width/wordmark.height,natural:825/286})
   const logo=await page.locator('.zelo-header-brand').evaluate(el=>{
    const img=el.querySelector('img')
    let renderedArtwork=null
    if(img?.naturalWidth){
     const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight
     const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data
     let minX=canvas.width,minY=canvas.height,maxX=0,maxY=0
     for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>32){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
     const b=img.getBoundingClientRect(),css=getComputedStyle(img),scale=css.objectFit==='contain'?Math.min(b.width/canvas.width,b.height/canvas.height):Math.max(b.width/canvas.width,b.height/canvas.height),offsetX=(b.width-canvas.width*scale)/2,offsetY=(b.height-canvas.height*scale)/2
     renderedArtwork={x:minX*scale+offsetX,y:minY*scale+offsetY,right:(maxX+1)*scale+offsetX,bottom:(maxY+1)*scale+offsetY,imageWidth:b.width,imageHeight:b.height,fit:css.objectFit}
    }
    return {imageCount:el.querySelectorAll('img').length,svgCount:el.querySelectorAll('svg').length,textContent:el.textContent.trim(),src:img?.currentSrc,naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,filter:img?getComputedStyle(img).filter:null,renderedArtwork}
   })
   check(`${v.name}: appbar uses actual local logo image`,logo.imageCount===1&&logo.svgCount===0&&logo.src?.includes('zelo_logo_png_optimized')&&logo.naturalWidth===640&&logo.naturalHeight===427,logo)
   check(`${v.name}: logo preserves original colors with image shadow only`,logo.filter==='none'||(logo.filter.includes('drop-shadow(')&&!/(brightness|contrast|grayscale|saturate|invert|sepia|hue-rotate|opacity)\(/.test(logo.filter)),logo.filter)
   const logoSurface=await page.locator('.zelo-header-brand').evaluate(el=>{
    const css=getComputedStyle(el),before=getComputedStyle(el,'::before'),after=getComputedStyle(el,'::after')
    return {background:css.backgroundColor,backgroundImage:css.backgroundImage,borders:[css.borderTopWidth,css.borderRightWidth,css.borderBottomWidth,css.borderLeftWidth],boxShadow:css.boxShadow,before:{content:before.content,background:before.backgroundColor,backgroundImage:before.backgroundImage},after:{content:after.content,background:after.backgroundColor,backgroundImage:after.backgroundImage}}
   })
   check(`${v.name}: transparent logo without background border or pseudo plate`,logoSurface.background==='rgba(0, 0, 0, 0)'&&logoSurface.backgroundImage==='none'&&logoSurface.borders.every(x=>x==='0px')&&logoSurface.boxShadow==='none'&&[logoSurface.before,logoSurface.after].every(x=>['none','normal'].includes(x.content)&&x.background==='rgba(0, 0, 0, 0)'&&x.backgroundImage==='none'),logoSurface)
   const artwork=logo.renderedArtwork
   check(`${v.name}: complete logo artwork fits without cropping`,artwork&&artwork.x>=-1&&artwork.y>=-1&&artwork.right<=artwork.imageWidth+1&&artwork.bottom<=artwork.imageHeight+1,artwork)
   check(`${v.name}: header without bottom line`,dom.header.borderBottom==='0px'&&dom.header.shadow==='none',dom.header)
   check(`${v.name}: existing business sections preserved`,Object.values(dom.sections).every(Boolean)&&dom.services===4&&dom.instagram===9&&dom.whatsapp>=2,dom.sections)
   check(`${v.name}: no canvas or GLB/Three requests`,dom.canvas===0&&!requests.some(x=>/\.glb$|three[-.]|react-three/.test(x)),requests)
   check(`${v.name}: no horizontal overflow`,dom.overflow<=1,dom.overflow)
   await page.screenshot({path:screenshot(v.name),timeout:15000})
   await page.locator('.zelo-header-brand').screenshot({path:screenshot(`${v.name}-logo`),timeout:15000})
   const contactClip={x:Math.max(0,dom.car.x-18),y:Math.max(0,dom.car.y+dom.car.height-75),width:Math.min(v.width,dom.car.width+36),height:Math.min(150,v.height-(dom.car.y+dom.car.height-75))}
   if(contactClip.x+contactClip.width>v.width)contactClip.width=v.width-contactClip.x
   await page.screenshot({path:screenshot(`${v.name}-tire-contact`),clip:contactClip,timeout:15000})
   await page.reload({waitUntil:'domcontentloaded'});await page.locator('#hero').waitFor()
   const reload=await page.locator('#hero').getAttribute('data-intro')
   check(`${v.name}: reload immediately settled`,reload==='settled',reload)
   await interactionChecks(page,v.name,!!v.mobile)
   check(`${v.name}: no JS exceptions`,errors.length===0,errors)
   report.viewports.push({name:v.name,viewport:v,dom,wordmark,logo,errors,requests,screenshot:screenshot(v.name),tireContactScreenshot:screenshot(`${v.name}-tire-contact`)})
  }catch(error){check(`${v.name}: execution completed`,false,error.stack)}finally{await ctx.close()}
 }
 for(const variant of ['reduced','storage-denied']){
  const {ctx,page,errors}=await setup({reducedMotion:variant==='reduced'?'reduce':'no-preference'})
  try{
   if(variant==='storage-denied')await page.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('QA denied','SecurityError')}}))
   await page.goto(base,{waitUntil:'domcontentloaded'})
   if(variant==='reduced'){
    await page.locator('#hero').waitFor();const value=await page.evaluate(()=>({state:document.querySelector('#hero').dataset.intro,animation:getComputedStyle(document.querySelector('.zelo-hero-car')).animationName,opacity:getComputedStyle(document.querySelector('.zelo-hero-car')).opacity}))
    check('reduced motion immediately complete without entrance',value.state==='settled'&&value.animation==='none'&&value.opacity==='1',value)
    await page.screenshot({path:screenshot('reduced')})
   }else{
    await settled(page);await page.locator('.zelo-hero-scroll-hint').click();await page.waitForTimeout(650);await page.locator('.zelo-header-brand').click();await page.waitForTimeout(650)
    check('storage denied uses document fallback without replay',await page.locator('#hero').getAttribute('data-intro')==='settled'&&errors.length===0,errors)
   }
  }catch(error){check(`${variant}: execution completed`,false,error.stack)}finally{await ctx.close()}
 }
}finally{await browser.close()}
report.result=report.checks.every(x=>x.pass)?'PASS':'FAIL'
await writeFile(new URL('./ZE-03-INTRO-qa-results.json',import.meta.url),JSON.stringify(report,null,2))
console.log(JSON.stringify({result:report.result,checks:report.checks.length,passed:report.checks.filter(x=>x.pass).length,failures:report.checks.filter(x=>!x.pass)},null,2))
if(report.result!=='PASS')process.exitCode=1
