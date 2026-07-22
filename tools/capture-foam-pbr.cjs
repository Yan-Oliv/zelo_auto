const { chromium } = require('playwright')
const presets = ['creamy', 'balanced', 'wet']
const coverages = ['45', '70', '95']
const cases = presets.flatMap((preset) => coverages.map((coverage) => [
  `${preset}-${coverage}`,
  `&foamPreset=${preset}&foamCoverage=.${coverage}`,
])).concat([
  ['current-095', '&foamPreset=current&foamCoverage=.95'],
  ['balanced-095-neutral', '&foamPreset=balanced&foamCoverage=.95&foamPbrNeutralLight=1'],
  ['balanced-095-shell-only', '&foamPreset=balanced&foamCoverage=.95&foamShellOnly=1'],
  ['balanced-070-lateral', '&foamPreset=balanced&foamCoverage=.70'],
  ['balanced-070-rear', '&foamPreset=balanced&foamCoverage=.70&foamView=rear'],
])
async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  for (const [name, extra] of cases) {
    await page.goto(`http://127.0.0.1:4173/?debugFoamPBR=1${extra}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(850)
    await page.screenshot({ path: `artifacts/screenshots/foam-pbr-${name}.png`, fullPage: false })
  }
  await page.goto('http://127.0.0.1:4173/?debugFoamPBR=1&foamPreset=balanced&foamCoverage=.95', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(850)
  for (const [name, clip] of [
    ['balanced-095-close-hood', { x: 0, y: 485, width: 700, height: 300 }],
    ['balanced-095-close-door', { x: 610, y: 470, width: 560, height: 360 }],
    ['balanced-095-close-fender', { x: 615, y: 600, width: 390, height: 340 }],
  ]) {
    await page.screenshot({ path: `artifacts/screenshots/foam-pbr-${name}.png`, clip })
  }
  await browser.close()
}
run().catch((error) => { console.error(error); process.exit(1) })
