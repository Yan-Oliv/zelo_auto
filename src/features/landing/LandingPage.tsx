import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CalendarDays, ChevronDown, Search, Menu, X } from 'lucide-react'
import clsx from 'clsx'
import { services, siteConfig } from './data/site'
import { useActiveSection } from '@shared/hooks/useActiveSection'
import { useMotionSettings } from '@shared/motion/MotionSettings'
import { ConsentControls } from '@shared/analytics/ConsentControls'
import { useCommercialAnalytics } from '@shared/analytics/useCommercialAnalytics'
import { track } from '@shared/analytics/analytics'
import './CinematicHero.css'
import './EditorialLanding.css'

const brandName = 'Zelo Est\u00e9tica Automotiva'
const budgetLabel = 'Fa\u00e7a seu or\u00e7amento'
const headerLinks = [
  { label: 'In\u00edcio', href: '#hero' },
  { label: 'Servi\u00e7os', href: '#servicos' },
  { label: 'Sobre', href: '#processo' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Avalia\u00e7\u00f5es', href: '#avaliacoes' },
  { label: 'Contato', href: '#contato' },
]
const searchLinks = [...headerLinks, { label: 'Instagram', href: '#instagram' }, { label: 'Produtos', href: '#marcas' }, { label: 'Localiza\u00e7\u00e3o', href: '#localizacao' }]
const observedSectionIds = ['hero', 'servicos', 'resultados', 'processo', 'marcas', 'instagram', 'avaliacoes', 'localizacao', 'contato', 'parceiros']
const heroIntroKey = 'zelo:hero-intro:v4'
const heroCarSources = '/hero/responsive/car-final-420.webp 420w, /hero/responsive/car-final-640.webp 640w, /hero/car-final.webp 710w'
const heroCarAvifSources = '/hero/responsive/car-final-420.avif 420w, /hero/responsive/car-final-640.avif 640w, /hero/responsive/car-final-710.avif 710w'
const heroCarMedia = '(max-width: 1050px) and (max-aspect-ratio: 1/1)'
const heroCarSizes = '(max-aspect-ratio: 1/1) min(88vw, 58svh), 42.464vw'
let introConsumedInDocument = false
const EditorialContent = lazy(() => import('./components/ze04/EditorialContent'))
const PremiumFooter = lazy(() => import('./components/ze04/EditorialContent').then(module => ({default:module.PremiumFooter})))

function hasSeenHeroIntro() {
  if (introConsumedInDocument) return true
  try { return window.sessionStorage.getItem(heroIntroKey) === 'complete' }
  catch { return false }
}

function rememberHeroIntro() {
  introConsumedInDocument = true
  try { window.sessionStorage.setItem(heroIntroKey, 'complete') }
  catch { /* In-memory fallback also prevents replay when storage is blocked. */ }
}

export function LandingPage() {
  useCommercialAnalytics()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const [onHero, setOnHero] = useState(true)
  const { reducedMotion } = useMotionSettings()
  const [clientReady, setClientReady] = useState(() => typeof document !== 'undefined' && !document.getElementById('root')?.hasAttribute('data-prerendered'))
  const [bodyReady, setBodyReady] = useState(false)
  const [bodyMounted, setBodyMounted] = useState(false)
  const markBodyMounted = useCallback(() => setBodyMounted(true), [])
  useEffect(() => { setClientReady(true); document.getElementById('root')?.removeAttribute('data-prerendered') }, [])
  useEffect(() => {
    if (!clientReady) return
    const requestBody = () => { if (window.scrollY > 8 || window.location.hash && window.location.hash !== '#hero' || (document.getElementById('hero')?.getBoundingClientRect().bottom ?? Infinity) < window.innerHeight) setBodyReady(true) }
    window.addEventListener('scroll', requestBody, { passive: true })
    window.addEventListener('hashchange', requestBody)
    requestBody()
    return () => { window.removeEventListener('scroll', requestBody); window.removeEventListener('hashchange', requestBody) }
  }, [clientReady])
  const heroReducedMotion = reducedMotion || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [heroIntro, setHeroIntro] = useState<'waiting' | 'playing' | 'settled'>(() =>
    typeof window !== 'undefined' && window.__ZELO_HERO_BOOTSTRAP__ ? window.__ZELO_HERO_BOOTSTRAP__.state : hasSeenHeroIntro() || heroReducedMotion ? 'settled' : 'waiting',
  )
  // Adopt any artwork recovery performed before React's event handlers existed.
  // The initial client tree must match the already-visible native fallback.
  const [heroArtwork] = useState(() => typeof window !== 'undefined' ? { ...window.__ZELO_HERO_BOOTSTRAP__?.artwork } : {})
  useEffect(() => { if (clientReady && heroIntro === 'settled') setBodyReady(true) }, [clientReady, heroIntro])
  useEffect(() => {
    if (!bodyMounted || !window.location.hash || window.location.hash === '#hero') return
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
  }, [bodyMounted])
  const backdropRef = useRef<HTMLImageElement>(null)
  const carRef = useRef<HTMLImageElement>(null)
  const headerLogoRef = useRef<HTMLImageElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [editorialFontReady, setEditorialFontReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const searchResults = [...searchLinks, ...services.map(({ title }) => ({ label: title, href: '#servicos' }))]
    .filter(({ label }) => label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .includes(searchQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()))

  useEffect(() => {
    if (!menuOpen) return
    const trigger = menuButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menuPanelRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); return }
      if (event.key !== 'Tab') return
      const controls = Array.from(menuPanelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [])
      const first = controls[0], last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', keydown)
      trigger?.focus()
    }
  }, [menuOpen])

  useEffect(() => {
    if (heroReducedMotion) {
      rememberHeroIntro()
      setHeroIntro('settled')
      return
    }
    if (!onHero) {
      if (heroIntro === 'playing') {
        rememberHeroIntro()
        setHeroIntro('settled')
      }
      return
    }
    if (heroIntro !== 'waiting') return
    if (window.__ZELO_HERO_BOOTSTRAP__) {
      const update = () => setHeroIntro(window.__ZELO_HERO_BOOTSTRAP__!.state)
      window.addEventListener('zelo:hero-bootstrap', update)
      update()
      return () => window.removeEventListener('zelo:hero-bootstrap', update)
    }
    let cancelled = false
    let firstFrame = 0
    let secondFrame = 0
    let startScheduled = false
    const startWhenVisible = () => {
      if (cancelled || startScheduled || document.visibilityState !== 'visible') return
      startScheduled = true
      // Commit a waiting frame after decoded images/fonts, then reveal together.
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (cancelled) return
          if (document.visibilityState !== 'visible') { startScheduled = false; return }
          if (hasSeenHeroIntro()) { setHeroIntro('settled'); return }
          introConsumedInDocument = true
          setHeroIntro('playing')
        })
      })
    }
    // A cold/slow load must never spend the intro before the artwork is visible.
    const assetTimeout = window.setTimeout(startWhenVisible, 1800)
    void Promise.allSettled([
      backdropRef.current?.decode(), carRef.current?.decode(),
      headerLogoRef.current?.decode(), document.fonts.ready,
    ]).then(() => {
      if (cancelled) return
      document.addEventListener('visibilitychange', startWhenVisible)
      startWhenVisible()
    })
    return () => {
      cancelled = true
      window.clearTimeout(assetTimeout)
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
      document.removeEventListener('visibilitychange', startWhenVisible)
    }
  }, [heroIntro, heroReducedMotion, onHero])

  useEffect(() => {
    if (heroIntro !== 'playing') return
    const elapsed = window.__ZELO_HERO_BOOTSTRAP__?.startedAt ? performance.now() - window.__ZELO_HERO_BOOTSTRAP__.startedAt : 0
    const timer = window.setTimeout(() => {
      rememberHeroIntro()
      setHeroIntro('settled')
    }, Math.max(0, 3300 - elapsed))
    return () => window.clearTimeout(timer)
  }, [heroIntro])

  useEffect(() => {
    // The approved hero keeps its own type and never waits for the editorial face.
    if (heroIntro !== 'settled' && onHero) return
    let active = true
    const loadDisplay = () => {
      void document.fonts.load('400 44px "Michroma Community"').then(() => {
        if (active) setEditorialFontReady(true)
      }).catch(() => { /* Project/system type remains readable if the font fails. */ })
    }
    const services = document.getElementById('servicos')
    if (!services) return
    if (!('IntersectionObserver' in window)) { loadDisplay(); return () => { active = false } }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); loadDisplay() }
    }, { rootMargin: '400px 0px' })
    observer.observe(services)
    return () => { active = false; observer.disconnect() }
  }, [heroIntro, onHero, bodyMounted])

  useEffect(() => {
    if (!searchOpen) return
    const closeOutside = (event: PointerEvent) => {
      if (!searchPanelRef.current?.contains(event.target as Node)
        && !searchButtonRef.current?.contains(event.target as Node)) setSearchOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        searchButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeWithEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [searchOpen])
  const activeSection = useActiveSection(observedSectionIds, bodyMounted)
  useEffect(() => {
    const hero = document.getElementById('hero')
    const header = document.querySelector('header')
    if (!hero || !header) return
    // Tall sections can never reach the shared navigation observer's threshold.
    // Header contrast depends only on whether the hero is behind the header.
    let frame = 0
    let headerHeight = 0
    const measureHeader = () => {
      const nextHeight = header.getBoundingClientRect().height
      if (nextHeight !== headerHeight) {
        headerHeight = nextHeight
        document.documentElement.style.setProperty('--zelo-nav-height', `${headerHeight}px`)
      }
    }
    const update = () => {
      frame = 0
      setOnHero(hero.getBoundingClientRect().bottom > headerHeight + 32)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const resize = new ResizeObserver(() => { measureHeader(); schedule() })
    resize.observe(header)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    measureHeader()
    update()
    return () => {
      resize.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div className="ze4-page min-h-screen" data-editorial-font={editorialFontReady ? 'ready' : 'deferred'}>
      <a className="zelo-skip-link" href="#main-content">Pular para o conteúdo</a>
      <header data-intro={onHero && !heroReducedMotion ? heroIntro : 'settled'} className={clsx('zelo-site-header fixed inset-x-0 top-0 z-50', onHero ? 'zelo-hero-header' : 'zelo-site-header-dark')}>
        <div className="zelo-header-inner">
          <a href="#hero" className="zelo-header-brand" aria-label={`${brandName} — início`}>
            <picture><source media="(max-width: 600px)" srcSet="/hero/responsive/zelo-logo-320.webp" /><img ref={headerLogoRef} src="/hero/responsive/zelo-logo-480.webp" alt={brandName} width={640} height={427} fetchPriority="high" /></picture>
          </a>
          <span className="zelo-header-divider" aria-hidden="true" />
          <nav className="zelo-header-nav" aria-label="Navegação principal">
            {headerLinks.map((link) => (
              <a key={link.href} href={link.href} aria-current={(link.href === '#hero' ? onHero : activeSection === link.href.slice(1)) ? 'location' : undefined}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="zelo-header-actions">
            <a href={siteConfig.whatsappLink} data-analytics-quote className="zelo-header-budget" aria-label={budgetLabel}>
              <CalendarDays aria-hidden="true" size={23} strokeWidth={1.5} />
              <span>ORÇAMENTO</span>
            </a>
            <button ref={searchButtonRef} type="button" className="zelo-header-search" aria-label="Buscar no site" aria-expanded={searchOpen} aria-controls="zelo-site-search" onClick={() => setSearchOpen((open) => !open)}>
              <Search aria-hidden="true" size={23} strokeWidth={1.6} />
            </button>
            <button ref={menuButtonRef} type="button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="zelo-mobile-menu" className="zelo-header-menu" onClick={() => { setMenuOpen(true); setSearchOpen(false) }}>
              <Menu aria-hidden="true" size={23} />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div ref={searchPanelRef} id="zelo-site-search" className="zelo-search-panel" role="region" aria-label="Busca no site">
            <label htmlFor="zelo-search-input">O que você procura?</label>
            <div className="zelo-search-field">
              <Search size={18} aria-hidden="true" />
              <input id="zelo-search-input" type="search" autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Serviços, localização, contato…" />
              <button type="button" aria-label="Fechar busca" onClick={() => { setSearchOpen(false); searchButtonRef.current?.focus() }}><X size={18} /></button>
            </div>
            <div className="zelo-search-results" aria-live="polite">
              {searchResults.length ? searchResults.map((link) => <a key={`${link.href}-${link.label}`} href={link.href} onClick={() => { if (searchQuery.trim()) track('internal_search', { result_count: searchResults.length, selected_section: link.href.slice(1) }); setSearchOpen(false) }}>{link.label}<ArrowUpRight size={15} aria-hidden="true" /></a>) : <p>Nenhum resultado. Tente serviços ou contato.</p>}
            </div>
          </div>
        )}
      </header>

        {menuOpen ? (
          <div
            id="zelo-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu de navegação" className="fixed inset-0 z-[60] bg-brand-navy/96 backdrop-blur-xl zelo-mobile-menu"
            ref={menuPanelRef}
            onClick={(event) => { if (event.target === event.currentTarget) setMenuOpen(false) }}
          >
            <div
              className="zelo-mobile-menu-panel ml-auto flex h-full w-[84%] max-w-sm flex-col border-l border-white/10 bg-brand-graphite px-6 pb-10 pt-6"
            >
              <div className="mb-12 flex items-center justify-between">
                <img src={siteConfig.iconLogo} alt="" className="h-11 w-11 object-contain" width={150} height={140} />
                <button
                  type="button"
                  aria-label="Fechar menu"
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-brand-gold"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-6">
                {headerLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-base uppercase tracking-[0.22em] text-brand-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <a
                href={siteConfig.whatsappLink}
                data-analytics-quote className="button-primary mt-10 justify-center text-center text-sm"
              >
                {budgetLabel}
              </a>
            </div>
          </div>
        ) : null}

      <main id="main-content" tabIndex={-1} className="relative z-10">
        <section id="hero" className="zelo-hero" data-intro={heroReducedMotion ? 'settled' : heroIntro} aria-labelledby="zelo-hero-title">
          <h1 id="zelo-hero-title" className="sr-only">Mais que estética. É valorização. Zelo Estética Automotiva em Catalão — GO.</h1>
          <div className="zelo-hero-stage" aria-hidden="true">
            <picture>{!heroArtwork.backdrop && <><source type="image/avif" media="(max-aspect-ratio: 1/1)" srcSet="/hero/showroom-portrait.avif" /><source media="(max-aspect-ratio: 1/1)" srcSet="/hero/showroom-portrait.webp" /></>}<img ref={backdropRef} className="zelo-hero-backdrop" onError={(event) => { const image = event.currentTarget; if (!image.src.endsWith('/hero/showroom-reference.webp')) { image.srcset = ''; image.closest('picture')?.querySelectorAll('source').forEach(source => source.remove()); image.src = '/hero/showroom-reference.webp' } }} src={heroArtwork.backdrop ? "/hero/showroom-reference.webp" : "/hero/showroom-final.webp"} srcSet={heroArtwork.backdrop ? undefined : "/hero/responsive/showroom-final-840.webp 840w, /hero/responsive/showroom-final-1280.webp 1280w, /hero/showroom-final.webp 1672w"} sizes="(max-aspect-ratio: 1/1) max(100vw, 177.87svh), 100vw" alt="" width={1672} height={940} fetchPriority="high" decoding="async" /></picture>
          </div>
          <svg className="zelo-hero-wordmark" viewBox="416 191 825 286" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="zelo-outline-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#efe9d9" stopOpacity=".92" />
                <stop offset=".48" stopColor="#c49b58" stopOpacity=".87" />
                <stop offset="1" stopColor="#d4b67a" stopOpacity=".48" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#zelo-outline-gold)" strokeWidth="1.15">
              <path d="M443 192H630V230L488 418H630L608 474H416V420L550 242H416Z" />
              <path d="M663 192H828L848 242H722V294H805L773 346H722V400H883V474H663Z" />
              <path d="M883 192H942V401H1039L1013 474H883Z" />
              <path fillRule="evenodd" d="M1149 191C1201 191 1241 231 1241 284V384C1241 436 1201 477 1149 477C1096 477 1057 437 1057 384V284C1057 231 1097 191 1149 191ZM1149 247C1129 247 1116 264 1116 286V383C1116 406 1129 421 1149 421C1169 421 1183 406 1183 383V286C1183 264 1169 247 1149 247Z" />
            </g>
          </svg>
          <div className="zelo-hero-car" aria-hidden="true" onAnimationEnd={(event) => {
            // Drop only the already-finished fill effect. The final frame is identical,
            // while the remaining intro, timings and session lifecycle continue normally.
            if (event.target === event.currentTarget && event.animationName === 'zelo-car-arrive') event.currentTarget.style.animation = 'none'
          }}>
            <div className="zelo-hero-reflection"><picture>{!heroArtwork.car && <source type="image/avif" media={heroCarMedia} srcSet={heroCarAvifSources} sizes={heroCarSizes} />}<img src={heroArtwork.car ? "/hero/car-reference.webp" : "/hero/car-final.webp"} srcSet={heroArtwork.car ? undefined : heroCarSources} sizes={heroCarSizes} alt="" width={710} height={360} /></picture></div>
            <div className="zelo-hero-ground-shadow" />
            <picture>{!heroArtwork.car && <source type="image/avif" media={heroCarMedia} srcSet={heroCarAvifSources} sizes={heroCarSizes} />}<img className="zelo-hero-car-body" onError={(event) => { const image = event.currentTarget; if (!image.src.endsWith('/hero/car-reference.webp')) { image.srcset = ''; image.closest('picture')?.querySelectorAll('source').forEach(source => source.remove()); image.src = '/hero/car-reference.webp' } }} ref={carRef} src={heroArtwork.car ? "/hero/car-reference.webp" : "/hero/car-final.webp"} srcSet={heroArtwork.car ? undefined : heroCarSources} sizes={heroCarSizes} alt="" width={710} height={360} decoding="async" fetchPriority="high" /></picture>
          </div>
          <div className="zelo-hero-edge-fade" aria-hidden="true" />
          <div className="zelo-hero-top-fade" aria-hidden="true" />
          <div className="zelo-hero-slogan" aria-hidden="true">
            <span className="zelo-hero-slogan-left">MAIS QUE ESTÉTICA.</span>
            <span className="zelo-hero-slogan-right">É VALORIZAÇÃO.</span>
          </div>
          <a className="zelo-hero-scroll-hint" href="#servicos" aria-label="Role para explorar nossos serviços">
            <span>ROLE PARA EXPLORAR</span>
            <ChevronDown className="zelo-hero-chevron" size={26} strokeWidth={1.3} aria-hidden="true" />
          </a>
        </section>

        {bodyReady ? <Suspense fallback={<div className="zelo-editorial-loading" role="status">Carregando nossos serviços…</div>}><EditorialContent onReady={markBodyMounted} /></Suspense> : <div className="zelo-editorial-loading" aria-hidden="true" />}
      </main>

      {bodyReady && <Suspense fallback={null}><PremiumFooter /></Suspense>}
      {clientReady && <ConsentControls />}
    </div>
  )
}
