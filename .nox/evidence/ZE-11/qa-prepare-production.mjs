import fs from 'node:fs'
const dir='.nox/evidence/ZE-11'
let s=fs.readFileSync('.nox/evidence/ZE-10.2/qa-production.mjs','utf8').replace("const dir='.nox/evidence/ZE-10.2'",`const dir='${dir}/qa-production'`)
// One extra directory level needs a corresponding source-relative import level.
s=s.replaceAll("'../../../src/", "'../../../../src/")
fs.mkdirSync(`${dir}/qa-production/screens`,{recursive:true});fs.writeFileSync(`${dir}/qa-production.mjs`,s)
s=fs.readFileSync('.nox/evidence/ZE-10.2/accessibility.mjs','utf8').replaceAll('.nox/evidence/ZE-10.2/accessibility.json',`${dir}/qa-errors/accessibility.json`)
fs.writeFileSync(`${dir}/qa-errors-accessibility.mjs`,s)
fs.copyFileSync(`${dir}/qa-affected/results.json`,`${dir}/qa-affected/results-baseline.json`)
s=fs.readFileSync(`${dir}/qa-affected.mjs`,'utf8')
s=s.replace('async function check(name,fn){try',"if(process.env.ZE11_FILTER)results.push(...JSON.parse(fs.readFileSync(`${dir}/results.json`,'utf8')).results.filter(g=>!new RegExp(process.env.ZE11_FILTER).test(g.name)))\nasync function check(name,fn){if(process.env.ZE11_FILTER&&!new RegExp(process.env.ZE11_FILTER).test(name))return;try")
fs.writeFileSync(`${dir}/qa-affected.mjs`,s)
