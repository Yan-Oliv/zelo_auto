import fs from 'node:fs'
import { createServer } from 'vite'
import postcss from 'postcss'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const {renderHero} = await server.ssrLoadModule('/src/prerender.tsx')
  let markup = renderHero().replace(/<link[^>]+rel="preload"[^>]*>/g, '')
  // Vite SSR renders source import paths; resolve the real emitted identities.
  const assets = fs.readdirSync('dist/assets')
  const logoAsset = assets.find(x=>x.startsWith('zelo_icon_png_optimized-'))
  if (!logoAsset) throw new Error('Emitted Zelo logo asset missing')
  markup = markup.replace(/\/src\/[^" ]+zelo_icon_png_optimized\.png/g, '/assets/'+logoAsset)
  if (/\/(?:src|assets\/undefined)\//.test(markup)) throw new Error('Unresolved source asset in prerendered hero')
  let html = fs.readFileSync('dist/index.html','utf8')
  const start = html.indexOf('<div id="root">'), end = html.indexOf('    <noscript>', start)
  if(start<0||end<0)throw new Error('Native recovery boundaries missing')
  const native = html.slice(start+'<div id="root">'.length,end).trim().replace(/<\/div>\s*$/, '')
  // A noscript element is raw text when scripting is enabled: nesting another
  // noscript would end it early and leak native recovery markup into the page.
  const nativeWithoutScripts = native.replace(/<noscript>[\s\S]*?<\/noscript>/g,'').replaceAll('data-error-src=', 'src=')
  html = html.slice(0,start)+`<div id="root" data-prerendered>${markup}</div><template id="zelo-native-recovery">${native}</template><script>${fs.readFileSync('scripts/hero-bootstrap.js','utf8')}</script><noscript><style>#root[data-prerendered]{display:none}</style>${nativeWithoutScripts}</noscript>\n`+html.slice(end)
  // Extract the actual built selectors used by the visible header/hero. The
  // complete stylesheet stays unchanged and loads after this critical frame.
  const classes = new Set([...markup.matchAll(/class="([^"]+)"/g)].flatMap(m=>m[1].split(/\s+/)))
  const stylesheet = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/)
  if(!stylesheet)throw new Error('Built stylesheet missing')
  const css = postcss.parse(fs.readFileSync('dist'+stylesheet[1],'utf8'))
  const keepRule = selector => /(^|[,\s])(?:html|body|:root|\*|#root)(?=[,\s.:>]|$)/.test(selector) || [...selector.matchAll(/\.([\w-]+)/g)].some(m=>classes.has(m[1]))
  const prune = container => {for(const node of [...container.nodes]){if(node.type==='rule'&&!keepRule(node.selector))node.remove();else if(node.type==='atrule'&&node.nodes&&!/keyframes|font-face/.test(node.name)){prune(node);if(!node.nodes.length)node.remove()}}}
  prune(css)
  const critical=css.toString()
  html=html.replace(stylesheet[0],`<style data-critical-hero>${critical}</style><link rel="stylesheet" href="${stylesheet[1]}" media="print" onload="this.media='all'"><noscript>${stylesheet[0]}</noscript>`)
  fs.writeFileSync('dist/index.html',html)
  console.log(`Prerendered independent hero: HTML${Buffer.byteLength(markup)}B criticalCSS${Buffer.byteLength(critical)}B`)
} finally { await server.close() }
