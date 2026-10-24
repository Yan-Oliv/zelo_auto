import { errorMessages, type ErrorCode } from './errorMessages'

/** Remove landing-specific claims while a recovery screen is displayed. */
export function applyErrorMetadata(code: ErrorCode): () => void {
  if (!document.querySelector('link[href="/errors/error-page.css"]')) {
    const stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href = '/errors/error-page.css'
    document.head.append(stylesheet)
  }
  const originalTitle = document.title
  const removed: { element: Element; next: ChildNode | null }[] = []
  const previousRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  const originalRobots = previousRobots?.content
  const robots = previousRobots ?? document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow, noarchive'
  if (!previousRobots) document.head.append(robots)
  document.title = `${code} — ${errorMessages[code].title} | Zelo`
  document.querySelectorAll('link[rel="canonical"], script[type="application/ld+json"], meta[property^="og:"], meta[name^="twitter:"]').forEach((element) => {
    removed.push({ element, next: element.nextSibling })
    element.remove()
  })
  return () => {
    document.title = originalTitle
    if (previousRobots) robots.content = originalRobots ?? ''
    else robots.remove()
    // Preserve original document order, including adjacent removed metadata.
    for (const { element, next } of removed.reverse()) {
      document.head.insertBefore(element, next?.parentNode === document.head ? next : null)
    }
  }
}
