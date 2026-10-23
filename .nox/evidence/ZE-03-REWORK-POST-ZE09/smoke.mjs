import { chromium } from 'playwright'
import fs from 'node:fs'
const d='.nox/evidence/ZE-03-REWORK-POST-ZE09', browser=await chromium.launch(), checks=[]
const check=(name,pass,details)=>{checks.push({name,pass,details});if(!pass)throw Error(name)}
try {
for(const width of [1440,390]) {
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}), errors=[], requests=[]
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()))
 await p.goto('http://127.0.0.1:5173/')
 await p.getByRole('button',{name:'Recusar opcionais',exact:true}).click()
 await p.getByRole('button',{name:'Buscar no site',exact:true}).click()
 await p.locator('#zelo-search-input').fill('higienizacao')
 check(width+' search autofocus/results',await p.locator('#zelo-search-input').evaluate(el=>el===document.activeElement)&&await p.locator('.zelo-search-results a').count()>0)
 await p.keyboard.press('Escape'); check(width+' search focus return',await p.getByRole('button',{name:'Buscar no site',exact:true}).evaluate(el=>el===document.activeElement))
 if(width===390){await p.getByRole('button',{name:'Abrir menu',exact:true}).click();await p.keyboard.press('Escape');await p.locator('#zelo-mobile-menu').waitFor({state:'detached'});check('mobile menu escape/focus',await p.getByRole('button',{name:'Abrir menu',exact:true}).evaluate(el=>el===document.activeElement))}
 for(const id of ['servicos','resultados','processo','marcas','instagram','avaliacoes','localizacao','contato']){await p.locator('#'+id).scrollIntoViewIfNeeded();check(width+' section '+id,await p.locator('#'+id).isVisible())}
 await p.waitForTimeout(600)
 check(width+' WhatsApp destination',/wa.me|api.whatsapp/.test(await p.locator('.zelo-header-budget').getAttribute('href')))
 check(width+' maps preserved',await p.locator('a[href*="maps"]').count()>0)
 check(width+' official Google CTAs',await p.locator('#avaliacoes [data-analytics-review]').count()===2)
 await p.getByRole('button',{name:'Privacidade e cookies',exact:true}).click();check(width+' consent dialog',await p.getByRole('dialog',{name:'Sua privacidade na Zelo'}).isVisible());await p.keyboard.press('Escape')
 check(width+' no canvas/glb/Three',await p.locator('canvas').count()===0&&!requests.some(x=>/\.glb|\/three[-.]/.test(x)))
 check(width+' no browser exceptions',errors.length===0,errors)
 await p.screenshot({path:d+'/smoke-'+width+'.png',fullPage:true});await p.close()
}
} finally {fs.writeFileSync(d+'/smoke-results.json',JSON.stringify({checks},null,2));await browser.close()}
console.log(checks.length+' PASS')
