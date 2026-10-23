import { chromium } from 'playwright'
import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base='http://127.0.0.1:4210/'
const path=n=>fileURLToPath(new URL(`./ZE-04-final-${n}`,import.meta.url))
const report={at:new Date().toISOString(),base,scope:'ZE-04 read-only product QA; evidence files only',limitations:['Only Instagram endpoint intercepted for deterministic error/loading/empty/fixture states; fixture is QA data, not a claim of official data.','Screenshots named section omit fixed header only during capture; fullpage uses actual header.','Visual review is technical comparison, not user approval.'],checks:[],viewports:[],console:[],maps:[]}
const check=(name,pass,evidence)=>{report.checks.push({name,pass:!!pass,evidence});if(!pass)console.log('FAIL',name,JSON.stringify(evidence))}
const browser=await chromium.launch({headless:true})
const sections={hero:'#hero',services:'#servicos',results:'#resultados',process:'#processo',quality:'#marcas',community:'.ze4-community',location:'#localizacao',footer:'footer'}
async function setup(v,reduced=false,feed='error'){
 const ctx=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,isMobile:v.width<=768,hasTouch:v.width<=768,reducedMotion:reduced?'reduce':'no-preference'})
 await ctx.route('**/api/instagram-feed',async r=>{
  if(feed==='loading')await new Promise(resolve=>setTimeout(resolve,2000))
  const payload=feed==='fixture'?{data:[{id:'qa-contract-image',media_url:`${base}editorial/service-wash.webp`,caption:'QA contract fixture',permalink:'https://www.instagram.com/p/QA_CONTRACT_FIXTURE/'},{id:'qa-contract-video',thumbnail_url:`${base}editorial/process-detail.webp`,media_type:'VIDEO',caption:'QA video fixture'},{id:'qa-contract-album',media_type:'CAROUSEL_ALBUM',caption:'QA album fixture',children:{data:[{id:'child',media_url:`${base}editorial/service-seats.webp`}]}}]}:{data:[]}
  await r.fulfill({status:feed==='error'?503:200,contentType:'application/json',body:JSON.stringify(feed==='error'?{error:{message:'Controlled QA 503'}}:payload)})
 })
 const page=await ctx.newPage(),errors=[],consoleErrors=[],requests=[]
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push({text:m.text(),location:m.location()})});page.on('request',r=>requests.push(r.url()))
 await page.addInitScript(()=>{window.__states=[];new MutationObserver(()=>{const s=document.querySelector('#hero')?.dataset.intro;if(s&&window.__states.at(-1)?.state!==s)window.__states.push({state:s,at:performance.now()})}).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-intro']})})
 return {ctx,page,errors,consoleErrors,requests}
}
async function settle(page){await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='settled',null,{timeout:20000})}
async function scrollTo(page,selector){await page.locator(selector).evaluate(el=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,el.getBoundingClientRect().top+scrollY-180)});await page.waitForTimeout(1350)}
async function revealAll(page,selector){const b=await page.locator(selector).boundingBox(),start=b.y+await page.evaluate(()=>scrollY);for(let y=start;y<start+b.height;y+=Math.max(250,await page.evaluate(()=>innerHeight*.65))){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(180)}await page.waitForTimeout(1300);await scrollTo(page,selector)}
async function snap(page,name,selector){if(selector)await page.locator(selector).screenshot({path:path(`${name}.png`),animations:'allow'});else await page.screenshot({path:path(`${name}.png`),fullPage:true,animations:'allow'})}
try{
 for(const v of [{name:'1920',width:1920,height:1080},{name:'1440',width:1440,height:900},{name:'1366',width:1366,height:768},{name:'768',width:768,height:1024},{name:'390',width:390,height:844},{name:'360',width:360,height:740}]){
  const {ctx,page,errors,consoleErrors,requests}=await setup(v)
  try{
   const response=await page.goto(base,{waitUntil:'domcontentloaded'});check(`${v.name}: HTTP`,response.status()===200,response.status())
   await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.intro==='playing',null,{timeout:20000})
   const intro=await page.locator('#hero').evaluate(el=>[...el.querySelectorAll('.zelo-hero-car,.zelo-hero-wordmark,.zelo-hero-slogan-left,.zelo-hero-slogan-right')].map(x=>({class:x.className.baseVal||x.className,animation:getComputedStyle(x).animationName,opacity:getComputedStyle(x).opacity,frames:x.getAnimations()[0]?.effect.getKeyframes()})))
   check(`${v.name}: preserved four intro animations`,intro.length===4&&intro.every(x=>x.animation.startsWith('zelo-')),intro)
   await settle(page)
   check(`${v.name}: intro stored`,await page.evaluate(()=>sessionStorage.getItem('zelo:hero-intro:v4'))==='complete')
   const initial=await page.evaluate(()=>({lazy:[...document.querySelectorAll('.ze4-page section:not(#hero) img')].map(x=>({src:x.getAttribute('src'),lazy:x.loading,width:x.getAttribute('width'),height:x.getAttribute('height')})),overflow:document.documentElement.scrollWidth-innerWidth,canvas:document.querySelectorAll('canvas').length,anchors:[...document.querySelectorAll('a[href^="#"]')].map(x=>({href:x.getAttribute('href'),exists:!!document.getElementById(x.getAttribute('href').slice(1))})),headerBorder:getComputedStyle(document.querySelector('header')).borderBottomWidth}))
   check(`${v.name}: no horizontal overflow`,initial.overflow===0,initial.overflow)
   check(`${v.name}: image lazy and dimensions`,initial.lazy.every(x=>x.lazy==='lazy'&&x.width&&x.height),initial.lazy)
   check(`${v.name}: anchors resolve`,initial.anchors.every(x=>x.exists),initial.anchors)
   check(`${v.name}: no canvas/no header separator`,initial.canvas===0&&initial.headerBorder==='0px',initial)
   // Real viewport entrance, natural animation time, no clock or animation suspension.
   await page.locator('#servicos').evaluate(el=>window.scrollTo(0,el.offsetTop-100))
   const samples=[]
   for(const delay of [0,100,180,650]){await page.waitForTimeout(delay);samples.push(await page.locator('.ze4-service-card').evaluateAll(xs=>xs.map(x=>({opacity:Number(getComputedStyle(x).opacity),transform:getComputedStyle(x).transform}))))}
   check(`${v.name}: service first viewport entrances reach visible`,samples.at(-1).slice(0,v.width<=360?1:v.width<=540?2:4).every(x=>x.opacity>.99),samples)
   if(v.width>=1366)check(`${v.name}: service real stagger frames`,samples.some(s=>s[0].opacity>s[3].opacity+.02),samples)
   const card=page.locator('.ze4-service-card').first();await card.hover();await page.waitForTimeout(450)
   const hover=await card.locator('img').evaluate(x=>getComputedStyle(x).transform)
   check(`${v.name}: service real hover zoom`,hover!=='none'&&Number(hover.match(/matrix\(([^,]+)/)?.[1])>1.02,hover)
   check(`${v.name}: four service budget links`,await page.locator('.ze4-service-card').count()===4&&await page.locator('.ze4-service-action').evaluateAll(xs=>xs.every(x=>x.href.includes('wa.me/5564996161968')&&x.getAttribute('aria-label')?.includes('orçamento'))))
   await scrollTo(page,'#resultados')
   const sliders=page.locator('.ze4-comparison input[type=range]')
   check(`${v.name}: three distinct demonstrative pairs start 50`,await sliders.count()===3&&await sliders.evaluateAll(xs=>xs.every(x=>x.value==='50'))&&await page.locator('.ze4-comparison').evaluateAll(xs=>xs.every(x=>new Set([...x.querySelectorAll('img')].map(i=>i.src)).size===2&&x.textContent.includes('não é resultado real da Zelo'))))
   for(let i=0;i<3;i++){
    const slider=sliders.nth(i);await slider.focus();await page.keyboard.press('ArrowRight');const keyed=await slider.inputValue();const clipped=await slider.locator('..').locator('.ze4-comparison-before').evaluate(x=>getComputedStyle(x).clipPath)
    check(`${v.name}: comparison ${i} keyboard and clip`,keyed==='51'&&clipped.includes('49%'),{value:keyed,clip:clipped})
    const b=await slider.boundingBox();await page.mouse.move(b.x+b.width*.5,b.y+b.height*.4);await page.mouse.down();await page.mouse.move(b.x+b.width*.8,b.y+b.height*.4,{steps:8});await page.mouse.up()
    check(`${v.name}: comparison ${i} mouse drag`,Number(await slider.inputValue())>=75,await slider.inputValue())
   }
   if(v.width<=768){
    const slider=sliders.first();await slider.evaluate(el=>el.scrollIntoView({block:'center'}));await page.waitForTimeout(250);const b=await slider.boundingBox(),cdp=await ctx.newCDPSession(page);const y=b.y+b.height*.4
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width*.8,y}]});for(const part of [.7,.6,.5,.4,.3])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width*part,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
    check(`${v.name}: native touch comparison drag`,Number(await slider.inputValue())<40,await slider.inputValue());await cdp.detach()
   }
   for(const slider of await sliders.all())await slider.fill('50')
   await revealAll(page,'#processo')
   check(`${v.name}: process three numbered steps`,await page.locator('.ze4-process-step').count()===3&&await page.locator('.ze4-process-step').evaluateAll(xs=>xs.map(x=>x.querySelector('h3').textContent).join('|'))==='Avaliação|Detalhamento|Entrega')
   check(`${v.name}: process actual connectors revealed`,await page.locator('.ze4-process-number i').evaluateAll(xs=>xs.every(x=>getComputedStyle(x).transform==='none'||getComputedStyle(x).transform==='matrix(1, 0, 0, 1, 0, 0)')))
   await scrollTo(page,'#marcas');check(`${v.name}: real brand logos and illustrative quality`,await page.locator('.ze4-quality-brands img').evaluateAll(xs=>xs.map(x=>x.alt).join('|'))==='Vonixx|Vintex|Zacs'&&(await page.locator('#marcas').innerText()).includes('Composição ilustrativa'))
   await scrollTo(page,'.ze4-community')
   check(`${v.name}: unavailable Instagram honest six gallery tiles`,await page.locator('.ze4-instagram-tile').count()===6&&await page.locator('.ze4-instagram-grid').getAttribute('data-feed-source')==='editorial'&&(await page.locator('.ze4-feed-caption').innerText()).includes('Galeria ilustrativa'))
   const reviews=await page.locator('#avaliacoes').innerText()
   check(`${v.name}: no invented Google social proof`,await page.locator('#avaliacoes').getAttribute('data-reviews-state')==='unavailable'&&/indisponíveis/.test(reviews)&&!/Rafael Mendes|Carolina Freitas|Bruno Almeida|5,0|200 avaliações|mais de 200/i.test(reviews)&&await page.locator('.ze4-review-unavailable a').count()===3,reviews)
   await scrollTo(page,'#localizacao')
   const contact=await page.locator('#contato').innerText()
   check(`${v.name}: factual address phone and schedule preserved`,contact.includes('Antônio Horácio Pereira, 1485')&&contact.includes('99616-1968')&&contact.includes('08:00 - 18:00')&&contact.includes('08:00 - 14:00')&&contact.includes('Fechado')&&!contact.includes('Raulina'),contact)
   const map=page.locator('.ze4-location-map iframe');await map.scrollIntoViewIfNeeded()
   let mapState;try{const handle=await map.elementHandle(),frame=await handle.contentFrame();await frame.waitForSelector('body',{timeout:20000});await page.waitForTimeout(5000);mapState={url:frame.url(),title:await frame.title(),text:(await frame.locator('body').innerText()).slice(0,1400),elements:await frame.locator('body *').count(),images:await frame.locator('img').evaluateAll(xs=>xs.map(x=>({src:x.src.slice(0,180),loaded:x.complete&&x.naturalWidth>0})))}}catch(e){mapState={error:e.message}}
   report.maps.push({viewport:v.name,...mapState})
   check(`${v.name}: Google Maps real iframe DOM loaded`,mapState.elements>30&&mapState.url?.includes('google.com/maps'),mapState)
   check(`${v.name}: map lazy and actual route target`,await map.getAttribute('loading')==='lazy'&&await page.locator('.ze4-location-actions a').nth(1).getAttribute('href')==='https://maps.app.goo.gl/9twSEgWic6k4YYyf7')
   await scrollTo(page,'footer')
   const footer=await page.locator('footer').innerText()
   check(`${v.name}: complete institutional footer`,footer.includes('ao Rei dos séculos, imortal, invisível, ao Deus único, sábio, seja honra e glória para todo o sempre. Amém.')&&footer.includes('1 TIMÓTEO 1:17')&&footer.includes('© 2026')&&!/Facebook|YouTube/.test(footer)&&await page.locator('.ze4-footer-partners img').evaluateAll(xs=>xs.map(x=>x.alt).join('|'))==='OmnyaTech|SKG',footer)
   // All sections traversed; now capture actual complete content at each viewport.
   for(const [name,sel] of Object.entries(sections)){
    await revealAll(page,sel);await page.locator(sel).evaluate(async el=>{await Promise.allSettled([...el.querySelectorAll('img')].map(x=>x.decode()))})
    const geometry=await page.evaluate(sel=>({overflow:document.documentElement.scrollWidth-innerWidth,images:[...document.querySelector(sel).querySelectorAll('img')].map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})),hidden:[...document.querySelector(sel).querySelectorAll('[style*="opacity"]')].filter(x=>getComputedStyle(x).opacity==='0').length}),sel)
    check(`${v.name}: ${name} visible loaded no overflow`,geometry.overflow===0&&geometry.images.every(x=>x.loaded)&&geometry.hidden===0,geometry)
    await page.locator('header').evaluate(el=>el.style.visibility='hidden');await snap(page,`${v.name}-${name}`,sel);await page.locator('header').evaluate(el=>el.style.visibility='')
   }
   await scrollTo(page,'#hero');await snap(page,`${v.name}-fullpage`)
   await page.getByRole('button',{name:'Buscar no site',exact:true}).click();await page.locator('#zelo-search-input').fill('higienizacao')
   check(`${v.name}: search matches accents and autofocus`,await page.locator('.zelo-search-results a').count()===2&&await page.locator('#zelo-search-input').evaluate(x=>x===document.activeElement))
   await page.keyboard.press('Escape');check(`${v.name}: search Escape restores focus`,await page.locator('#zelo-site-search').count()===0&&await page.getByRole('button',{name:'Buscar no site',exact:true}).evaluate(x=>x===document.activeElement))
   const mobile=await page.getByRole('button',{name:'Abrir menu',exact:true}).isVisible()
   if(mobile){await page.getByRole('button',{name:'Abrir menu',exact:true}).click();await page.locator('#zelo-mobile-menu').waitFor();check(`${v.name}: mobile menu real dialog`,await page.locator('#zelo-mobile-menu').getAttribute('aria-modal')==='true');await page.locator('#zelo-mobile-menu a[href="#servicos"]').click();await page.locator('#zelo-mobile-menu').waitFor({state:'detached'})}else await page.locator('header a[href="#servicos"]').click()
   await page.waitForTimeout(1300)
   const nav=await page.evaluate(()=>({hash:location.hash,top:document.querySelector('#servicos').getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom,active:document.querySelector('header a[aria-current]')?.getAttribute('href'),dark:document.querySelector('header').classList.contains('zelo-site-header-dark')}))
   check(`${v.name}: nav arrives services visible below contrast header`,nav.hash==='#servicos'&&nav.top>=nav.header-2&&nav.dark,nav)
   if(!mobile)check(`${v.name}: active section header`,nav.active==='#servicos',nav)
   await page.locator('.zelo-header-brand').click();await page.waitForTimeout(800);check(`${v.name}: hero anchor return no replay`,await page.locator('#hero').getAttribute('data-intro')==='settled')
   await page.reload({waitUntil:'domcontentloaded'});await page.waitForTimeout(600);check(`${v.name}: hero session reload skips intro`,await page.locator('#hero').getAttribute('data-intro')==='settled'&&!(await page.evaluate(()=>window.__states)).some(x=>x.state==='playing'))
   check(`${v.name}: no runtime errors`,errors.length===0,errors)
   const unexpected=consoleErrors.filter(x=>!x.location.url.includes('/api/instagram-feed')&&!x.text.includes('status of 503'))
   check(`${v.name}: no new console/font errors`,unexpected.length===0,unexpected);report.console.push({viewport:v.name,errors,consoleErrors})
   check(`${v.name}: no GLB/three payloads`,!requests.some(x=>/\.glb(?:$|\?)|three.*\.js|\/new_interface\/.*png/.test(x)),requests.filter(x=>/glb|three|new_interface/.test(x)))
   report.viewports.push({...v,states:await page.evaluate(()=>window.__states),requests:requests.length})
  }catch(e){check(`${v.name}: run completes`,false,e.stack)}finally{await ctx.close()}
 }
 // Motion accessibility: real reduced preference, all contents available.
 {const {ctx,page}=await setup({width:390,height:844},true);await page.goto(base);await settle(page);for(const [name,sel]of Object.entries(sections)){await revealAll(page,sel);check(`reduced motion: ${name} available`,await page.locator(sel).evaluate(el=>[el,...el.querySelectorAll('[style*="opacity"]')].every(x=>getComputedStyle(x).opacity!=='0')))}check('reduced motion: hero never plays',!(await page.evaluate(()=>window.__states)).some(x=>x.state==='playing'));check('reduced motion: products settled without scale',await page.locator('.ze4-quality-scene').evaluate(x=>getComputedStyle(x).opacity==='1'&&getComputedStyle(x).transform==='none'));await ctx.close()}
 for(const target of [{name:'process',section:'#processo',selector:'.ze4-process-heading'},{name:'products',section:'#marcas',selector:'.ze4-quality-scene'},{name:'Instagram',section:'.ze4-community',selector:'.ze4-instagram-gallery'},{name:'map',section:'#localizacao',selector:'.ze4-location-map'}]){
  const {ctx,page}=await setup({width:1440,height:900});await page.goto(base);await settle(page);await page.evaluate(sel=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,document.querySelector(sel).getBoundingClientRect().top+scrollY-160)},target.section)
  const frames=[];for(const wait of [0,90,150,300,700]){await page.waitForTimeout(wait);frames.push(await page.locator(target.selector).evaluate(x=>({opacity:Number(getComputedStyle(x).opacity),transform:getComputedStyle(x).transform})))}
  check(`actual motion: ${target.name} natural viewport fade`,frames.some(x=>x.opacity<.98)&&frames.at(-1).opacity>.99,frames);await ctx.close()
 }
 for(const state of ['empty','fixture','loading']){const {ctx,page}=await setup({width:1440,height:900},true,state);await page.goto(base,{waitUntil:'domcontentloaded'});if(state==='loading'){await page.locator('#instagram').scrollIntoViewIfNeeded();check('Instagram loading aria-busy',await page.locator('.ze4-instagram-grid').getAttribute('aria-busy')==='true')}await page.waitForTimeout(2300);const source=await page.locator('.ze4-instagram-grid').getAttribute('data-feed-source'),caption=await page.locator('.ze4-feed-caption').innerText();check(`Instagram ${state} expected honest state`,state==='fixture'?source==='official'&&!caption.includes('ilustrativa'):source==='editorial'&&caption.includes('ilustrativa'),{source,caption});if(state==='fixture'){const hrefs=await page.locator('.ze4-instagram-tile').evaluateAll(xs=>xs.map(x=>x.href));check('Instagram contract fixture URL/permalink and profile fallback',hrefs.length===3&&hrefs[0].includes('/p/QA_CONTRACT_FIXTURE/')&&hrefs[1]==='https://www.instagram.com/zelo_autoestetica/'&&hrefs[2]==='https://www.instagram.com/zelo_autoestetica/',hrefs)}await ctx.close()}
}finally{await browser.close();report.summary={pass:report.checks.filter(x=>x.pass).length,fail:report.checks.filter(x=>!x.pass).length};await writeFile(path('qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary))}
