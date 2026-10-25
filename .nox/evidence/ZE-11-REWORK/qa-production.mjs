// Local isolated production compilation. Not included in app/public output.
import {build} from 'vite'
import react from '@vitejs/plugin-react'
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
const dir='.nox/evidence/ZE-11-REWORK/qa-production'
const main=fs.readFileSync('src/main.tsx','utf8')
const options=main.slice(main.indexOf('const rootOptions ='),main.indexOf('\nconst application ='))
assert.ok(options.includes('onCaughtError')&&options.includes('onUncaughtError'))
const entry=`import React,{StrictMode} from 'react';import {createRoot} from 'react-dom/client';import {GlobalErrorBoundary} from '../../../../src/shared/errors/GlobalErrorBoundary';import {applyErrorMetadata} from '../../../../src/shared/errors/errorMetadata';
const rootContainer=document.getElementById('root')!;const nativeRecovery=rootContainer.innerHTML;
${options}
window.failure=true;window.renderCount=0;
function Fault(){window.renderCount++;if(window.failure)throw new Error('QA_FAKE_SECRET_NEVER_EXPOSE');return React.createElement('h1',null,'RECOVERED')}
function Provider({children}){if(window.failure)throw new Error('QA_FAKE_PROVIDER_SECRET');return children}
const Lazy=React.lazy(()=>Promise.reject(new Error('QA_FAKE_LAZY_SECRET')));
const mode=new URLSearchParams(location.search).get('mode');const child=mode==='provider'?React.createElement(Provider,null,React.createElement(Fault)):mode==='lazy'?React.createElement(React.Suspense,{fallback:null},React.createElement(Lazy)):React.createElement(Fault);
createRoot(rootContainer,rootOptions).render(React.createElement(StrictMode,null,mode==='root'?child:React.createElement(GlobalErrorBoundary,null,child)));
`
fs.writeFileSync(`${dir}/production-entry.tsx`,entry)
await build({configFile:false,envDir:path.resolve(dir),plugins:[react()],define:{'process.env.NODE_ENV':'"production"'},logLevel:'error',build:{outDir:path.resolve(`${dir}/test-only-dist`),emptyOutDir:true,lib:{entry:path.resolve(`${dir}/production-entry.tsx`),formats:['es'],fileName:'harness'},minify:true}})
const bundle=fs.readFileSync(`${dir}/test-only-dist/harness.js`,'utf8')
const browser=await chromium.launch(),results={kind:'Actual source boundary + exact src/main rootOptions copied and compiled production; local-only synthetic sentinel faults',groups:[]}
try{
for(const mode of ['render','provider','lazy','root']){
 const p=await browser.newPage(),logs=[],errors=[];p.on('console',m=>logs.push({type:m.type(),text:m.text()}));p.on('pageerror',e=>errors.push(e.message));await p.route('**/ze102-production?**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/errors/error-page.css"></head><body style="margin:0"><div id="root"><div class="ze-error" data-boot-fallback><main class="ze-error__main"><h1 id="ze-error-heading">Algo saiu do percurso</h1><a href="/">Voltar ao início</a></main></div></div><script type="module" src="/qa-production.js"></script></body></html>'}));await p.route('**/qa-production.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await p.goto(`http://127.0.0.1:5173/ze102-production?mode=${mode}`);await p.locator('[data-error-code="500"]').waitFor();await p.waitForTimeout(150);assert.ok(logs.some(l=>l.type==='error'&&l.text===(mode==='root'?'[Zelo] APP_ROOT_FAILED':'[Zelo] APP_RENDER_FAILED')));assert.ok(logs.every(l=>!/QA_FAKE|Error:|at Fault|at Provider|\.tsx|B:\\/.test(l.text)),JSON.stringify(logs));assert.deepEqual(errors,[]);assert.doesNotMatch(await p.locator('body').innerText(),/QA_FAKE/);if(mode==='root'){assert.ok(await p.locator('h1').evaluate(e=>document.activeElement===e));assert.match(await p.locator('meta[name=robots]').getAttribute('content'),/noindex/)}if(mode==='render'){await p.evaluate(()=>window.failure=false);await p.locator('[data-error-retry]').click();await p.getByRole('heading',{name:'RECOVERED'}).waitFor()}await p.screenshot({path:`${dir}/screens/production-${mode}.png`,fullPage:true});results.groups.push({name:`Production ${mode} secret safety${mode==='render'?' and retry recovery':''}`,status:'PASS',logs,uncaughtErrors:errors});await p.close()
}
}catch(e){results.groups.push({name:'Production compilation/browser QA',status:'FAIL',error:e.stack});process.exitCode=1}finally{await browser.close();fs.writeFileSync(`${dir}/qa-production.json`,JSON.stringify(results,null,2))}
console.log(JSON.stringify(results,null,2))
