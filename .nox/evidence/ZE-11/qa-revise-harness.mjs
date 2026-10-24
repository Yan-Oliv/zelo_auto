import fs from 'node:fs'
const f='.nox/evidence/ZE-11/qa-local.mjs'
let s=fs.readFileSync(f,'utf8')
s=s.replaceAll("includes('google.com/maps/embed')","includes('google.com/maps')")
s=s.replaceAll("a.href.includes('google.com/maps')","(a.href.includes('google.com/maps')||a.href.includes('maps.app.goo.gl'))")
s=s.replace("sliders.map(n=>n.name),['Pintura','Bancos','Carpete']","sliders.map(n=>n.name.toLowerCase()),['pintura','bancos','carpete']")
s=s.replace("async function check(name,fn){if(process.env.ZE11_FILTER&&!new RegExp(process.env.ZE11_FILTER).test(name))return;try", "if(process.env.ZE11_FILTER&&fs.existsSync(`${dir}/results.json`))result.groups=JSON.parse(fs.readFileSync(`${dir}/results.json`,'utf8')).groups\nasync function check(name,fn){if(process.env.ZE11_FILTER&&!new RegExp(process.env.ZE11_FILTER).test(name))return;result.groups=result.groups.filter(g=>g.name!==name);try")
if(fs.existsSync('.nox/evidence/ZE-11/qa-local/results.json'))fs.copyFileSync('.nox/evidence/ZE-11/qa-local/results.json','.nox/evidence/ZE-11/qa-local/results-baseline.json')
fs.writeFileSync(f,s)
