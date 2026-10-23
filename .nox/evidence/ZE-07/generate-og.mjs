import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
await mkdir('public/og', { recursive: true })
const bg = await sharp('public/hero/showroom-reference.webp').resize(1200, 630, { fit: 'cover', position: 'centre' }).modulate({ brightness: 0.78, saturation: 0.9 }).png().toBuffer()
const car = await sharp('public/hero/car-reference.webp').resize({ width: 560 }).png().toBuffer()
const shadow = Buffer.from('<svg width="760" height="90"><defs><radialGradient id="s"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="380" cy="45" rx="370" ry="42" fill="url(#s)"/></svg>')
const zelo = Buffer.from('<svg width="1000" height="190" xmlns="http://www.w3.org/2000/svg"><text x="500" y="155" text-anchor="middle" font-family="Arial,sans-serif" font-size="210" font-weight="700" letter-spacing="4" fill="none" stroke="#d7b16b" stroke-opacity=".28" stroke-width="1.5">ZELO</text></svg>')
await sharp(bg).composite([
 { input: zelo, left: 100, top: 70 },
 { input: shadow, left: 220, top: 495 },
 { input: car, left: 320, top: 340 }
]).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og/zelo-estetica-automotiva-catalao.jpg')
