const { chromium } = require('playwright')

async function capture(source) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:4173/?debugCinematic=1&debugFoamShell=1&foamSource=${source}`, { waitUntil: 'networkidle' })
  const slider = page.locator('input[type=range]')
  await slider.evaluate((element) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(element, '0.60')
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `artifacts/screenshots/foam-source-${source}-after-groups.png`, fullPage: false })
  await browser.close()
}

Promise.all(['paint', 'body', 'all'].map(capture)).catch((error) => { console.error(error); process.exit(1) })
