import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const hash = b => createHash('sha256').update(b).digest('hex')
const manifest = { treatment: 'EXIF orientation normalization, proportional downsample and WebP only. Full 4:3 frames preserve wheel arch, body and tire. Different camera angles are disclosed; no geometric warping, exposure, color or synthetic cleanup.', assets: [] }
for (const [sourceName, state] of [['Sujo', 'before'], ['Limpo', 'after']]) {
  const source = `B:/Downloads/Zelo/Pintura/${sourceName}.jpeg`
  const bytes = await readFile(source)
  const metadata = await sharp(bytes).metadata()
  const record = { source, sha256: hash(bytes), width: metadata.width, height: metadata.height, orientation: metadata.orientation, derivatives: [] }
  for (const width of [420, 640, 960, 1200]) {
    const dest = width === 1200 ? `public/editorial/comparison-paint-${state}.webp` : `public/editorial/responsive/comparison-paint-${state}-${width}.webp`
    await mkdir('public/editorial/responsive', { recursive: true })
    const output = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toBuffer()
    await writeFile(dest, output)
    const m = await sharp(output).metadata()
    record.derivatives.push({ path: dest, width: m.width, height: m.height, bytes: output.length, sha256: hash(output) })
  }
  manifest.assets.push(record)
}
await writeFile('.nox/evidence/ZE-10.1/paint-assets-manifest.json', JSON.stringify(manifest, null, 2) + '\n')
