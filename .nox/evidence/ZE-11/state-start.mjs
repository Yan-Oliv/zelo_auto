import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
const ext = "B:/OmnyaTech Project's/OmnyaTech/Orchestrator/projects/ZELO/"
const dir = '.nox/evidence/ZE-11/'
fs.mkdirSync(dir, { recursive: true })
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const protectedFiles = ['.nox/ZE-09-Google-Handoff.md', '.nox/ZE-09-Report.md']
const protectedHashes = Object.fromEntries(protectedFiles.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))
fs.writeFileSync(dir+'preexisting-docs.patch', execFileSync('git',['diff','--',...protectedFiles]))
const checkpoint = 'ZE-11-start-20261024'
if (!git('tag','--list',checkpoint)) git('tag',checkpoint)
fs.writeFileSync(dir+'checkpoint.json', JSON.stringify({date:'2026-10-24',branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),checkpoint,status:git('status','--short'),protectedHashes},null,2)+'\n')
const approval = {date:'2026-10-24',scope:'Implemented cinematic hero only; does not approve complete ZE-11 landing',ownerStatement:'A hero está aprovada visualmente',acceptedSprint:'ZE-03-REWORK-POST-ZE09',implementationCommit:'cbd4b26',technicalReport:'.nox/ZE-03-REWORK-POST-ZE09-Report.md'}
fs.writeFileSync(dir+'hero-owner-approval.json',JSON.stringify(approval,null,2)+'\n')
const record = '2026-10-24 — ZE-11 CURRENT by explicit owner contract 5a2e6c2f-a413-4a4b-99ef-e46eeedcf9ac. Latest owner statement "A hero está aprovada visualmente" accepts the implemented hero, completing ZE-03-REWORK-POST-ZE09 whose technical checks were already reviewed; it does not accept the entire landing. ZE-09 remains WAITING_USER_ACTION for official Google approval/OAuth/server configuration/authentic data; explicit exception authorizes all independent ZE-11 work. Exactly two deliveries: full regression QA; visual/functional homologation and handoff. Baseline0827b0d, checkpointZE-11-start-20261024, branchwork/ze-audi-redesign; two dirty owner ZE-09 documents hashed/backed up, untracked references/planos and secrets preserved. No deployment, push, Cloud/OAuth/billing changes or ZE-12 execution. Performance targets will be measured honestly, with explicit mobile/desktop and cold/warm profiles; no advance acceptance.'
for(const f of ['.nox/00-Execution-Map.md',ext+'execution-map.md']) {
 let s=fs.readFileSync(f,'utf8').replace(/\| ZE-03-REWORK-POST-ZE09 \|[^\r\n]*/, '| ZE-03-REWORK-POST-ZE09 | Final hero correction | COMPLETED | ZE-09 (explicit limited exception) | Owner explicitly accepted implemented hero2026-10-24; technical evidence preserved |').replace(/\| ZE-11 \|[^\r\n]*/, '| ZE-11 | General local homologation | CURRENT | Completed predecessors; explicit independence from pending ZE-09 | Two deliveries: regression QA and visual/functional homologation |')
 fs.writeFileSync(f,s+'\n\n'+record+'\n')
}
for(const f of ['.nox/Execution-Log.md','.nox/ZE-Sprint-Contracts.md',...['sprints.md','state.md','execution-log.md','history.md','decisions.md','backlog.md','completion-checklist.md'].map(n=>ext+n)])fs.appendFileSync(f,'\n\n'+record+'\n')
const file='.nox/execution-state.json',s=JSON.parse(fs.readFileSync(file,'utf8'))
const hero=s.sprints.find(x=>x.id==='ZE-03-REWORK-POST-ZE09');hero.status='COMPLETED';hero.humanVisualApproval=true;hero.ownerApproval=approval
for(const c of hero.criteria??[])if(c.status==='PENDING'){c.status='PASS';c.evidence=[...(c.evidence??[]),'evidence/ZE-11/hero-owner-approval.json']}
const sprint=s.sprints.find(x=>x.id==='ZE-11');sprint.status='CURRENT';sprint.deliveries=['Full regression QA','Visual and functional homologation and handoff'];sprint.exception='Owner explicitly authorizes independent validation while ZE-09 Google remains pending';sprint.criteria=['Regression functionality','Visual and responsive validation','Technical quality and measured performance','Human approval and integrated Google handoff'].map((description,i)=>({id:`ZE-11-C0${i+1}`,description,required:true,status:'PENDING',evidence:[]}))
Object.assign(s,{status:'CURRENT',stopReason:null,currentSprint:'ZE-11',currentApprovedSprint:'ZE-11',currentStep:'Independent full regression and visual homologation; hero human approval recorded',nextAction:'Validate, correct internal findings, measure performance and prepare local owner approval; do not execute ZE-12'})
fs.writeFileSync(file,JSON.stringify(s,null,2)+'\n')
fs.writeFileSync(ext+'execution-state.json',JSON.stringify({version:1,project:'ZELO',status:'CURRENT',currentActivity:'ZE-11',nextActivities:['ZE-12'],stopState:null,lastCheckpointUtc:new Date().toISOString(),mapSnapshot:{total:s.sprints.length,completed:s.sprints.filter(x=>x.status==='COMPLETED').length,active:1,queued:1,stopStates:1}},null,2)+'\n')
const report='.nox/ZE-03-REWORK-POST-ZE09-Report.md';let text=fs.readFileSync(report,'utf8');text=text.replace('State: WAITING_USER_ACTION. Technical implementation and checks reviewed by root/Nox; owner visual acceptance of this new implementation is PENDING.','State: COMPLETED. Technical implementation and checks reviewed by root/Nox; owner explicitly accepted the implemented hero on2026-10-24: "A hero está aprovada visualmente".');fs.writeFileSync(report,text+'\n\n## Owner acceptance2026-10-24\nThe latest explicit statement closes only this hero visual gate. Evidence: `.nox/evidence/ZE-11/hero-owner-approval.json`. It does not grant final landing acceptance, Google integration acceptance, production or ZE-12 authorization. Historical performance limits remain documented.\n')
console.log(JSON.stringify({checkpoint,hero:'COMPLETED',ze11:'CURRENT',protectedHashes},null,2))
