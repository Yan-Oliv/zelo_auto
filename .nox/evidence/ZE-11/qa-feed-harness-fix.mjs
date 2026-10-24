import fs from 'node:fs'
const dir='.nox/evidence/ZE-11'
fs.copyFileSync(`${dir}/qa-feed/results.json`,`${dir}/qa-feed/results-first.json`)
let s=fs.readFileSync(`${dir}/qa-feed.mjs`,'utf8')
s=s.replace("import{createRoot}from'/node_modules/.vite/deps/react-dom_client.js';", "import ReactDOM from'/node_modules/.vite/deps/react-dom_client.js';const{createRoot}=ReactDOM;")
fs.writeFileSync(`${dir}/qa-feed.mjs`,s)
