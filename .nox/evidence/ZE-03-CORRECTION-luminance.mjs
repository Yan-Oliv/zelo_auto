import {chromium} from 'playwright'
import {readFile,writeFile} from 'node:fs/promises'
const regions={ceiling_center:[640,112,392,78],behind_car:[670,260,330,130],floor_left:[250,690,205,130],floor_right:[1210,690,205,130],floor_under_car:[580,756,510,56],tire_left:[485,734,103,45],tire_right:[1072,734,108,45]}
const files={reference:'b:/Downloads/Hero ZELO_ Luxo Automotivo Cinematográfico.png',superseded:'.nox/evidence/ZE-03-FINAL-reference.png',correction:'.nox/evidence/ZE-03-CORRECTION-reference.png'}
const browser=await chromium.launch(),page=await browser.newPage()
const result={at:new Date().toISOString(),method:'Mean encoded RGB luma 0..255 using Rec.709 coefficients; aligned reference 1672x940 regions. Supporting evidence only, not automatic contact approval.',regions,images:{}}
try{
 for(const [name,path] of Object.entries(files)){
  let data
  try{data=await readFile(path)}catch{continue}
  result.images[name]=await page.evaluate(async({data,regions})=>{
   const img=new Image();img.src='data:image/png;base64,'+data;await img.decode()
   const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0)
   return {width:img.width,height:img.height,luma:Object.fromEntries(Object.entries(regions).map(([name,[x,y,w,h]])=>{
    const p=ctx.getImageData(x,y,w,h).data;let total=0
    for(let i=0;i<p.length;i+=4)total+=.2126*p[i]+.7152*p[i+1]+.0722*p[i+2]
    return [name,Math.round(total/(w*h)*100)/100]
   }))}
  },{data:data.toString('base64'),regions})
 }
}finally{await browser.close()}
await writeFile('.nox/evidence/ZE-03-CORRECTION-luminance.json',JSON.stringify(result,null,2))
console.log(JSON.stringify(result,null,2))
