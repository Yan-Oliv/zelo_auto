import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
const dir='.nox/evidence/ZE-11/',baseline=JSON.parse(fs.readFileSync(dir+'checkpoint.json','utf8'))
const git=(...args)=>execFileSync('git',args,{maxBuffer:100*1024*1024})
const tracked=git('ls-files').toString().trim().split('\n')
assert.ok(!tracked.some(f=>/(^|\/)\.env($|\.)/.test(f)&&!f.endsWith('.env.example')))
const protectedDocs=Object.entries(baseline.protectedHashes).map(([file,expected])=>({file,unchanged:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===expected}))
assert.ok(protectedDocs.every(x=>x.unchanged))
const protectedPaths=tracked.filter(f=>f.startsWith('public/hero/')||f.startsWith('public/editorial/')||f==='src/features/landing/data/site.ts')
const changed=[]
for(const f of protectedPaths){const a=git('show',`${baseline.head}:${f}`),b=fs.readFileSync(f);if(!a.equals(b)&&a.toString().replace(/\r\n/g,'\n')!==b.toString().replace(/\r\n/g,'\n'))changed.push(f)}
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)])
const webFiles=walk('dist').filter(f=>/\.(html|css|js|json|txt|xml)$/.test(f)),findings=[]
for(const f of webFiles){const s=fs.readFileSync(f,'utf8');if(/(?<![A-Za-z0-9+/])(?:IGAA|EAA)[A-Za-z0-9]{60,}(?![A-Za-z0-9+/])|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(s))findings.push({file:f,category:'Possible secret signature; values deliberately not emitted'})}
assert.deepEqual(findings,[])
const allowedProductChanges=['src/features/landing/CinematicHero.css','src/features/landing/components/ze04/NearImage.tsx','src/features/landing/LandingPage.tsx','src/features/landing/hooks/useInstagramFeed.ts','src/features/landing/components/ze04/CommercialSections.css','src/features/landing/components/ze04/CommercialSections.tsx','src/features/landing/components/ze04/CommunityContact.css']
const allChanged=git('diff','--name-only',baseline.head).toString().trim().split('\n').filter(Boolean)
const unexpected=allChanged.filter(f=>!f.startsWith('.nox/')&&!allowedProductChanges.includes(f))
const report={baseline:baseline.head,protectedDocs,protectedAssetAndIdentityFiles:protectedPaths.length,protectedChanges:changed,unexpectedProductChanges:unexpected,credentialFilesTracked:false,bundleFilesScanned:webFiles.length,secretSignatureFindings:findings,untrackedOwnerInputsPreserved:['new_interface','src/planos'].map(p=>({path:p,exists:fs.existsSync(p)})),limits:'Signature scan complements code/API review, not an exhaustive secret scanner. No .env values or provider payloads read or recorded. No deployment/push/remote mutation performed.'}
fs.writeFileSync(dir+'security-preservation.json',JSON.stringify(report,null,2)+'\n')
assert.deepEqual(unexpected,[]);assert.deepEqual(changed,[]);console.log(JSON.stringify(report,null,2))
