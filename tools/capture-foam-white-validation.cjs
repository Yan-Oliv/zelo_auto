const { chromium } = require('playwright')

const cases = [
  ['front', '&foamView=front'],
  ['lateral', ''],
  ['rear', '&foamView=rear'],
  ['shell-only', '&foamShellOnly=1'],
  ['glb-plus-shell', ''],
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  for (const [name, extra] of cases) {
    await page.goto(`http://127.0.0.1:4173/?debugFoamShell=1&foamSource=paint${extra}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `artifacts/screenshots/foam-white-${name}.png`, fullPage: false })
  }
  await browser.close()
}

run().catch((error) => { console.error(error); process.exit(1) })
