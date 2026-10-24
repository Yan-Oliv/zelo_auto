import fs from 'node:fs'
import crypto from 'node:crypto'
import {execFileSync} from 'node:child_process'
const baseline=JSON.parse(fs.readFileSync('.nox/evidence/ZE-10.2/checkpoint.json'))
const allowed=new Set(['src/App.tsx','src/main.tsx','index.html','public/_headers','public/_redirects','public/_routes.json','.gitignore','.oxlintrc.json','src/features/landing/data/site.ts','src/features/landing/components/ze04/CommunityContact.tsx','src/features/landing/components/ze04/CommunityContact.css'])
const normalize=b=>b.toString('utf8').replace(/\r\n/g,'\n')
const paths=execFileSync('git',['ls-tree','-r','--name-only',baseline.head]).toString().trim().split('\n').filter(p=>!p.startsWith('.nox/')&&!allowed.has(p))
const changes=[]
for(const p of paths){const old=execFileSync('git',['show',`${baseline.head}:${p}`],{maxBuffer:250*1024*1024}),current=fs.readFileSync(p);if(!old.equals(current)&&normalize(old)!==normalize(current))changes.push(p)}
const ownerDocs=Object.entries(baseline.files).map(([file,hash])=>({file,unchanged:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===hash}))
const report={authorizedPartnerFollowup:'SKG Instagram link only; OmnyaTech unlinked; independently verified in ZE-UX-SKG-01/qa.json',baseline:baseline.head,protectedTrackedFiles:paths.length,unexpectedChanges:changes,ownerDocs,untrackedPreserved:['new_interface','src/planos'].map(p=>({path:p,exists:fs.existsSync(p)})),noProductionChanges:true}
fs.writeFileSync('.nox/evidence/ZE-10.2/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(changes.length||ownerDocs.some(x=>!x.unchanged))process.exitCode=1
