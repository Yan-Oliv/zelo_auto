import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { responsiveImages } from './responsiveImages'

// One observer for editorial photos: native lazy loading can fetch several
// screens ahead, competing with the decoded artwork in the hero intro.
const pending = new Map<Element, () => void>()
let observer: IntersectionObserver | undefined
function observe(element: Element, ready: () => void) {
  if (!('IntersectionObserver' in window)) { ready(); return () => {} }
  observer ??= new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      pending.get(entry.target)?.()
      pending.delete(entry.target)
      observer?.unobserve(entry.target)
    }
  }, { rootMargin: '400px 0px' })
  pending.set(element, ready)
  observer.observe(element)
  return () => { pending.delete(element); observer?.unobserve(element) }
}

function editorialSize(src: string) {
  if (/car-4k/.test(src)) return '(max-width: 700px) 80vw, 48vw'
  if (/showroom/.test(src)) return '80vw'
  if (/process-detail|quality-products|location-scene/.test(src)) return '(max-width: 900px) 100vw, 75vw'
  if (/process-/.test(src)) return '(max-width: 600px) 80vw, 22vw'
  if (/comparison-/.test(src)) return '(max-width: 600px) 90vw, (max-width: 900px) 44vw, (max-width: 1100px) 29vw, (min-width: 1600px) 350px, 22vw'
  return '(max-width: 600px) 90vw, (max-width: 1100px) 44vw, 23vw'
}
export function NearImage({ src, srcSet, sizes, original = false, ...props }: ImgHTMLAttributes<HTMLImageElement> & { original?: boolean }) {
  const ref = useRef<HTMLImageElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => ref.current ? observe(ref.current, () => setReady(true)) : undefined, [])
  const sources = src && !original ? responsiveImages[src] : undefined
  return <img {...props} ref={ref} src={ready ? src : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} srcSet={ready ? srcSet ?? sources?.srcSet : undefined} sizes={sizes ?? (sources && src ? editorialSize(src) : undefined)} data-near-image={ready ? 'ready' : 'waiting'} />
}
