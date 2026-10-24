// LOCAL QA ONLY. Fault harness is intercepted by Playwright, never shipped.
import { chromium } from 'playwright'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.ZE102_QA_URL || 'http://127.0.0.1:5173'
const dir = process.env.ZE102_QA_DIR || '.nox/evidence/ZE-10.2'
const browser = await chromium.launch()
const results = { kind: 'Local Chromium QA; intercepted test-only React faults; no actual API approval asserted', base, groups: [] }
fs.mkdirSync(`${dir}/screens`, {recursive:true})
async function check(name, fn) {
  if(process.env.ZE102_QA_FILTER&&!new RegExp(process.env.ZE102_QA_FILTER).test(name))return
  try { results.groups.push({name,status:'PASS',evidence:await fn()}) }
  catch (error) { results.groups.push({name,status:'FAIL',error:error.stack}); console.error(name,error.message) }
  fs.writeFileSync(`${dir}/qa-browser.json`,JSON.stringify(results,null,2))
}
async function open({width=390,height=844,motion='reduce',js=true}={}) {
  const context = await browser.newContext({viewport:{width,height},reducedMotion:motion,javaScriptEnabled:js})
  const page = await context.newPage(); page.setDefaultTimeout(8000)
  page.errors=[]; page.logs=[]; page.requests=[]
  page.on('pageerror',e=>page.errors.push(e.message)); page.on('console',m=>page.logs.push({type:m.type(),text:m.text()}));page.on('request',r=>page.requests.push(r.url()))
  await page.route('https://**/*',r=>r.abort())
  return page
}
const harness = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORIGINAL LANDING TITLE</title><meta name="robots" content="index, follow"><link rel="canonical" href="https://zelo.omnyatech.com.br/"><meta property="og:title" content="LANDING"><meta name="twitter:title" content="LANDING"><script type="application/ld+json">{"@type":"LocalBusiness"}</script><link rel="stylesheet" href="/errors/error-page.css"></head><body><div id="test"></div><script type="module">
import React from '/node_modules/.vite/deps/react.js';
import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js';
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;
const {GlobalErrorBoundary}=await import('/src/shared/errors/GlobalErrorBoundary.tsx');
const {ErrorPage}=await import('/src/shared/errors/ErrorPage.tsx');
const params=new URLSearchParams(location.search); const mode=params.get('mode')||'render'; const code=Number(params.get('code')||500);
window.failure=mode!=='page'; window.catches=0; window.mounts=0;
localStorage.setItem('ZE102_QA_CONSENT','PRESERVE');sessionStorage.setItem('zelo:hero-intro:v4','complete');
function Fault(){window.catches++;if(window.failure)throw new Error('TEST_ONLY_SECRET_SENTINEL');window.mounts++;return React.createElement('main',null,React.createElement('h1',null,'RECOVERED'),React.createElement('button',{onClick:()=>{window.failure=true;window.render()}},'New fault'))}
function Provider({children}){if(window.failure)throw new Error('TEST_ONLY_PROVIDER_SENTINEL');return children}
const Lazy=React.lazy(()=>Promise.reject(new Error('TEST_ONLY_LAZY_SENTINEL')));
window.root=ReactDOM.createRoot(document.getElementById('test'));
window.render=()=>{let child=mode==='page'?React.createElement(ErrorPage,{code,onRetry:()=>{window.retryCount=(window.retryCount||0)+1}}):mode==='provider'?React.createElement(Provider,null,React.createElement(Fault)):mode==='lazy'?React.createElement(React.Suspense,{fallback:React.createElement('p',null,'Loading')},React.createElement(Lazy)):React.createElement('section',null,React.createElement(Fault));window.root.render(React.createElement(React.StrictMode,null,mode==='page'?child:React.createElement(GlobalErrorBoundary,null,child)))};
window.render();window.unmount=()=>window.root.unmount();
</script></body></html>`
async function mount(page, mode='render', code=500) {
  await page.route('**/ze102-harness?**',r=>r.fulfill({contentType:'text/html',body:harness}))
  await page.goto(`${base}/ze102-harness?mode=${mode}&code=${code}`)
  await page.locator(`[data-error-code="${code}"]`).waitFor()
  await page.evaluate(()=>document.fonts.ready)
}
async function layout(page) {
  return page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:[...document.querySelectorAll('h1')].map(e=>({text:e.textContent,font:getComputedStyle(e).fontSize,box:e.getBoundingClientRect().toJSON()})),actions:[...document.querySelectorAll('.ze-error__actions a,.ze-error__actions button')].map(e=>({text:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),logo:[...document.images].filter(e=>e.className.includes('logo')).map(e=>({ok:e.complete&&e.naturalWidth>0,src:e.getAttribute('src')}))}))
}
try {
 for(const code of [404,500,503]) for(const [width,height] of [[2560,1440],[1920,1080],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[360,740],[320,640],[844,390]]) {
  await check(`Static ${code} responsive ${width}x${height}`,async()=>{
   const p=await open({width,height});await p.goto(`${base}/${code}.html`);await p.locator(`[data-error-code="${code}"]`).waitFor();await p.evaluate(()=>document.fonts.ready)
   const v=await layout(p);assert.ok(v.scroll<=width+1,JSON.stringify(v));assert.equal(v.h1.length,1);assert.ok(v.actions.every(b=>b.w>=44&&b.h>=44&&b.left>=0&&b.right<=width+1));assert.ok(v.logo.length&&v.logo.every(l=>l.ok));assert.equal(await p.locator('main').count(),1);assert.match(await p.locator('meta[name="robots"]').getAttribute('content'),/noindex/);assert.equal(await p.locator('link[rel=canonical],script[type="application/ld+json"]').count(),0);assert.match(await p.title(),new RegExp(String(code)));assert.ok(!p.requests.some(url=>/car-final|showroom|api\/|googletagmanager/.test(url)))
   if([1920,768,390,320,844].includes(width))await p.screenshot({path:`${dir}/screens/${code}-${width}.png`,fullPage:true})
   await p.context().close();return v
  })
 }
 for(const mode of ['render','provider','lazy']) await check(`Boundary catches ${mode} failure under StrictMode, safe visible output and focus`,async()=>{
  const p=await open();await mount(p,mode);assert.match(await p.locator('h1').innerText(),/ALGO SAIU DO PERCURSO/i);assert.ok(await p.locator('h1').evaluate(e=>document.activeElement===e));assert.doesNotMatch(await p.locator('body').innerText(),/TEST_ONLY|Error:|\.tsx|stack|B:\\/);assert.match(await p.locator('meta[name=robots]').getAttribute('content'),/noindex/);assert.equal(await p.locator('link[rel=canonical],script[type="application/ld+json"],meta[property^="og:"],meta[name^="twitter:"]').count(),0);const catches=await p.evaluate(()=>window.catches);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>window.catches),catches);assert.ok(p.logs.some(m=>m.type==='error'));if(mode==='render')await p.screenshot({path:`${dir}/screens/boundary-500.png`,fullPage:true});await p.context().close();return{catches,autoRetry:false,focus:'h1',devDiagnostics:true}
 })
 await check('Boundary manual retry persistent failure, recovery, new error, storage and metadata restore',async()=>{
  const p=await open();await mount(p);await p.locator('[data-error-retry]').click();await p.locator('[data-error-code="500"]').waitFor();await p.evaluate(()=>window.failure=false);await p.locator('[data-error-retry]').click();await p.getByRole('heading',{name:'RECOVERED'}).waitFor();assert.equal(await p.title(),'ORIGINAL LANDING TITLE');assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'index, follow');assert.equal(await p.locator('link[rel=canonical],script[type="application/ld+json"],meta[property^="og:"],meta[name^="twitter:"]').count(),4);assert.deepEqual(await p.evaluate(()=>({consent:localStorage.getItem('ZE102_QA_CONSENT'),intro:sessionStorage.getItem('zelo:hero-intro:v4')})),{consent:'PRESERVE',intro:'complete'});await p.getByRole('button',{name:'New fault'}).click();await p.locator('[data-error-code="500"]').waitFor();assert.ok(await p.locator('h1').evaluate(e=>document.activeElement===e));await p.evaluate(()=>window.failure=false);await p.locator('[data-error-retry]').click();await p.getByRole('heading',{name:'RECOVERED'}).waitFor();assert.ok(await p.evaluate(()=>window.mounts>=2));await p.context().close();return{manualRecoveryCycles:2,metadataRestored:true,storagePreserved:true}
 })
 for(const code of [404,500,503]) await check(`React ${code} render and keyboard/native actions`,async()=>{
  const p=await open();await mount(p,'page',code);const v=await layout(p);assert.ok(v.scroll<=391);if(code!==404){await p.locator('[data-error-retry]').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>window.retryCount),1)}const home=p.locator('a[href="/"]').first();await home.focus();await p.keyboard.press('Tab');const focused=await p.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent,outline:getComputedStyle(document.activeElement).outlineStyle}));assert.equal(focused.tag,'A');assert.notEqual(focused.outline,'none');if(code===404||code===503)assert.ok(await p.locator('a[href^="https://wa.me/5564996161968"]').count());await p.screenshot({path:`${dir}/screens/react-${code}-focus.png`,fullPage:true});await p.context().close();return{focused,layout:v}
 })
 await check('Reduced motion immediate visibility and no running animations',async()=>{
  const p=await open();await mount(p,'page',404);const values=await p.locator('.ze-error').evaluate(e=>({animations:e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length,copy:getComputedStyle(e.querySelector('.ze-error__copy')).opacity,buttons:[...e.querySelectorAll('.ze-error__button')].map(b=>getComputedStyle(b).opacity)}));assert.equal(values.animations,0);assert.equal(values.copy,'1');assert.ok(values.buttons.every(v=>v==='1'));await p.screenshot({path:`${dir}/screens/reduced-motion.png`,fullPage:true});await p.context().close();return values
 })
 await check('Semantic accessibility tree and button text contrast AA',async()=>{
  const p=await open();await mount(p,'page',404);const client=await p.context().newCDPSession(p);const tree=await client.send('Accessibility.getFullAXTree');const roles=tree.nodes.filter(n=>!n.ignored).map(n=>({role:n.role?.value,name:n.name?.value}));assert.equal(roles.filter(n=>n.role==='main').length,1);assert.ok(roles.some(n=>n.role==='heading'&&/PÁGINA NÃO ENCONTRADA/i.test(n.name)));assert.ok(roles.some(n=>n.role==='link'&&/Falar com a Zelo/i.test(n.name)));const values=await p.locator('.ze-error__button').evaluateAll(es=>es.map(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor,gradient:getComputedStyle(e).backgroundImage,text:e.textContent})));const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);for(const value of values){const colors=value.gradient==='none'?[value.background]:value.gradient.match(/rgba?\([^)]+\)/g);value.contrasts=colors.map(c=>{const a=lum(rgb(value.color)),b=lum(rgb(c));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});assert.ok(value.contrasts.every(c=>c>=4.5),JSON.stringify(value))}await p.context().close();return{roles,buttons:values,scope:'Programmatic Chromium accessibility tree, keyboard, computed gradient-stop contrast; no physical screen reader certification'}
 })
 await check('CSS reveal changes frames, controls immediately available, settles',async()=>{
  const p=await open({motion:'no-preference',width:1366,height:768});await p.goto(`${base}/404.html`);await p.locator('[data-error-code="404"]').waitFor();const sample=()=>p.locator('.ze-error').evaluate(e=>({running:e.getAnimations({subtree:true}).length,number:getComputedStyle(e.querySelector('.ze-error__number')).clipPath,wordmark:getComputedStyle(e.querySelector('.ze-error__wordmark')).clipPath,copy:getComputedStyle(e.querySelector('.ze-error__copy')).opacity}));const early=await sample();await p.screenshot({path:`${dir}/screens/animation-early.png`,animations:'allow'});await p.waitForTimeout(350);const middle=await sample();await p.screenshot({path:`${dir}/screens/animation-middle.png`,animations:'allow'});await p.waitForTimeout(1400);const late=await sample();await p.screenshot({path:`${dir}/screens/animation-final.png`,animations:'allow'});assert.ok(early.running>0);assert.notDeepEqual(early,late);assert.equal(late.copy,'1');await p.context().close();return{early,middle,late}
 })
 await check('Zoom 200 percent equivalent reflow plus 200 percent text',async()=>{
  const p=await open({width:640,height:400});await p.goto(`${base}/500.html`);await p.locator('[data-error-code="500"]').waitFor();await p.addStyleTag({content:'html{font-size:200% !important}'});const v=await layout(p);assert.ok(v.scroll<=641,JSON.stringify(v));assert.ok(v.actions.every(a=>a.right<=641&&a.left>=0));await p.screenshot({path:`${dir}/screens/zoom-text-200.png`,fullPage:true});await p.context().close();return{method:'1280px desktop at browser zoom200% has640CSSpx; tested640CSSpx viewport plus html font-size200%. Not physical browser toolbar zoom.',layout:v}
 })
 for(const width of [640,320])await check(`Actual text doubled at ${width} CSSpx`,async()=>{
  const p=await open({width,height:640});await p.goto(`${base}/503.html`);await p.locator('[data-error-code="503"]').waitFor();const before=await p.locator('h1').evaluate(e=>getComputedStyle(e).fontSize);await p.evaluate(()=>{for(const e of document.querySelectorAll('h1,.ze-error__description,.ze-error__eyebrow,.ze-error__button,.ze-error__back,.ze-error__footer span'))e.style.setProperty('font-size',`${parseFloat(getComputedStyle(e).fontSize)*2}px`,'important')});const v=await layout(p);assert.ok(v.scroll<=width+1,JSON.stringify(v));assert.ok(v.actions.every(a=>a.right<=width+1&&a.left>=0));await p.screenshot({path:`${dir}/screens/text-doubled-${width}.png`,fullPage:true});await p.context().close();return{before,after:v.h1[0].font,layout:v,scope:'All error semantic text selectors font-size computed then doubled, fixed px included'}
 })
 for(const code of [404,500,503]) await check(`Static ${code} JavaScript disabled; native recovery/contact`,async()=>{
  const p=await open({js:false});await p.goto(`${base}/${code}.html`);await p.getByRole('heading',{level:1}).waitFor();assert.ok(await p.locator('a[href="/"]').count());if(code!==404)assert.ok(await p.locator('a[href]').filter({hasText:'Tentar novamente'}).count());if(code!==500)assert.ok(await p.locator('a[href^="https://wa.me/5564996161968"]').count());assert.ok(await p.locator('body').innerText());await p.screenshot({path:`${dir}/screens/nojs-${code}.png`,fullPage:true});await p.context().close()
 })
 for(const mode of ['nojs','blocked-main'])await check(`Landing boot recovery ${mode}`,async()=>{
  const p=await open({js:mode!=='nojs'});if(mode==='blocked-main')await p.route(/\/(src\/main\.tsx|assets\/index-[^/]+\.js)(\?|$)/,r=>r.abort());await p.goto(base);await p.getByRole('heading',{name:/ALGO SAIU DO PERCURSO/i}).waitFor();assert.ok(await p.locator('a[href="/"]').count());if(mode==='blocked-main')assert.equal(await p.locator('link[rel=canonical],script[type="application/ld+json"]').count(),0);const robots=await p.locator('meta[name=robots]').evaluateAll(es=>es.map(e=>e.content).join(','));assert.match(robots,/noindex/);await p.screenshot({path:`${dir}/screens/boot-${mode}.png`,fullPage:true});await p.context().close();return{robots,canonicalRetainedForNoJsRoot:mode==='nojs'}
 })
} finally { await browser.close();fs.writeFileSync(`${dir}/qa-browser.json`,JSON.stringify(results,null,2)) }
console.log(JSON.stringify({PASS:results.groups.filter(g=>g.status==='PASS').length,FAIL:results.groups.filter(g=>g.status==='FAIL').length,failures:results.groups.filter(g=>g.status==='FAIL')},null,2))
if(results.groups.some(g=>g.status==='FAIL'))process.exitCode=1
