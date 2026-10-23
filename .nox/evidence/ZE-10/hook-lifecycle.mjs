import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const browser=await chromium.launch(), results=[]
const page=await browser.newPage()
const errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.route('**/hook-harness',r=>r.fulfill({contentType:'text/html',body:`<div id="test"></div><script type="module">
import React from '/node_modules/.vite/deps/react.js';import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js';const {createRoot}=ReactDOM;import{useGoogleReviews}from'/src/features/landing/hooks/useGoogleReviews.ts';
delete window.IntersectionObserver;let root;
function Test(){const feed=useGoogleReviews();window.state=feed;return React.createElement('div',{ref:feed.ref},feed.status)}
window.mount=()=>{root=createRoot(document.getElementById('test'));root.render(React.createElement(React.StrictMode,null,React.createElement(Test)))};window.unmount=()=>root.unmount();window.mount();
</script>`}))
let calls=0;const pending=[]
await page.route('**/api/google-reviews',r=>{calls++;pending.push(r)})
const fixture={source:'google_business_profile',average:4.7,total:9,reviews:[],sourceUrl:'https://www.google.com/maps?cid=123'}
try{
await page.goto('http://127.0.0.1:5173/hook-harness');await page.waitForFunction(()=>window.state?.status==='loading');await page.waitForTimeout(100);assert.equal(calls,1);results.push('StrictMode dedupe PASS')
await page.evaluate(()=>window.unmount());await page.waitForTimeout(50);await page.evaluate(()=>window.mount());await page.waitForTimeout(100);assert.equal(calls,2)
await pending[1].fulfill({contentType:'application/json',body:JSON.stringify(fixture)});await page.waitForFunction(()=>window.state?.status==='verified');results.push('Unmount abort/remount recovery PASS')
await pending[0].fulfill({contentType:'application/json',body:JSON.stringify({...fixture,average:1})}).catch(()=>{});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.state.data.average),4.7);results.push('Old response cannot overwrite newer result PASS')
await page.evaluate(()=>window.unmount());await page.waitForTimeout(10);await page.evaluate(()=>window.mount());await page.waitForTimeout(100);assert.equal(calls,2);results.push('Remount success no duplicate fetch PASS')
assert.deepEqual(errors,[]);results.push('No React errors PASS')
}finally{fs.writeFileSync('.nox/evidence/ZE-10/hook-lifecycle.json',JSON.stringify({results,errors},null,2));await browser.close()}
console.log(results)
