import {chromium} from 'playwright';import fs from 'node:fs';
const dir='.nox/evidence/ZE-03-REWORK-POST-ZE09';const browser=await chromium.launch();
for(const [name,width,height] of [['desktop',1672,940],['tablet',768,1024],['mobile',390,844]]){const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:5173/');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);await page.screenshot({path:`${dir}/baseline-${name}.png`});await page.close()}await browser.close();
