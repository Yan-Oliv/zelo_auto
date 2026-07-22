const { chromium } = require('playwright')

const cases = [
  ['020', '&foamCoverage=.20'],
  ['045', '&foamCoverage=.45'],
  ['070', '&foamCoverage=.70'],
  ['095', '&foamCoverage=.95'],
  ['070-lateral', '&foamCoverage=.70'],
  ['070-rear', '&foamCoverage=.70&foamView=rear'],
  ['070-shell-only', '&foamCoverage=.70&foamShellOnly=1'],
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  for (const [name, extra] of cases) {
    await page.goto(`http://127.0.0.1:4173/?debugFoamStatic=1${extra}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `artifacts/screenshots/foam-static-${name}.png`, fullPage: false })
  }
  await browser.close()
}

run().catch((error) => { console.error(error); process.exit(1) })
