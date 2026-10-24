import fs from 'node:fs'
const dir='.nox/evidence/ZE-11'
let s=fs.readFileSync(`${dir}/qa-local.mjs`,'utf8')
s=s.replace('[[1440,900],[768,1024],[390,844]]','[[1440,900],[768,1024],[390,844],[320,640]]')
s=s.replace('const p=await open({w,h});await all(p);','const p=await open({w,h,map:true});await all(p);await p.waitForTimeout(4500);')
s=s.replace('const result={inventory,requests:p.counts,mapBlockedForDeterminism:true,','const title=await p.locator("#ze4-location-title").evaluate(e=>({height:e.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e).lineHeight),font:getComputedStyle(e).fontFamily,overflow:e.scrollWidth>e.clientWidth+1}));assert.ok(title.height/title.line<=4.1,JSON.stringify(title));assert.equal(title.overflow,false);const result={inventory,requests:p.counts,locationTitle:title,mapBlockedForDeterminism:false,')
s=s.replace("stroke:getComputedStyle(e.querySelector('.zelo-hero-wordmark path')).strokeDashoffset", "stroke:getComputedStyle(e.querySelector('.zelo-hero-wordmark path')).strokeDashoffset,wordmarkClip:getComputedStyle(e.querySelector('.zelo-hero-wordmark')).clipPath")
fs.writeFileSync(`${dir}/qa-local.mjs`,s)
s=fs.readFileSync(`${dir}/qa-contrast.mjs`,'utf8')
s=s.replace('const e=p.locator(selector);','if(selector.includes("review"))await p.locator("#avaliacoes").scrollIntoViewIfNeeded();const e=p.locator(selector);')
s=s.replace("await e.evaluate((e,style)=>style===null?", "await sharp(original.data,{raw:original.info}).png().toFile(`${dir}/${width}-${selector.replace(/[^a-z0-9]/gi,'_')}-original.png`);await sharp(back.data,{raw:back.info}).png().toFile(`${dir}/${width}-${selector.replace(/[^a-z0-9]/gi,'_')}-background.png`);await e.evaluate((e,style)=>style===null?")
fs.copyFileSync(`${dir}/qa-contrast/results.json`,`${dir}/qa-contrast/results-baseline.json`)
fs.writeFileSync(`${dir}/qa-contrast.mjs`,s)
