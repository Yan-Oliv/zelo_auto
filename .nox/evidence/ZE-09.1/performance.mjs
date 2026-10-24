import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import lighthouse from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/index.js'
import * as launcher from 'file:///C:/Users/yanog/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/chrome-launcher/dist/index.js'

// Same static built-app conditions, no credentials or real provider requests.
// Public API endpoints deliberately return 503 so both builds exercise fallback.
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' }
const summary = { baselineCommit: 'bcddcc8', conditions: 'Lighthouse default simulated throttling; fresh Chrome per run; static builds; no saved consent; APIs deterministic503; one run per viewport per build', runs: [] }
for (const [phase, root, port] of [['baseline', '.nox/evidence/ZE-09.1/baseline-dist', 4201], ['final', 'dist', 4202]].filter(x => !process.argv[2] || x[0] === process.argv[2])) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) { res.writeHead(503, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify({ error: { category: 'configuration' } })); return }
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')
    let file = path.resolve(root, rel || 'index.html')
    if (!file.startsWith(path.resolve(root) + path.sep) && file !== path.resolve(root)) { res.writeHead(403); res.end(); return }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html')
    res.writeHead(200, { 'content-type': mime[path.extname(file)] ?? 'application/octet-stream' }); fs.createReadStream(file).pipe(res)
  })
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve))
  try {
    for (const mode of ['mobile', 'desktop']) {
      const chrome = await launcher.launch({ chromeFlags: ['--headless', '--no-sandbox'] })
      try {
        const existing = `.nox/evidence/ZE-09.1/performance-${phase}-${mode}.json`
        const { lhr } = fs.existsSync(existing) && !process.env.ZE091_RERUN ? { lhr: JSON.parse(fs.readFileSync(existing, 'utf8')) } : await lighthouse(`http://127.0.0.1:${port}/`, { port: chrome.port, onlyCategories: ['performance', 'accessibility'], formFactor: mode, screenEmulation: mode === 'desktop' ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1 } : undefined, output: 'json', logLevel: 'error' })
        fs.writeFileSync(`.nox/evidence/ZE-09.1/performance-${phase}-${mode}.json`, JSON.stringify(lhr))
        const resources = lhr.audits['resource-summary'].details.items
        const requests = resources.find(item => item.resourceType === 'total')
        const scripts = resources.find(item => item.resourceType === 'script')
        const result = { phase, mode, score: lhr.categories.performance.score * 100, accessibility: lhr.categories.accessibility.score * 100, LCP: lhr.audits['largest-contentful-paint'].numericValue, CLS: lhr.audits['cumulative-layout-shift'].numericValue, TBT: lhr.audits['total-blocking-time'].numericValue, requests, scripts, consoleErrors: lhr.audits['errors-in-console']?.details?.items ?? null, runtimeError: lhr.runtimeError, runWarnings: lhr.runWarnings }
        summary.runs.push(result); console.log(JSON.stringify(result))
        fs.writeFileSync('.nox/evidence/ZE-09.1/performance-summary.json', JSON.stringify(summary, null, 2))
      } finally { await chrome.kill() }
    }
  } finally { await new Promise(resolve => server.close(resolve)) }
}
