import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const dir='.nox/evidence/ZE-12',source=path.resolve(dir+'/work/source'),dist=path.join(source,'dist')
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(p,x.name)):[path.join(p,x.name)])
const files=walk(dist).map(f=>({file:path.relative(dist,f).replaceAll('\\','/'),bytes:fs.statSync(f).size,sha256:sha(fs.readFileSync(f))})).sort((a,b)=>a.file.localeCompare(b.file))
const required=['index.html','404.html','500.html','503.html','_headers','_redirects','robots.txt','sitemap.xml','favicon-64-v1.png']
for(const f of required)assert.ok(files.some(x=>x.file===f),'Required artifact '+f)
assert.ok(files.every(x=>x.bytes<=25*1024*1024),'Pages file size maximum')
assert.ok(!files.some(x=>/(^|\/)\.env($|\.)|^\.nox\/|node_modules|(?:^|\/)src\//.test(x.file)),'Private or source file in output')
const signatures=[];for(const f of files.filter(x=>/\.(html|css|js|json|txt|xml)$/.test(x.file))){const s=fs.readFileSync(path.join(dist,f.file),'utf8');if(/(?<![A-Za-z0-9+/])(?:IGAA|EAA)[A-Za-z0-9]{60,}(?![A-Za-z0-9+/])|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(s))signatures.push({file:f.file,category:'Secret signature, value intentionally not recorded'})}
assert.deepEqual(signatures,[])
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8')
assert.ok(html.includes('data-prerendered')&&html.includes('data-critical-hero'))
assert.ok(!/\b(?:src|href)="\/src\//.test(html))
const checkpoint=JSON.parse(fs.readFileSync(dir+'/baseline/git-checkpoint.json'))
const protectedDocs=Object.entries(checkpoint.protectedHashes).map(([file,hash])=>({file,unchanged:sha(fs.readFileSync(file))===hash}));assert.ok(protectedDocs.every(x=>x.unchanged))
const functions=walk(path.join(source,'functions')).map(f=>({file:path.relative(source,f).replaceAll('\\','/'),sha256:sha(fs.readFileSync(f))}))
const lock=JSON.parse(fs.readFileSync(path.join(source,'package-lock.json'),'utf8'))
const manifest={candidate:checkpoint.candidate,branch:checkpoint.branch,environment:'Prepared for Cloudflare Pages zelo-auto production; NOT DEPLOYED',method:'Existing GitHub integration; production branch main, isolated non-main preview before final GO-LIVE',build:{command:'npm ci --no-fund; npm run lint; npm run build',node:'24.13.1',npm:'11.8.0',lockSHA256:sha(fs.readFileSync(path.join(source,'package-lock.json'))),vite:lock.packages['node_modules/vite'].version,output:'dist',sourceArchive:'Exact product paths from Git candidate, excluding .nox; no dirty/untracked local files or .env'},artifactTreeSHA256:sha(JSON.stringify(files)),indexHTMLSHA256:sha(html),files,functions,previousDeployment:'0f414771-cd0e-4407-9165-5a4311babff3',productionURL:'https://zelo.omnyatech.com.br/',goLiveAuthorized:false,googleException:'Owner approved honest unavailable state; ZE-09 BLOCKED_EXTERNAL; no authenticated Google assertion'}
fs.writeFileSync(dir+'/prerelease/release-manifest.json',JSON.stringify(manifest,null,2)+'\n')
fs.writeFileSync(dir+'/prerelease/security-summary.json',JSON.stringify({status:'PASS artifact confidentiality and protected owner-file checks; dependency assessment reported separately',filesScanned:files.length,maximumAssetBytes:Math.max(...files.map(x=>x.bytes)),privateFilesInOutput:false,secretSignatureFindings:signatures,protectedDocs,localEnvRead:false,limits:'Signature checks supplement source review, not an exhaustive secret scanner. No credentials loaded into the isolated build. Functions must deploy through Git integration, not static dashboard upload.'},null,2)+'\n')
console.log(JSON.stringify({files:files.length,bytes:files.reduce((s,x)=>s+x.bytes,0),indexHTMLSHA256:manifest.indexHTMLSHA256,artifactTreeSHA256:manifest.artifactTreeSHA256,protectedDocs}))
