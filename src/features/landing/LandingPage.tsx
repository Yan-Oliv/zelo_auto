import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import {
  contactCards,
  contactSectionCopy,
  footerLinks,
  heroCopy,
  instagramCopy,
  locationInfo,
  partnerLogos,
  productBrands,
  sectionLinks,
  services,
  siteConfig,
} from './data/site'
import { LogoCarousel } from './components/LogoCarousel'
import { ServiceCard } from './components/ServiceCard'
import { useInstagramFeed } from './hooks/useInstagramFeed'
import { Reveal } from '@shared/components/Reveal'
import { useActiveSection } from '@shared/hooks/useActiveSection'
import { useMotionSettings } from '@shared/motion/MotionSettings'

const brandName = 'Zelo Est\u00e9tica Automotiva'
const budgetLabel = 'Fa\u00e7a seu or\u00e7amento'
const servicesLabel = 'Nossos servi\u00e7os'
const serviceEyebrow = 'EXCEL\u00caNCIA EM CADA DETALHE'
const serviceDescription =
  'Utilizamos tecnologia de ponta e os melhores produtos do mercado, com o mesmo cuidado que voc\u00ea tem pelo seu ve\u00edculo.'
const instagramLoading = 'Carregando \u00faltimas postagens...'
const instagramError = 'N\u00e3o foi poss\u00edvel carregar o feed agora.'
const instagramEmpty = 'Nenhuma publica\u00e7\u00e3o encontrada ainda.'
const instagramPending =
  'Perfil conectado. As \u00faltimas postagens aparecem aqui assim que o feed oficial estiver configurado.'
const mapTitle = 'Mapa Zelo Est\u00e9tica Automotiva'
const verse =
  '"Ora, ao Rei dos s\u00e9culos, imortal, invis\u00edvel, ao Deus \u00fanico, s\u00e1bio, seja honra e gl\u00f3ria para todo o sempre. Am\u00e9m."'
const verseReference = '1 Tim\u00f3teo 1:17'
const copyrightNotice = 'Zelo Est\u00e9tica Automotiva. Todos os direitos reservados.'
const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAAAAACw='
const observedSectionIds = ['hero', ...sectionLinks.map(({ href }) => href.slice(1)), 'contato', 'parceiros']

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const instagramRef = useRef<HTMLElement | null>(null)
  const { reducedMotion } = useMotionSettings()
  const instagramFeed = useInstagramFeed()
  const instagramSectionNear = useNearViewport(instagramRef, '1100px')
  const activeSection = useActiveSection(observedSectionIds)
  const instagramImagesReady = instagramSectionNear || activeSection === 'instagram'

  // The contact transition now follows the visible section, not a 3D timeline.
  const contactActive = activeSection === 'contato'

  return (
    <div className="min-h-screen bg-brand-navy text-brand-white">
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 border-b transition-all duration-500',
          activeSection !== 'hero'
            ? 'border-white/10 bg-brand-navy/86 backdrop-blur-xl'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-8">
          <a href="#hero" className="flex items-center gap-4">
            <img
              src={siteConfig.mainLogo}
              alt={brandName}
              className="brand-mark brand-mark-header"
              width={888}
              height={334}
              fetchPriority="high"
            />
          </a>

          <nav className="hidden items-center gap-8 font-['Eurostile_Extended','Montserrat',sans-serif] md:flex">
            {sectionLinks.map((link) => {
              const sectionId = link.href.replace('#', '')
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'text-[11px] uppercase tracking-[0.28em] transition-colors duration-300',
                    activeSection === sectionId
                      ? 'text-brand-gold'
                      : 'text-brand-silver hover:text-brand-white',
                  )}
                >
                  {link.label}
                </a>
              )
            })}
            <a href={siteConfig.whatsappLink} className="button-primary text-[11px]">
              {budgetLabel}
            </a>
          </nav>

          <button
            type="button"
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-brand-graphite/75 text-brand-gold md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>
        </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-brand-navy/96 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="ml-auto flex h-full w-[84%] max-w-sm flex-col border-l border-white/10 bg-brand-graphite px-6 pb-10 pt-6"
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
                {sectionLinks.map((link) => (
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
                className="button-primary mt-10 justify-center text-center text-sm"
              >
                {budgetLabel}
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="relative z-10">
        <section id="hero" className="scene-shell hero-shell">
          {/* Temporary 2D fallback. The Audi/Zelo cinematic carousel arrives in ZE-03. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <img src="/hero-static-fallback.webp" alt="" decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-left opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/30 via-brand-navy/70 to-brand-navy/95" />
          </div>
          <div className="hero-layout">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="hero-copy"
            >
              <div className="eyebrow">SHOWROOM DE CUIDADO AUTOMOTIVO</div>
              <h1 className="hero-title mt-5">
                {heroCopy.titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="hero-description mt-5">
                {heroCopy.description}
              </p>

              <div className="hero-actions mt-8 flex flex-col gap-4 sm:flex-row">
                <a href={siteConfig.whatsappLink} className="button-primary">
                  {budgetLabel}
                </a>
                <a href="#servicos" className="button-secondary">
                  {servicesLabel}
                </a>
              </div>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <motion.a
              href="#servicos"
              animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.36em] text-brand-silver"
            >
              {'role a tela'}
              <span className="inline-flex h-9 w-9 items-center justify-center border border-brand-gold/35 text-brand-gold">
                <ArrowDown size={14} />
              </span>
            </motion.a>
          </div>
        </section>

        <section id="servicos" className="scene-shell scene-panel">
          <Reveal className="section-intro section-intro-wide">
            <div className="eyebrow">{serviceEyebrow}</div>
            <p className="section-description mt-6">{serviceDescription}</p>
          </Reveal>

          <div className="services-spotlight-grid mt-16">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index}
                focus={1}
                focused={false}
              />
            ))}
          </div>
        </section>

        <section id="marcas" className="brand-scene-shell">
          <div className="brand-scene-content">
            <Reveal className="section-intro">
              <div className="eyebrow">PRODUTOS QUE UTILIZAMOS</div>
            </Reveal>
            <LogoCarousel items={productBrands} variant="products" className="mt-7" />
          </div>
        </section>

        <section id="instagram" ref={instagramRef} className="scene-shell scene-panel">
          <div className="grid gap-14 xl:grid-cols-[0.34fr_0.66fr] xl:items-start">
            <Reveal className="section-intro">
              <div className="eyebrow">ACOMPANHE NOSSO TRABALHO</div>
              <p className="section-description mt-6">{instagramCopy.description}</p>
              <a
                href={siteConfig.instagramLink}
                className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-brand-gold"
              >
                {siteConfig.instagramHandle}
                <ArrowUpRight size={15} />
              </a>
            </Reveal>

            <Reveal delay={0.1}>
              {instagramFeed.posts.length > 0 ? (
                <div className="instagram-grid">
                  {instagramFeed.posts.map((post) => (
                    <a
                      key={post.id}
                      href={post.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="instagram-tile"
                    >
                      <img
                        key={`${post.id}-${instagramImagesReady ? 'image' : 'placeholder'}`}
                        src={instagramImagesReady ? post.image : transparentPixel}
                        data-src={post.image}
                        alt={post.alt}
                        className={clsx('h-full w-full object-cover', post.className)}
                        width={800}
                        height={800}
                        loading={instagramImagesReady ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <span className="instagram-overlay">
                        <Camera size={16} />
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="instagram-empty">
                  <Camera size={26} />
                  <p>
                    {instagramFeed.loading
                      ? instagramLoading
                      : instagramFeed.error
                        ? instagramError
                        : instagramFeed.configured
                          ? instagramEmpty
                          : instagramPending}
                  </p>
                  <a href={siteConfig.instagramLink} target="_blank" rel="noreferrer" className="button-secondary">
                    {'Abrir Instagram'}
                  </a>
                </div>
              )}
            </Reveal>
          </div>
        </section>

        <section id="caminho" className="scene-shell scene-panel">
          <div className="grid gap-14">
            <div id="localizacao" className="grid gap-10 xl:grid-cols-[0.38fr_0.62fr] xl:items-start">
              <Reveal className="section-intro">
                <div className="eyebrow">ONDE ESTAMOS</div>
                <div className="mt-8 space-y-6 border-l border-brand-gold/25 pl-5">
                  <InfoLine icon={<MapPin size={16} />} value={locationInfo.address} />
                  <InfoLine icon={<Phone size={16} />} value={locationInfo.phoneLabel} />
                  <InfoLine icon={<Camera size={16} />} value={siteConfig.instagramHandle} />
                </div>
                <a href={locationInfo.mapsLink} className="button-secondary mt-8">
                  {'Como chegar'}
                </a>
              </Reveal>

              <Reveal className="map-frame">
                <iframe
                  title={mapTitle}
                  src={locationInfo.embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[420px] w-full"
                />
              </Reveal>
            </div>
          </div>
        </section>

        <section id="contato" className="scene-shell scene-panel">
          <Reveal className="section-intro">
            <div className="eyebrow">ENTRE EM CONTATO</div>
            <h2 className="mt-5 font-['Eurostile_Extended','Montserrat',sans-serif] text-[2rem] uppercase leading-[0.98] tracking-[0.08em] text-brand-white md:text-[2.65rem]">
              {contactSectionCopy.headline}
            </h2>
            <p className="section-description mt-6">{contactSectionCopy.description}</p>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {contactCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={contactActive ? { opacity: 1, y: 0 } : { opacity: 0.86, y: 10 }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={clsx('contact-card', contactActive && 'contact-card-live')}
              >
                <div className="contact-icon">
                  {card.type === 'whatsapp' ? <MessageCircle size={24} /> : <Camera size={24} />}
                </div>
                <h3 className="mt-7 text-[1.4rem] uppercase tracking-[0.14em] text-brand-white">
                  {card.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-brand-silver">{card.description}</p>
                <a href={card.href} className="button-secondary mt-8">
                  {card.buttonLabel}
                </a>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="parceiros">
          <div className="section-shell partners-shell">
            <Reveal className="section-intro">
              <div className="eyebrow">PARCEIROS DA EMPRESA</div>
            </Reveal>
            <LogoCarousel items={partnerLogos} variant="partners" className="mt-10" />
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-brand-navy/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1400px] gap-4 px-5 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <div>
            <img
              src={siteConfig.horizontalLogo}
              alt={brandName}
              className="brand-mark brand-mark-footer"
              width={573}
              height={127}
              loading="lazy"
              decoding="async"
            />
            <p className="mt-2 max-w-md text-sm leading-6 text-brand-silver">{'Mais que limpeza. Cuidado.'}</p>
          </div>

          <div className="grid gap-2 md:justify-self-end md:text-right">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-brand-silver transition-colors duration-300 hover:text-brand-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4 text-center lg:px-8">
          <p className="mx-auto max-w-4xl text-sm leading-6 text-brand-silver md:text-[15px]">{verse}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-brand-gold">{verseReference}</p>
        </div>

        <div className="border-t border-white/10 bg-brand-navy/52 px-5 py-2.5 text-center text-[11px] uppercase tracking-[0.22em] text-brand-silver lg:px-8">
          {String.fromCharCode(169)} {new Date().getFullYear()} {copyrightNotice}
        </div>
      </footer>
    </div>
  )
}

function InfoLine({
  icon,
  value,
}: {
  icon: ReactNode
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 inline-flex h-8 w-8 items-center justify-center border border-brand-gold/20 text-brand-gold">
        {icon}
      </div>
      <div className="text-sm leading-7 text-brand-white">{value}</div>
    </div>
  )
}

function useNearViewport<T extends Element>(ref: RefObject<T | null>, rootMargin: string) {
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (isNear) {
      return
    }

    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsNear(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isNear, ref, rootMargin])

  return isNear
}
