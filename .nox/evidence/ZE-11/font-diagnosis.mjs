import {chromium} from 'playwright'
const b=await chromium.launch()
try {
 for(const width of [2560,1920,1440,1366,1024,768,390,320]) {
  const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'})
  await p.route('https://**/*',r=>r.abort())
  await p.route('**/api/**',r=>r.fulfill({status:503,contentType:'application/json',body:'{}'}))
  await p.goto('http://127.0.0.1:5173/')
  await p.locator('#servicos').scrollIntoViewIfNeeded()
  await p.waitForFunction(()=>document.querySelector('.ze4-page')?.dataset.editorialFont==='ready')
  console.log(await p.locator('#ze4-location-title').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {viewport:innerWidth,font:s.font,fontSize:s.fontSize,letterSpacing:s.letterSpacing,width:e.clientWidth,height:e.clientHeight,lines:['VENHA VIVER','A EXPERIÊNCIA','ZELO EM','CATALÃO – GO'].map(t=>({text:t,width:c.measureText(t).width+(t.length-1)*parseFloat(s.letterSpacing)}))}}))
  await p.close()
 }
}finally{await b.close()}
