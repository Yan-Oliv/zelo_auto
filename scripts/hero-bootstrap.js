// The prerendered hero uses the same DOM/CSS before React hydrates it.
// No metrics-specific branch: all visitors receive the same timing and artwork.
(() => {
  const hero = document.getElementById('hero')
  if (!hero) return
  const key = 'zelo:hero-intro:v4'
  const bootstrap = window.__ZELO_HERO_BOOTSTRAP__ = { state: 'waiting', startedAt: 0, artwork: {} }
  const setState = (state) => {
    bootstrap.state = state
    hero.dataset.intro = state
    const header = document.querySelector('header.zelo-site-header')
    if (header) header.dataset.intro = state
    window.dispatchEvent(new Event('zelo:hero-bootstrap'))
  }
  const remember = () => { try { sessionStorage.setItem(key, 'complete') } catch {} }
  const images = [...document.querySelectorAll('.zelo-hero-backdrop,.zelo-hero-car-body,.zelo-hero-reflection img,.zelo-header-brand img')]
  // An SSR image can fail before React attaches its event handlers. Keep the
  // existing safe artwork fallbacks available during that early interval too.
  for (const image of images) {
    const artwork = image.classList.contains('zelo-hero-backdrop') ? 'backdrop'
      : image.classList.contains('zelo-hero-car-body') || image.closest('.zelo-hero-reflection') ? 'car' : null
    const fallback = artwork === 'backdrop' ? '/hero/showroom-reference.webp' : artwork === 'car' ? '/hero/car-reference.webp' : null
    if (!fallback) continue
    const recover = () => {
      if (image.getAttribute('src') === fallback) return
      bootstrap.artwork[artwork] = true
      const targets = artwork === 'car' ? document.querySelectorAll('.zelo-hero-car-body,.zelo-hero-reflection img') : [image]
      for (const target of targets) {
        target.closest('picture')?.querySelectorAll('source').forEach(source => source.remove())
        target.removeAttribute('srcset')
        target.src = fallback
      }
    }
    image.addEventListener('error', recover)
    if (image.complete && image.naturalWidth === 0) recover()
  }
  let seen = false
  try { seen = sessionStorage.getItem(key) === 'complete' } catch {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { remember(); setState('settled'); return }
  let ready = false
  let scheduled = false
  let finished = false
  let assetTimeout
  let introTimeout
  const finish = () => {
    if (finished) return
    finished = true
    clearTimeout(assetTimeout)
    clearTimeout(introTimeout)
    document.removeEventListener('visibilitychange', start)
    window.removeEventListener('scroll', leave)
    remember()
    setState('settled')
  }
  const leave = () => { if (hero.getBoundingClientRect().bottom < 200) finish() }
  const start = () => {
    if (finished || !ready || scheduled || document.visibilityState !== 'visible') return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return }
    scheduled = true
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (finished) return
      if (document.visibilityState !== 'visible') { scheduled = false; return }
      bootstrap.startedAt = performance.now()
      setState('playing')
      introTimeout = setTimeout(finish, 3300)
    }))
  }
  document.addEventListener('visibilitychange', start)
  window.addEventListener('scroll', leave, { passive: true })
  hero.addEventListener('animationend', event => {
    if (event.animationName === 'zelo-car-arrive' && event.target.classList.contains('zelo-hero-car')) event.target.style.animation = 'none'
  })
  Promise.allSettled([...images.map(async image => { try { await image.decode() } catch { await image.decode().catch(() => {}) } }), document.fonts.load('400 16px "Zelo Hero"')]).then(() => { ready = true; start() })
  assetTimeout = setTimeout(() => { ready = true; start() }, 1800)
})()
