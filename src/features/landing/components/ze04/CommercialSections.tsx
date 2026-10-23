import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Armchair, ArrowRight, ChartNoAxesColumnIncreasing, Check, ChevronLeft, ChevronRight, Diamond, Droplets, Leaf, ShieldCheck, Sparkles, SprayCan, Waves } from 'lucide-react'
import { productBrands, services, siteConfig, type ServiceItem } from '../../data/site'
import './CommercialSections.css'

const ease = [0.16, 1, 0.3, 1] as const
const serviceIcons = { wash: Droplets, interior: SprayCan, seats: Armchair, carpet: Waves }
const editorial = (name: string) => `/editorial/${name}.webp`

function CommercialReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.72, delay: reduced ? 0 : delay, ease }}>{children}</motion.div>
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
    <motion.article className="ze4-service-card" initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.72, delay: reduced ? 0 : index * 0.1, ease }}>
      <div className="ze4-service-photo"><img src={editorial(`service-${service.icon}`)} width="680" height="520" loading="lazy" decoding="async" alt="" /></div>
      <div className="ze4-service-copy">
        <Icon className="ze4-service-icon" size={29} strokeWidth={1.25} aria-hidden="true" />
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <span className="ze4-service-rule" aria-hidden="true" />
      </div>
      <a className="ze4-service-action" href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer" aria-label={`Solicitar orçamento: ${service.title}`}><ArrowRight size={19} strokeWidth={1.4} /></a>
    </motion.article>
  )
}

export function ServicesSection() {
  return (
    <section id="servicos" className="ze4-services" aria-labelledby="ze4-services-title">
      <div className="ze4-services-scene" aria-hidden="true">
        <img className="ze4-services-showroom" src="/hero/showroom-reference.webp" width="4096" height="2304" alt="" loading="lazy" decoding="async" />
        <OutlineWord />
        <img className="ze4-services-car" src="/hero/car-4k.webp" width="4096" height="2304" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="ze4-container">
        <div className="ze4-services-intro">
          <CommercialReveal className="ze4-services-heading">
            <Eyebrow>Nossos serviços</Eyebrow>
            <h2 id="ze4-services-title" className="ze4-commercial-title">Cuidado em<br /><span>cada detalhe</span></h2>
            <p className="ze4-commercial-description">Serviços especializados para cuidar da estética<br className="ze4-desktop-break" /> e do valor do seu veículo, em cada detalhe.</p>
          </CommercialReveal>
          <div className="ze4-service-benefits" aria-label="Cuidado Zelo">
            <span><Diamond aria-hidden="true" /><span>Cuidado em<br />cada detalhe</span></span>
            <span><ShieldCheck aria-hidden="true" /><span>Produtos de<br />qualidade</span></span>
            <span><ChartNoAxesColumnIncreasing aria-hidden="true" /><span>Atendimento<br />especializado</span></span>
          </div>
        </div>
        <div className="ze4-services-grid">{services.map((service, index) => <PremiumServiceCard key={service.icon} service={service} index={index} />)}</div>
        <p className="ze4-editorial-note">Fotografias ilustrativas dos serviços.</p>
      </div>
    </section>
  )
}

export type ComparisonPair = { before: string; after: string; beforeAlt: string; afterAlt: string }

export function BeforeAfterComparison({ title, preview, pair }: { title: string; preview: string; pair?: ComparisonPair }) {
  const [position, setPosition] = useState(50)
  const labelId = useId()
  const noteId = useId()
  return (
    <figure className={`ze4-comparison${pair ? ' ze4-comparison-ready' : ''}`} style={{ '--ze4-comparison-position': `${position}%` } as CSSProperties}>
      <figcaption id={labelId} className="ze4-comparison-title">{title}</figcaption>
      {pair ? <>
        <img src={pair.after} alt={pair.afterAlt} width="680" height="360" loading="lazy" decoding="async" />
        <div className="ze4-comparison-before"><img src={pair.before} alt={pair.beforeAlt} width="680" height="360" loading="lazy" decoding="async" /></div>
        <div className="ze4-comparison-divider" aria-hidden="true"><span><ChevronLeft size={14} /><ChevronRight size={14} /></span></div>
        <input type="range" min="0" max="100" step="1" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-labelledby={labelId} aria-describedby={noteId} aria-valuetext={`${position}% da imagem antes; ${100 - position}% da imagem depois`} />
        <span className="ze4-comparison-label ze4-comparison-label-before">Antes</span><span className="ze4-comparison-label ze4-comparison-label-after">Depois</span>
        <p id={noteId} className="ze4-comparison-note">Demonstração ilustrativa — não é resultado real da Zelo.</p>
      </> : <>
        <img src={preview} alt="Imagem ilustrativa; comparação de atendimento real ainda indisponível." width="680" height="360" loading="lazy" decoding="async" />
        <div className="ze4-comparison-empty"><Sparkles size={22} strokeWidth={1.2} aria-hidden="true" /><span>O cuidado faz a diferença</span><small>Comparação real indisponível</small></div>
        <p id={noteId} className="ze4-comparison-note">Imagem ilustrativa — sem comparação de atendimento real.</p>
      </>}
    </figure>
  )
}

export function ResultsSection() {
  return (
    <section id="resultados" className="ze4-results" aria-labelledby="ze4-results-title">
      <div className="ze4-container ze4-results-main">
        <CommercialReveal className="ze4-results-copy">
          <Eyebrow>Antes / Depois</Eyebrow>
          <h2 id="ze4-results-title">A diferença<br />está <span>nos detalhes</span></h2>
          <p>Conheça nosso cuidado com a pintura, os bancos e os detalhes do interior.</p>
        </CommercialReveal>
        <div className="ze4-results-grid">
          {[
            { key: 'paint', title: 'Pintura', preview: 'service-wash' },
            { key: 'seats', title: 'Bancos', preview: 'service-seats' },
            { key: 'carpet', title: 'Carpete', preview: 'service-carpet' },
          ].map(({ key, title, preview }) => <BeforeAfterComparison key={key} title={title} preview={editorial(preview)} pair={{ before: editorial(`comparison-${key}-before`), after: editorial(`comparison-${key}-after`), beforeAlt: `${title} antes da limpeza, em uma demonstração ilustrativa.`, afterAlt: `${title} depois da limpeza, em uma demonstração ilustrativa.` }} />)}
        </div>
      </div>
      <div className="ze4-container ze4-results-actions">
        <a className="ze4-button" href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer">Solicitar orçamento<ArrowRight size={16} aria-hidden="true" /></a>
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
  return <motion.li className="ze4-process-step" initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.7, delay: reduced ? 0 : index * 0.14, ease }}>
    <div className="ze4-process-number"><span>{String(index + 1).padStart(2, '0')}</span><motion.i aria-hidden="true" initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: reduced ? 0 : index * 0.14, ease }} /></div>
    <div className="ze4-process-step-photo"><img src={editorial(step.image)} width="600" height="250" alt="" loading="lazy" decoding="async" /><ChevronRight aria-hidden="true" /></div>
    <h3>{step.title}</h3><p>{step.description}</p>
  </motion.li>
}

export function ProcessSection() {
  return (
    <section id="processo" className="ze4-process" aria-labelledby="ze4-process-title">
      <span id="sobre" className="ze4-anchor-alias" aria-hidden="true" />
      <div className="ze4-process-scene" aria-hidden="true"><img src={editorial('process-detail')} width="1600" height="1100" alt="" loading="lazy" decoding="async" /><OutlineWord /></div>
      <div className="ze4-process-aside" aria-hidden="true">Cuidado<br />Técnica<br />Produtos<br />Detalhes<br />Confiança<span /></div>
      <div className="ze4-container ze4-process-content">
        <CommercialReveal className="ze4-process-heading">
          <Eyebrow>Processo Zelo</Eyebrow>
          <h2 id="ze4-process-title" className="ze4-commercial-title">Excelência<br /><span>em cada<br />detalhe</span></h2>
          <p className="ze4-commercial-description">Cada veículo tem sua história e suas necessidades. Converse com a equipe para definir o cuidado ideal — da escolha do serviço aos detalhes da entrega.</p>
        </CommercialReveal>
        <ol className="ze4-process-timeline">{processSteps.map((step, index) => <ProcessStep key={step.title} step={step} index={index} />)}</ol>
        <p className="ze4-editorial-note">Imagens ilustrativas do cuidado automotivo.</p>
      </div>
    </section>
  )
}

export function QualitySection() {
  const reducedMotion = useReducedMotion()
  return (
    <section id="marcas" className="ze4-quality" aria-labelledby="ze4-quality-title">
      <motion.div className="ze4-quality-scene" aria-hidden="true" initial={reducedMotion ? false : { opacity: 0, scale: 1.015 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: reducedMotion ? 0 : 0.95, ease }}><img src={editorial('quality-products')} width="1600" height="650" alt="" loading="lazy" decoding="async" /></motion.div>
      <div className="ze4-container ze4-quality-content">
        <CommercialReveal className="ze4-quality-copy">
          <Eyebrow>Qualidade que</Eyebrow><h2 id="ze4-quality-title">Faz diferença</h2>
          <p>Produtos adequados a cada superfície, com atenção ao acabamento e aos detalhes do seu veículo.</p>
          <div className="ze4-quality-chips"><span><ShieldCheck aria-hidden="true" />Cuidado<br />criterioso</span><span><Diamond aria-hidden="true" />Atenção aos<br />detalhes</span><span><Leaf aria-hidden="true" />Limpeza e<br />conservação</span></div>
          <div className="ze4-quality-brands" aria-label="Marcas de produtos utilizadas">{productBrands.map((brand) => <img key={brand.name} src={brand.logo} alt={brand.name} width="90" height="30" loading="lazy" decoding="async" />)}</div>
        </CommercialReveal>
        <ul className="ze4-quality-attributes"><li><Check aria-hidden="true" />Cuidado na limpeza</li><li><Check aria-hidden="true" />Atenção ao acabamento</li><li><Check aria-hidden="true" />Detalhes que valorizam</li></ul>
        <span className="ze4-quality-caption">Composição ilustrativa de produtos.</span>
      </div>
    </section>
  )
}
