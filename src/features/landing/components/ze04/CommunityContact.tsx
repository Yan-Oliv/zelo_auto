import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, CalendarDays, Camera, Check, Clock3, Film, Images, MapPin, MessageCircle, Navigation, Star, Users } from 'lucide-react'
import { locationInfo, partnerLogos, scheduleRows, siteConfig } from '../../data/site'
import { googleReviewLinks } from '../../data/googleReviewLinks'
import { useInstagramFeed, type InstagramFeedPost } from '../../hooks/useInstagramFeed'
import { useGoogleReviews, type VerifiedGoogleReviews } from '../../hooks/useGoogleReviews'
export type { VerifiedGoogleReview, VerifiedGoogleReviews } from '../../hooks/useGoogleReviews'
import { NearImage } from './NearImage'
import './CommunityContact.css'

function CommunityReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion()
  return <m.div className={className} initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}>{children}</m.div>
}

function CommunityEyebrow({ children }: { children: ReactNode }) {
  return <p className="ze4-community-eyebrow">{children}<span aria-hidden="true" /></p>
}

function InstagramTile({ post, official, index }: { post: InstagramFeedPost; official: boolean; index: number }) {
  const [imageFailed, setImageFailed] = useState(false)
  const reducedMotion = useReducedMotion()
  const MediaIcon = post.mediaType === 'VIDEO' ? Film : post.mediaType === 'CAROUSEL_ALBUM' ? Images : Camera
  return <m.a href={official && !imageFailed ? post.postUrl : siteConfig.instagramLink} target="_blank" rel="noopener noreferrer" className={`ze4-instagram-tile${imageFailed ? ' is-image-failed' : ''}`} aria-label={official && !imageFailed ? `Abrir publicação no Instagram: ${post.alt}` : 'Abrir perfil oficial da Zelo no Instagram'} initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.22 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}>
    {!imageFailed ? <NearImage src={post.image} alt={official ? post.alt : `Imagem ilustrativa: ${post.alt}`} width={520} height={520} loading="lazy" decoding="async" className={post.className} onError={() => setImageFailed(true)} /> : <span className="ze4-instagram-image-fallback"><Camera size={30} aria-hidden="true" /><span>Imagem indisponível</span><small>Abrir perfil oficial</small></span>}
    {official && !imageFailed && <MediaIcon className="ze4-instagram-media-icon" size={21} aria-label={post.mediaType === 'VIDEO' ? 'Vídeo' : post.mediaType === 'CAROUSEL_ALBUM' ? 'Carrossel' : 'Foto'} />}
    <span className="ze4-instagram-hover" aria-hidden="true"><Camera size={27} /><span>{official ? 'Abrir publicação' : 'Abrir perfil oficial'}</span></span>
  </m.a>
}

function InstagramSection() {
  const { posts, status, error, source } = useInstagramFeed()
  const officialPosts = status === 'official' ? posts.slice(0, 6) : []
  const statusMessage = status === 'loading'
    ? 'Carregando publicações do perfil oficial…'
    : status === 'official'
      ? 'Publicações atuais do perfil oficial.'
      : status === 'empty'
        ? 'O perfil não tem publicações disponíveis para exibir agora.'
        : error ?? 'Publicações indisponíveis no momento.'

  return <section id="instagram" className="ze4-instagram" aria-labelledby="ze4-instagram-title">
    <header className="ze4-community-heading">
      <CommunityReveal><CommunityEyebrow>NOSSO DIA A DIA</CommunityEyebrow></CommunityReveal>
      <CommunityReveal delay={0.08}><h2 id="ze4-instagram-title" className="ze4-community-title">ACOMPANHE A<br /><span>ZELO NO INSTAGRAM</span></h2></CommunityReveal>
      <CommunityReveal delay={0.16}><p className="ze4-community-description">Bastidores, transformações reais, detalhes que fazem a diferença e um pouco da nossa rotina com os carros que passam por aqui.</p></CommunityReveal>
    </header>
    <div className="ze4-instagram-gallery">
      <div className="ze4-instagram-grid" aria-busy={status === 'loading'} aria-describedby="ze4-instagram-status" data-feed-source={status === 'official' ? source : status}>
        {status === 'loading'
          ? Array.from({ length: 6 }, (_, index) => <div key={index} className="ze4-instagram-skeleton" aria-hidden="true" />)
          : officialPosts.map((post, index) => <InstagramTile key={post.id} post={post} official index={index} />)}
      </div>
    </div>
    <CommunityReveal className="ze4-instagram-actions" delay={0.24}>
      <a className="ze4-button" href={siteConfig.instagramLink} target="_blank" rel="noopener noreferrer"><Camera size={22} aria-hidden="true" /><span>VER NOSSO INSTAGRAM</span><ArrowRight size={21} aria-hidden="true" /></a>
      <div className="ze4-instagram-metadata"><span>CONTEÚDO<small>OFICIAL</small></span><span>CUIDADO<small>EM CADA DETALHE</small></span><span>BASTIDORES<small>REAIS</small></span></div>
    </CommunityReveal>
    <CommunityReveal delay={0.3}><p id="ze4-instagram-status" className="ze4-feed-caption" aria-live="polite">{statusMessage} <a href={siteConfig.instagramLink} target="_blank" rel="noopener noreferrer">{siteConfig.instagramHandle}</a></p></CommunityReveal>
  </section>
}
function CommunityStars({ rating }: { rating: number }) {
  const reducedMotion = useReducedMotion()
  return <span className="ze4-review-stars" role="img" aria-label={`${rating.toLocaleString('pt-BR')} de 5 estrelas`}>{Array.from({ length: 5 }, (_, i) => <m.span className="ze4-review-star" key={i} aria-hidden="true" initial={reducedMotion ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : i * 0.06 }}><Star size={16} /><span style={{ width: `${Math.max(0, Math.min(1, rating - i)) * 100}%` }}><Star size={16} fill="currentColor" /></span></m.span>)}</span>
}

export function GoogleReviewsSection({ data: suppliedData }: { data?: VerifiedGoogleReviews }) {
  const feed = useGoogleReviews(!suppliedData)
  const [hasRetried, setHasRetried] = useState(false)
  const data = suppliedData ?? feed.data
  const status = suppliedData ? (suppliedData.total === 0 ? 'empty' : 'verified') : feed.status
  const reviewActionUrl = data?.reviewActionUrl || googleReviewLinks.reviewActionUrl
  const sourceUrl = data?.sourceUrl || googleReviewLinks.sourceUrl
  const loading = status === 'loading'
  const unavailableCards = [
    { icon: <Camera size={23} />, title: 'Acompanhe o nosso dia a dia', description: 'Bastidores e cuidados no perfil oficial.', action: 'Abrir Instagram', href: siteConfig.instagramLink },
    { icon: <MessageCircle size={23} />, title: 'Converse com a nossa equipe', description: 'Tire dúvidas e encontre o cuidado para seu carro.', action: 'Falar no WhatsApp', href: siteConfig.whatsappLink },
    { icon: <MapPin size={23} />, title: 'Conheça a Zelo de perto', description: 'Estamos esperando você em Catalão – GO.', action: 'Como chegar', href: locationInfo.mapsLink },
  ]
  return <section ref={feed.ref} id="avaliacoes" className="ze4-google-reviews" aria-labelledby="ze4-reviews-title" data-reviews-state={status}>
    <header className="ze4-community-heading">
      <CommunityReveal><CommunityEyebrow>CONFIANÇA QUE GERA HISTÓRIAS</CommunityEyebrow></CommunityReveal>
      <CommunityReveal delay={0.08}><h2 id="ze4-reviews-title" className="ze4-community-title">AVALIAÇÕES<br /><span>GOOGLE</span></h2></CommunityReveal>
      <CommunityReveal delay={0.16}><p className="ze4-community-description">A satisfação dos nossos clientes é o que nos move. Confira o que eles dizem sobre a experiência na Zelo Auto Estética.</p></CommunityReveal>
    </header>
    <div className="ze4-review-content" aria-busy={loading}>
    <CommunityReveal className="ze4-review-summary" delay={0.05}>
      {loading ? <div className="ze4-review-skeleton ze4-review-skeleton-summary" aria-hidden="true" /> : data && data.average !== null ? <CommunityReveal className="ze4-review-summary-data"><div className="ze4-review-score"><strong>{data.average.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong><CommunityStars rating={data.average} /></div><div className="ze4-review-total"><strong>{data.total.toLocaleString('pt-BR')}</strong><span>AVALIAÇÕES NO GOOGLE</span><p>Experiências compartilhadas por nossos clientes.</p></div></CommunityReveal> : <><span className="ze4-google-letter" aria-hidden="true">G</span><div><strong>CONFIANÇA EM CADA DETALHE</strong><p>{status === 'empty' ? 'Ainda não há avaliações disponíveis no Google.' : 'As avaliações estão indisponíveis aqui no momento.'}</p><span className="ze4-review-availability">Consulte as opiniões na fonte oficial.</span></div></>}
    </CommunityReveal>
    <div className="ze4-review-list">
      {data && data.total > 0 && data.reviews.length === 0 && <p className="ze4-review-no-snippets">A nota e o total estão disponíveis. Consulte os comentários diretamente no Google.</p>}
      {loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="ze4-review-card ze4-review-skeleton" aria-hidden="true" />) : data && data.total > 0 ? data.reviews.slice(0, 3).map((review, index) => <CommunityReveal key={review.id} delay={0.1 + index * 0.1} className="ze4-review-card"><span className="ze4-review-avatar" aria-hidden="true">{review.author.slice(0, 1)}</span><div><h3>{review.authorUrl ? <a href={review.authorUrl} target="_blank" rel="noopener noreferrer">{review.author}</a> : review.author}</h3><div className="ze4-review-meta"><CommunityStars rating={review.rating} /><span>{review.dateLabel}</span></div>{review.comment && <p className="ze4-review-comment">{review.comment}</p>}<a data-analytics-review="view" href={review.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ler avaliação completa de ${review.author} no Google`}>Ler no Google <ArrowUpRight size={13} aria-hidden="true" /></a></div></CommunityReveal>) : unavailableCards.map((card, index) => <CommunityReveal key={card.title} delay={0.1 + index * 0.1} className="ze4-review-card ze4-review-unavailable"><span className="ze4-review-info-icon" aria-hidden="true">{card.icon}</span><div><span className="ze4-review-editorial-label">CANAL INSTITUCIONAL DA ZELO</span><h3>{card.title}</h3><p>{card.description}</p><a href={card.href} target="_blank" rel="noopener noreferrer">{card.action}<ArrowUpRight size={13} aria-hidden="true" /></a></div></CommunityReveal>)}
    </div>
    </div>
    <CommunityReveal className="ze4-reviews-actions" delay={0.2}>
      <a data-analytics-review="view" href={sourceUrl} aria-label="Ver todas as avaliações no Google (abre em nova aba)" className="ze4-button-outline" target="_blank" rel="noopener noreferrer">VER TODAS AS AVALIAÇÕES<ArrowRight size={20} aria-hidden="true" /></a>
      {reviewActionUrl && <a data-analytics-review="write" href={reviewActionUrl} aria-label="Avaliar no Google (abre em nova aba)" className="ze4-review-write" target="_blank" rel="noopener noreferrer">AVALIAR NO GOOGLE<ArrowUpRight size={16} aria-hidden="true" /></a>}
    </CommunityReveal>
    <CommunityReveal className="ze4-reviews-attribution" delay={0.26}><span className="ze4-reviews-source"><Check size={22} aria-hidden="true" />AVALIAÇÕES<br />DO GOOGLE</span><span><Users size={23} aria-hidden="true" />EXPERIÊNCIAS<br />COMPARTILHADAS</span><a data-analytics-review="view" href={sourceUrl} target="_blank" rel="noopener noreferrer">Fonte: Google<ArrowUpRight size={14} aria-hidden="true" /></a></CommunityReveal>
    <div className="ze4-reviews-feedback">
      <p className="ze4-reviews-status" role="status">{feed.refreshing ? 'Atualizando avaliações…' : feed.refreshError ? 'Não foi possível atualizar agora. As últimas avaliações carregadas continuam visíveis.' : loading ? 'Carregando avaliações do Google…' : data ? data.total === 0 ? 'Nenhuma avaliação disponível no Google no momento.' : 'Avaliações de clientes. Fonte: Google.' : 'As avaliações do Google estão indisponíveis no momento.'}</p>
      {!suppliedData && !loading && <button type="button" className="ze4-review-retry" aria-disabled={feed.refreshing || feed.retrySeconds > 0} onClick={() => { setHasRetried(true); feed.refresh() }}>{feed.refreshing ? 'ATUALIZANDO…' : status === 'unavailable' ? feed.retrySeconds > 0 ? `TENTAR NOVAMENTE EM ${feed.retrySeconds}s` : 'TENTAR NOVAMENTE' : hasRetried ? 'ATUALIZAR NOVAMENTE' : 'ATUALIZAR AVALIAÇÕES'}</button>}
    </div>
  </section>
}

export function CommunitySection({ googleReviews }: { googleReviews?: VerifiedGoogleReviews }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [displayReady, setDisplayReady] = useState(false)
  useEffect(() => {
    let active = true
    const prepareDisplay = () => {
      // The self-hosted display face is needed only when this section is near.
      // Wait for it before switching families; the critical hero never waits.
      void document.fonts?.load('400 44px "Michroma Community"').then(() => {
        if (active) setDisplayReady(true)
      }).catch(() => { /* Readable system/project fallback remains visible. */ })
    }
    if (!('IntersectionObserver' in window)) { prepareDisplay(); return () => { active = false } }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); prepareDisplay() }
    }, { rootMargin: '700px 0px' })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => { active = false; observer.disconnect() }
  }, [])
  return <div ref={sectionRef} className="ze4-community" data-display-font={displayReady ? 'ready' : 'deferred'}><NearImage original className="ze4-community-scene" src="/editorial/responsive/location-scene-1280.webp" alt="" width={1280} height={720} loading="lazy" decoding="async" /><div className="ze4-container ze4-community-columns"><InstagramSection /><GoogleReviewsSection data={googleReviews} /></div></div>
}

export function LocationSection() {
  const reducedMotion = useReducedMotion()
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)
  useEffect(() => {
    if (!mapRef.current) return
    if (!('IntersectionObserver' in window)) { setMapReady(true); return }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setMapReady(true); observer.disconnect() }
    }, { rootMargin: '700px 0px' })
    observer.observe(mapRef.current)
    return () => observer.disconnect()
  }, [])
  return <section id="localizacao" className="ze4-location" aria-labelledby="ze4-location-title">
    <NearImage original className="ze4-location-scene" src="/editorial/location-scene.webp" alt="" width={1672} height={940} loading="lazy" decoding="async" />
    <span className="ze4-location-wordmark" aria-hidden="true">ZELO</span>
    <div className="ze4-container ze4-location-layout">
      <div className="ze4-location-copy">
        <CommunityReveal><CommunityEyebrow>NOSSA <span className="ze4-location-eyebrow-gold">LOCALIZAÇÃO</span></CommunityEyebrow><h2 id="ze4-location-title">VENHA VIVER<br />A EXPERIÊNCIA<br /><span>ZELO EM<br />CATALÃO – GO</span></h2><p className="ze4-location-description">Em Catalão–GO, cuidamos do seu veículo com lavagem completa, limpeza interna e higienização de bancos e carpetes.</p></CommunityReveal>
        <div id="contato" className="ze4-location-info">
          <CommunityReveal className="ze4-location-info-row" delay={0.08}><span className="ze4-location-icon"><MapPin size={28} aria-hidden="true" /></span><div><h3>ENDEREÇO</h3><address>{locationInfo.address}</address></div></CommunityReveal>
          <CommunityReveal className="ze4-location-info-row" delay={0.16}><span className="ze4-location-icon"><MessageCircle size={28} aria-hidden="true" /></span><div><h3>ATENDIMENTO VIA WHATSAPP</h3><a href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer">{locationInfo.phoneLabel.replace('WhatsApp: ', '')}</a><p>Fale com nossa equipe</p></div></CommunityReveal>
          <CommunityReveal className="ze4-location-info-row" delay={0.24}><span className="ze4-location-icon"><Clock3 size={28} aria-hidden="true" /></span><div><h3>HORÁRIO DE FUNCIONAMENTO</h3><dl className="ze4-location-schedule">{scheduleRows.map((row) => <div key={row.key}><dt>{row.label}</dt><dd>{row.hours}</dd></div>)}</dl></div></CommunityReveal>
        </div>
      </div>
      <div className="ze4-location-map-column">
        <m.div ref={mapRef} className="ze4-location-map" initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}>
          {mapReady ? <iframe title="Mapa e endereço da Zelo Estética Automotiva em Catalão" src={locationInfo.embedUrl} loading="eager" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <div className="ze4-location-map-placeholder"><span>O mapa carrega automaticamente ao se aproximar. <a href={locationInfo.mapsLink} target="_blank" rel="noopener noreferrer">Abrir localização no Google Maps</a></span></div>}
        </m.div>
        <CommunityReveal className="ze4-location-actions" delay={0.16}><a data-analytics-quote href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer" className="ze4-button"><CalendarDays size={21} aria-hidden="true" />SOLICITAR ORÇAMENTO<ArrowRight size={21} aria-hidden="true" /></a><a href={locationInfo.mapsLink} target="_blank" rel="noopener noreferrer" className="ze4-button-outline"><Navigation size={21} aria-hidden="true" />VER ROTA NO MAPS<ArrowRight size={21} aria-hidden="true" /></a></CommunityReveal>
      </div>
      <div className="ze4-location-side-note" aria-hidden="true">CUIDADO<br />QUE<br />TE LEVA<br />MAIS LONGE.</div>
    </div>
  </section>
}

const footerNavigation = [
  { label: 'Início', href: '#hero' }, { label: 'Resultados', href: '#resultados' },
  { label: 'Serviços', href: '#servicos' }, { label: 'Avaliações', href: '#avaliacoes' },
  { label: 'Processo Zelo', href: '#processo' }, { label: 'Contato', href: '#contato' },
]

export function PremiumFooter() {
  return <footer className="ze4-footer">
    <div className="ze4-container">
      <div className="ze4-footer-main">
        <div className="ze4-footer-brand"><a href="#hero" aria-label="Zelo Estética Automotiva — início"><NearImage src={siteConfig.horizontalLogo} alt="Zelo Estética Automotiva" width={640} height={427} loading="lazy" decoding="async" /></a><div><p className="ze4-footer-statement">MAIS QUE ESTÉTICA.<br /><span>É VALORIZAÇÃO.</span></p><p>Mais que limpeza. Cuidado.<br />Estética automotiva em Catalão – GO.<br />Seu veículo no seu melhor brilho.</p></div></div>
        <nav className="ze4-footer-nav" aria-label="Navegação do rodapé"><h2>NAVEGAÇÃO</h2><div>{footerNavigation.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div></nav>
        <div className="ze4-footer-social"><h2>NOSSAS REDES</h2><a href={siteConfig.instagramLink} target="_blank" rel="noopener noreferrer"><Camera size={19} aria-hidden="true" />Instagram</a><a href={locationInfo.mapsLink} target="_blank" rel="noopener noreferrer"><MapPin size={19} aria-hidden="true" />Google Maps</a></div>
        <div className="ze4-footer-contact"><h2>CONTATO RÁPIDO</h2><a href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={23} aria-hidden="true" />{locationInfo.phoneLabel.replace('WhatsApp: ', '')}</a><a href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer"><Navigation size={23} aria-hidden="true" />Falar no WhatsApp</a></div>
      </div>
      <div className="ze4-footer-institutional">
        <div className="ze4-footer-verse"><p>“Ora, ao Rei dos séculos, imortal, invisível, ao Deus único, sábio, seja honra e glória para todo o sempre. Amém.”</p><span>1 TIMÓTEO 1:17</span></div>
        <div id="parceiros" className="ze4-footer-partners"><h2>PARCEIROS DA EMPRESA</h2><div>{partnerLogos.map((partner) => <span key={partner.name}>{partner.href ? <a href={partner.href} target="_blank" rel="noopener noreferrer" aria-label={`Visitar ${partner.name} no Instagram (abre em nova aba)`}><NearImage src={partner.logo} alt={partner.name} width={140} height={56} loading="lazy" decoding="async" /></a> : <NearImage src={partner.logo} alt={partner.name} width={140} height={56} loading="lazy" decoding="async" />}</span>)}</div></div>
      </div>
      <div className="ze4-footer-bottom"><p>© 2026 Zelo Estética Automotiva. Todos os direitos reservados.</p><span>Catalão – GO</span><p>Estética automotiva <span aria-hidden="true">|</span> Cuidado em cada detalhe.</p></div>
    </div>
  </footer>
}
