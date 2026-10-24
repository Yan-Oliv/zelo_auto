import { useId, useState, type CSSProperties, type ReactNode, type SVGProps } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Armchair, ArrowRight, ChartNoAxesColumnIncreasing, Check, ChevronLeft, ChevronRight, Diamond, Droplets, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { productBrands, services, serviceWhatsappLink, siteConfig, type ServiceItem } from '../../data/site'
import { NearImage } from './NearImage'
import './CommercialSections.css'

const ease = [0.16, 1, 0.3, 1] as const
function SteeringWheelIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M3.2 10.5h6.9m3.8 0h6.9M10.7 13.5 8.4 20m4.9-6.5 2.3 6.5" /></svg>
}
function CarpetIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path d="M7 4h10l3 16H4L7 4Z" strokeLinejoin="round" /><path d="M7.5 8h9m-9.7 4h10.4M6.4 16h11.2M9 20l1-16m5 16L14 4" /></svg>
}
const serviceIcons = { wash: Droplets, interior: SteeringWheelIcon, seats: Armchair, carpet: CarpetIcon }
const editorial = (name: string) => `/editorial/${name}.webp`

function CommercialReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return <m.div className={className} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.72, delay: reduced ? 0 : delay, ease }}>{children}</m.div>
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ze4-commercial-eyebrow">{children}<span aria-hidden="true" /></p>
}

function OutlineWord({ className = '' }: { className?: string }) {
  return <span className={`ze4-commercial-outline ${className}`} aria-hidden="true">ZELO</span>
}

function PremiumServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const Icon = serviceIcons[service.icon]
  const reduced = useReducedMotion()
  return (
    <m.article className="ze4-service-card" initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.72, delay: reduced ? 0 : index * 0.1, ease }}>
      <div className="ze4-service-photo"><NearImage src={editorial(`service-${service.icon}`)} width="680" height="520" loading="lazy" decoding="async" alt="" /></div>
      <div className="ze4-service-copy">
        <Icon className="ze4-service-icon" size={29} strokeWidth={1.25} aria-hidden="true" />
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <span className="ze4-service-rule" aria-hidden="true" />
      </div>
      <a data-analytics-quote data-analytics-service={({ wash: 'lavagem_completa', interior: 'limpeza_interna', seats: 'higienizacao_bancos', carpet: 'higienizacao_carpete' } as const)[service.icon]} className="ze4-service-action" href={serviceWhatsappLink(service)} target="_blank" rel="noopener noreferrer" aria-label={`Solicitar orçamento: ${service.title}`}><ArrowRight size={19} strokeWidth={1.4} /></a>
    </m.article>
  )
}

export function ServicesSection() {
  return (
    <section id="servicos" className="ze4-services" aria-labelledby="ze4-services-title">
      <div className="ze4-services-scene" aria-hidden="true">
        <NearImage original className="ze4-services-showroom" src="/hero/showroom-reference.webp" width="4096" height="2304" alt="" loading="lazy" decoding="async" />
        <OutlineWord />
        <NearImage className="ze4-services-car" src="/hero/car-4k.webp" width="4096" height="2304" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="ze4-container">
        <div className="ze4-services-intro">
          <CommercialReveal className="ze4-services-heading">
            <Eyebrow>Nossos serviços</Eyebrow>
            <h2 id="ze4-services-title" className="ze4-commercial-title">Cuidado em<br /><span>cada detalhe</span></h2>
            <p className="ze4-commercial-description">Serviços especializados para cuidar da estética<br className="ze4-desktop-break" /> e do valor do seu veículo, em cada detalhe.</p>
          </CommercialReveal>
          <div className="ze4-service-benefits" role="group" aria-label="Cuidado Zelo">
            <span><Diamond aria-hidden="true" /><span>Resultados<br />premium</span></span>
            <span><ShieldCheck aria-hidden="true" /><span>Produtos de<br />alta qualidade</span></span>
            <span><ChartNoAxesColumnIncreasing aria-hidden="true" /><span>Atendimento<br />especializado</span></span>
          </div>
        </div>
        <div className="ze4-services-grid">{services.map((service, index) => <PremiumServiceCard key={service.icon} service={service} index={index} />)}</div>
      </div>
    </section>
  )
}

export type ComparisonPair = { before: string; after: string; beforeAlt: string; afterAlt: string; source?: 'real' | 'illustrative'; note?: string }

export function BeforeAfterComparison({ title, preview, pair, analyticsId }: { title: string; analyticsId?: string; preview: string; pair?: ComparisonPair }) {
  const [position, setPosition] = useState(50)
  const [loaded, setLoaded] = useState({ before: false, after: false })
  const [imageFailed, setImageFailed] = useState(false)
  const labelId = useId()
  return (
    <figure data-comparison-source={pair?.source ?? 'illustrative'} className={`ze4-comparison${pair ? ' ze4-comparison-ready' : ''}`} style={{ '--ze4-comparison-position': `${position}%` } as CSSProperties}>
      <figcaption id={labelId} className="ze4-comparison-title">{title}</figcaption>
      <div className="ze4-comparison-stage">
      {pair ? <>
        <NearImage src={pair.after} alt={pair.afterAlt} width="680" height="360" loading="lazy" decoding="async" onError={() => setImageFailed(true)} onLoad={event => { if (!event.currentTarget.currentSrc.startsWith('data:')) setLoaded(value => ({ ...value, after: true })) }} />
        <div className="ze4-comparison-before"><NearImage src={pair.before} alt={pair.beforeAlt} width="680" height="360" loading="lazy" decoding="async" onError={() => setImageFailed(true)} onLoad={event => { if (!event.currentTarget.currentSrc.startsWith('data:')) setLoaded(value => ({ ...value, before: true })) }} /></div>
        {(imageFailed || !loaded.before || !loaded.after) && <span className="ze4-comparison-status" role="status">{imageFailed ? 'Foto indisponível. Recarregue a página para tentar novamente.' : 'Carregando fotografias…'}</span>}
        <div className="ze4-comparison-divider" aria-hidden="true"><span><ChevronLeft size={14} /><ChevronRight size={14} /></span></div>
        <input disabled={imageFailed} data-analytics-comparator={analyticsId} type="range" min="0" max="100" step="1" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-labelledby={labelId} aria-valuetext={`${position}% da imagem antes; ${100 - position}% da imagem depois`} />
        <span className="ze4-comparison-label ze4-comparison-label-before">Antes</span><span className="ze4-comparison-label ze4-comparison-label-after">Depois</span>
      </> : <>
        <NearImage src={preview} alt="Imagem ilustrativa; comparação de atendimento real ainda indisponível." width="680" height="360" loading="lazy" decoding="async" />
        <div className="ze4-comparison-empty"><Sparkles size={22} strokeWidth={1.2} aria-hidden="true" /><span>O cuidado faz a diferença</span><small>Comparação real indisponível</small></div>
      </>}
      </div>
    </figure>
  )
}

export function ResultsSection() {
  return (
    <section id="resultados" className="ze4-results" aria-labelledby="ze4-results-title">
      <div className="ze4-container ze4-results-main">
        <CommercialReveal className="ze4-results-copy">
          <Eyebrow>Antes / Depois</Eyebrow>
          <h2 id="ze4-results-title">A diferença<br />{' '}está <span>nos detalhes</span></h2>
          <p>Conheça nosso cuidado com a pintura, os bancos e os detalhes do interior.</p>
        </CommercialReveal>
        <div className="ze4-results-grid">
          {[
            { key: 'paint', title: 'Pintura', preview: 'service-wash' },
            { key: 'seats', title: 'Bancos', preview: 'service-seats' },
            { key: 'carpet', title: 'Carpete', preview: 'service-carpet' },
          ].map(({ key, title, preview }, index) => <CommercialReveal key={key} className="ze4-comparison-reveal" delay={index * 0.1}><BeforeAfterComparison analyticsId={key} title={title} preview={editorial(preview)} pair={{ before: editorial(`comparison-${key}-before`), after: editorial(`comparison-${key}-after`), source: key === 'paint' ? 'real' : 'illustrative', note: key === 'paint' ? 'Fotos reais cedidas pela Zelo. Limpeza da caixa de roda e lataria; ângulos diferentes.' : 'Demonstração ilustrativa — não é resultado real da Zelo.', beforeAlt: key === 'paint' ? 'Carro vermelho antes da limpeza, mostrando sujeira na região da caixa de roda, pneu e lataria.' : `${title} antes da limpeza, em uma demonstração ilustrativa.`, afterAlt: key === 'paint' ? 'Carro vermelho após a limpeza, mostrando a região da caixa de roda, pneu e lataria mais limpos.' : `${title} depois da limpeza, em uma demonstração ilustrativa.` }} /></CommercialReveal>)}
        </div>
      </div>
      <div className="ze4-container ze4-results-actions">
        <a data-analytics-quote className="ze4-button" href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer">Solicitar orçamento<ArrowRight size={16} aria-hidden="true" /></a>
        <a className="ze4-button-outline" href="#servicos">Conhecer todos os serviços<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </section>
  )
}

const processSteps = [
  { title: 'Avaliação', image: 'process-evaluation', description: 'Converse com a equipe sobre o veículo e o cuidado indicado para cada caso.' },
  { title: 'Detalhamento', image: 'process-execution', description: 'Defina o serviço e conheça os cuidados de limpeza de cada superfície.' },
  { title: 'Entrega', image: 'process-delivery', description: 'Combine a entrega e as orientações para cuidar do veículo no dia a dia.' },
]

function ProcessStep({ step, index }: { step: typeof processSteps[number]; index: number }) {
  const reduced = useReducedMotion()
  return <m.li className="ze4-process-step" initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.7, delay: reduced ? 0 : index * 0.14, ease }}>
    <div className="ze4-process-number"><span>{String(index + 1).padStart(2, '0')}</span><m.i aria-hidden="true" initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: reduced ? 0 : index * 0.14, ease }} /></div>
    <div className="ze4-process-step-photo"><NearImage src={editorial(step.image)} width="600" height="250" alt="" loading="lazy" decoding="async" /><ChevronRight aria-hidden="true" /></div>
    <h3>{step.title}</h3><p>{step.description}</p>
  </m.li>
}

export function ProcessSection() {
  return (
    <section id="processo" className="ze4-process" aria-labelledby="ze4-process-title">
      <span id="sobre" className="ze4-anchor-alias" aria-hidden="true" />
      <div className="ze4-process-scene" aria-hidden="true"><NearImage original src={editorial('process-detail')} width="1600" height="1100" alt="" loading="lazy" decoding="async" /><OutlineWord /></div>
      <div className="ze4-process-aside" aria-hidden="true">Cuidado<br />Técnica<br />Produtos<br />Detalhes<br />Confiança<span /></div>
      <div className="ze4-container ze4-process-content">
        <CommercialReveal className="ze4-process-heading">
          <Eyebrow>Processo Zelo</Eyebrow>
          <h2 id="ze4-process-title" className="ze4-commercial-title">Excelência<br /><span>em cada<br />detalhe</span></h2>
          <p className="ze4-commercial-description">Cada veículo tem sua história e suas necessidades. Converse com a equipe para definir o cuidado ideal — da escolha do serviço aos detalhes da entrega.</p>
        </CommercialReveal>
        <ol className="ze4-process-timeline">{processSteps.map((step, index) => <ProcessStep key={step.title} step={step} index={index} />)}</ol>
      </div>
    </section>
  )
}

export function QualitySection() {
  const reducedMotion = useReducedMotion()
  return (
    <section id="marcas" className="ze4-quality" aria-labelledby="ze4-quality-title">
      <m.div className="ze4-quality-scene" aria-hidden="true" initial={reducedMotion ? false : { opacity: 0, scale: 1.015 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: reducedMotion ? 0 : 0.95, ease }}><NearImage original src={editorial('quality-products')} width="1600" height="650" alt="" loading="lazy" decoding="async" /></m.div>
      <div className="ze4-container ze4-quality-content">
        <CommercialReveal className="ze4-quality-copy">
          <Eyebrow>Qualidade que</Eyebrow><h2 id="ze4-quality-title">Faz diferença</h2>
          <p>Produtos adequados a cada superfície, com atenção ao acabamento e aos detalhes do seu veículo.</p>
          <div className="ze4-quality-chips"><span><ShieldCheck aria-hidden="true" />Cuidado<br />criterioso</span><span><Diamond aria-hidden="true" />Atenção aos<br />detalhes</span><span><Leaf aria-hidden="true" />Limpeza e<br />conservação</span></div>
          <div className="ze4-quality-brands" role="group" aria-label="Marcas de produtos utilizadas">{productBrands.map((brand) => <a key={brand.name} data-brand={brand.name} href={brand.href} target="_blank" rel="noopener noreferrer" aria-label={`Visitar site oficial da ${brand.name} (abre em nova aba)`}><NearImage src={brand.logo} alt={brand.name} width="90" height="30" loading="lazy" decoding="async" /></a>)}</div>
        </CommercialReveal>
        <ul className="ze4-quality-attributes"><li><Check aria-hidden="true" />Cuidado na limpeza</li><li><Check aria-hidden="true" />Atenção ao acabamento</li><li><Check aria-hidden="true" />Detalhes que valorizam</li></ul>
      </div>
    </section>
  )
}
