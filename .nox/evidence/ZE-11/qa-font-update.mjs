import fs from 'node:fs'
const dir='.nox/evidence/ZE-11'
fs.copyFileSync(`${dir}/qa-matrix/qa-global.json`,`${dir}/qa-matrix/qa-global-baseline.json`)
for(const f of ['qa-matrix.mjs','qa-local.mjs']){
 let s=fs.readFileSync(`${dir}/${f}`,'utf8')
 if(f==='qa-matrix.mjs')s=s.replace('await p.waitForTimeout(900) }','await p.waitForTimeout(900);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.querySelector(".ze4-page")?.dataset.editorialFont==="ready") }')
 else s=s.replace('await p.waitForTimeout(1300)}','await p.waitForTimeout(1300);await p.waitForFunction(()=>document.querySelector(".ze4-page")?.dataset.editorialFont==="ready")}')
 fs.writeFileSync(`${dir}/${f}`,s)
}
