import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {execFileSync} from 'node:child_process'
const root='.nox/evidence/ZE-11',base=JSON.parse(fs.readFileSync(root+'/checkpoint.json','utf8'))
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name).replaceAll('\\','/')])
const excluded=new Set(['runtime-empty.env','preexisting-docs.patch','font-diagnosis.txt','security-preservation-log.txt','package-log.txt'])
const selected=walk(root).filter(f=>{
 const local=f.slice(root.length+1)
 if(local.startsWith('baseline-dist/')||local.includes('/test-only-dist/')||excluded.has(local)||local.endsWith('-trace.json')||local==='evidence-index.json')return false
 if(local.startsWith('qa-matrix/'))return local.endsWith('.json')||/MOCK-global-(2560x1440|844x390)\.png$/.test(local)
 if(local.startsWith('qa-errors/screens/'))return /\/(404-(1440|390)|500-390|503-320|boot-blocked-main)\.png$/.test(local)
 return true
}).sort()
const index={baseline:base.head,checkpoint:base.checkpoint,branch:base.branch,selection:'Reproducible harnesses, reports/raw Lighthouse (without bulky traces), all real five-area screenshots/selected errors, videos, prior failure ledgers. Built baseline/traces retained locally only, reproducible from baseline Git tag. No owner patch/env files included.',files:selected.map(file=>({file,bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))}
fs.writeFileSync(root+'/evidence-index.json',JSON.stringify(index,null,2)+'\n')
execFileSync('git',['add','-f','--',...selected,root+'/evidence-index.json'],{maxBuffer:10*1024*1024})
console.log(JSON.stringify({files:index.files.length,totalBytes:index.files.reduce((s,x)=>s+x.bytes,0),indexSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/evidence-index.json')).digest('hex')},null,2))
