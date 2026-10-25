import fs from 'node:fs'
const from='.nox/evidence/ZE-11',to='.nox/evidence/ZE-11-REWORK'
fs.mkdirSync(to,{recursive:true})
for(const file of ['qa-matrix.mjs','qa-local.mjs','qa-feed.mjs','qa-affected.mjs','qa-contrast.mjs']){
  let script=fs.readFileSync(`${from}/${file}`,'utf8').replaceAll(from,to)
  fs.writeFileSync(`${to}/${file}`,script)
}
console.log('Rework read-only QA scripts prepared; no previous results copied as current evidence')
