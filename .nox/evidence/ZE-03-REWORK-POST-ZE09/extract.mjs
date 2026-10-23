import sharp from 'sharp';
const d='.nox/evidence/ZE-03-REWORK-POST-ZE09';
const mask=await sharp('public/hero/car-reference.webp').resize(710,360,{fit:'fill'}).extractChannel('alpha').raw().toBuffer();
const rgb=await sharp('new_interface/1.png').extract({left:478,top:400,width:710,height:360}).removeAlpha().raw().toBuffer();
const rgba=Buffer.alloc(710*360*4);for(let i=0;i<710*360;i++){rgba[i*4]=rgb[i*3];rgba[i*4+1]=rgb[i*3+1];rgba[i*4+2]=rgb[i*3+2];rgba[i*4+3]=mask[i]}
await sharp(rgba,{raw:{width:710,height:360,channels:4}}).png().toFile(`${d}/car-original-rgba.png`);
