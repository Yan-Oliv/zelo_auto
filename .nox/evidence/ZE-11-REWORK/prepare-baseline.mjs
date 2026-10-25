import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {build} from 'vite'
const dir='.nox/evidence/ZE-11-REWORK',root=path.resolve(dir+'/baseline-source')
fs.mkdirSync(root,{recursive:true})
execFileSync('git',['archive','6bdd370','src','public','functions','index.html','vite.config.ts','postcss.config.js','tailwind.config.ts','package.json','tsconfig.app.json'],{maxBuffer:500*1024*1024,stdio:['ignore',fs.openSync(dir+'/baseline-source.tar','w'),'pipe']})
execFileSync('tar',['-xf',dir+'/baseline-source.tar','-C',root])
await build({root,configFile:path.join(root,'vite.config.ts'),build:{outDir:path.resolve(dir+'/baseline-dist'),emptyOutDir:true},logLevel:'warn'})
console.log('Built original candidate6bdd370 baseline without source changes or dependency junctions')
