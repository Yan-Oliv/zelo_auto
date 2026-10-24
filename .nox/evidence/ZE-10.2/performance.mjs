import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import lighthouse from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/index.js'
import * as launcher from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/chrome-launcher/dist/index.js'
const phase=process.argv[2]||'final',dir='.nox/evidence/ZE-10.2',root=phase==='baseline'?`${dir}/baseline-dist`:'dist'
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'}
const server=http.createServer((req,res)=>{
 const p=decodeURIComponent(req.url.split('?')[0]);if(p.startsWith('/api/')){res.writeHead(503,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({error:{category:'configuration'}}));return}
 let file=path.resolve(root,p.replace(/^\/+/, '')||'index.html');if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);res.end();return}
 if(!fs.existsSync(file))file=path.resolve('public',p.replace(/^\/+/,''));if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res)
});await new Promise(r=>server.listen(4207,'127.0.0.1',r));
const summary={phase,baselineCommit:'742b97f',conditions:'One sample per profile/page; default simulated throttling; fresh Chromium; identical built app; APIs deliberately503; no saved consent; static pages no external dependencies',runs:[]}
try{for(const page of phase==='baseline'?['landing']:['landing','404','500','503'])for(const mode of ['mobile','desktop']){
 const chrome=await launcher.launch({chromeFlags:['--headless','--no-sandbox']});try{
  const {lhr}=await lighthouse(`http://127.0.0.1:4207/${page==='landing'?'':page+'.html'}`,{port:chrome.port,onlyCategories:['performance','accessibility'],formFactor:mode,screenEmulation:mode==='desktop'?{mobile:false,width:1440,height:900,deviceScaleFactor:1}:undefined,output:'json',logLevel:'error'});
  fs.writeFileSync(`${dir}/performance-${phase}-${page}-${mode}.json`,JSON.stringify(lhr));
  const resources=lhr.audits['resource-summary'].details.items;
  summary.runs.push({page,mode,score:lhr.categories.performance.score*100,accessibility:lhr.categories.accessibility.score*100,LCP:lhr.audits['largest-contentful-paint'].numericValue,TBT:lhr.audits['total-blocking-time'].numericValue,CLS:lhr.audits['cumulative-layout-shift'].numericValue,resources,runtimeError:lhr.runtimeError,runWarnings:lhr.runWarnings});
  fs.writeFileSync(`${dir}/performance-${phase}-summary.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary.runs.at(-1)));
 }finally{await chrome.kill()}
}}finally{await new Promise(r=>server.close(r))}
