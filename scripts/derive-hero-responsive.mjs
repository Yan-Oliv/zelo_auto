import fs from 'node:fs'
import crypto from 'node:crypto'
import sharp from 'sharp'
const dir='.nox/evidence/ZE-11-REWORK'
fs.mkdirSync(dir,{recursive:true})
const source='public/hero/showroom-final.webp',portrait='public/hero/showroom-portrait.webp'
const crop={left:366,top:0,width:940,height:940}
await sharp(source).extract(crop).webp({quality:95,effort:6}).toFile(portrait)
const logoSource='public/hero/responsive/zelo-logo-480.webp',logo='public/hero/responsive/zelo-logo-320.webp'
await sharp(logoSource).resize({width:320,withoutEnlargement:true}).webp({quality:95,effort:6}).toFile(logo)
await sharp('public/favicon-optimized.png').resize({width:64,height:64,withoutEnlargement:true}).png({compressionLevel:9}).toFile('public/favicon-64-v1.png')
const info=f=>({file:f,bytes:fs.statSync(f).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')})
fs.writeFileSync(dir+'/responsive-assets.json',JSON.stringify({method:'Deterministic same-center square crop of original portrait backdrop; identical framing/object-fit for aspect<=1; quality95 balanced WebP encoding, no generated imagery or scene change. Desktop source unchanged. Logo resized without upscale for mobile2x/3x sampling.',crop,source:info(source),portrait:info(portrait),logoSource:info(logoSource),logo:info(logo)},null,2)+'\n')
