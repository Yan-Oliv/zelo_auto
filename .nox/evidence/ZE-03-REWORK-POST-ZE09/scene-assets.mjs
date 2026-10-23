import sharp from 'sharp';
const d='.nox/evidence/ZE-03-REWORK-POST-ZE09';
const holes=await sharp(Buffer.from(`<svg width="1672" height="940"><g fill="white"><path d="M-100 -100H1772V105H-100Z"/><path d="M350 120H1300V1040H350Z"/><path d="M-100 440H570V540H-100Z"/><path d="M1160 440H1772V540H1160Z"/></g></svg>`)).blur(14).png().toBuffer();
const layer=await sharp('new_interface/1.png').ensureAlpha().composite([{input:holes,blend:'dest-out'}]).png().toBuffer();
await sharp(`${d}/showroom-clean-imagegen-edit.png`).resize(1672,940,{fit:'fill'}).composite([{input:layer}]).webp({quality:96}).toFile('public/hero/showroom-final.webp');
for(const width of [840,1280])await sharp('public/hero/showroom-final.webp').resize(width).webp({quality:90}).toFile(`public/hero/responsive/showroom-final-${width}.webp`);
