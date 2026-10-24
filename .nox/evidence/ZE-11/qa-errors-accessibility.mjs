import {chromium} from 'playwright'
import AxeBuilder from '../ZE-05-local-tools/node_modules/@axe-core/playwright/dist/index.mjs'
import fs from 'node:fs'
const browser=await chromium.launch(),results={kind:'Automated axe WCAG2 A/AA,2.1AA,2.2AA; actual Cloudflare-compatible local runtime. No physical assistive-technology certification.',results:[]}
try{
 for(const code of [404,500,503])for(const [width,height]of [[1366,768],[320,640]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),p=await ctx.newPage();await p.goto(`http://127.0.0.1:8888/${code}.html`);await p.locator(`[data-error-code="${code}"]`).waitFor();await p.evaluate(()=>document.fonts.ready);const scan=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();results.results.push({code,width,height,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),incomplete:scan.incomplete.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),passes:scan.passes.length});await ctx.close()
 }
}finally{await browser.close();fs.writeFileSync('.nox/evidence/ZE-11/qa-errors/accessibility.json',JSON.stringify(results,null,2))}
console.log(JSON.stringify(results,null,2));if(results.results.some(r=>r.violations.length))process.exitCode=1
