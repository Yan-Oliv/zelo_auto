export const MEASUREMENT_ID = 'G-E9SKGKCQXX'
export const CONSENT_KEY = 'zelo:analytics-consent:v1'
export type Consent = 'unset' | 'granted' | 'denied'
export type Service = 'lavagem_completa' | 'limpeza_interna' | 'higienizacao_bancos' | 'higienizacao_carpete'
export type Location = 'header' | 'services' | 'results' | 'location' | 'footer' | 'instagram_grid' | 'reviews'
type Events = {
  page_view: { page_location: string; page_title: string },
  quote_click: { cta_location: Location; service_context?: Service },
  whatsapp_click: { cta_location: Location; service_context?: Service },
  select_service: { service_name: Service },
  instagram_click: { cta_location: Location; link_type: 'profile' | 'post' },
  directions_click: { cta_location: Location },
  google_reviews_click: { cta_location: Location; review_action: 'view' | 'write' },
  internal_search: { result_count: number; selected_section: string },
  before_after_interaction: { comparator_id: string },
}
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __ZELO_ANALYTICS_DIAGNOSTIC__?: boolean
  }
}
const canonical = 'https://zelo.omnyatech.com.br/'
const title = 'Zelo Estética Automotiva em Catalão – GO'
const sections = ['hero', 'servicos', 'processo', 'resultados', 'avaliacoes', 'contato', 'instagram', 'marcas', 'localizacao']
const locations = ['header', 'services', 'results', 'location', 'footer', 'instagram_grid', 'reviews']
const services = ['lavagem_completa', 'limpeza_interna', 'higienizacao_bancos', 'higienizacao_carpete']
const allowed: Record<string, Record<string, readonly string[] | 'count'>> = {
  page_view: { page_location: [canonical], page_title: [title] },
  quote_click: { cta_location: locations, service_context: services },
  whatsapp_click: { cta_location: locations, service_context: services },
  select_service: { service_name: services },
  instagram_click: { cta_location: locations, link_type: ['profile', 'post'] },
  directions_click: { cta_location: locations }, google_reviews_click: { cta_location: locations, review_action: ['view', 'write'] },
  internal_search: { result_count: 'count', selected_section: sections },
  before_after_interaction: { comparator_id: ['paint', 'seats', 'carpet'] },
}
function readConsent(): Consent {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')
    if (value?.version === 1 && typeof value.savedAt === 'number' && Number.isFinite(value.savedAt)
      && Date.now() - value.savedAt < 180 * 86400000 && value.savedAt <= Date.now()
      && (value.choice === 'granted' || value.choice === 'denied')) return value.choice
  } catch { /* Storage is optional; fail closed. */ }
  return 'unset'
}
let consent = readConsent()
let initialized = false
let viewed = false
const subscribers = new Set<() => void>()
const eligible = () => window.location.pathname === '/'
const live = () => import.meta.env.PROD && window.location.hostname === 'zelo.omnyatech.com.br'
const diagnostic = () => !live() && window.__ZELO_ANALYTICS_DIAGNOSTIC__ === true
function command(...args: unknown[]) { try { window.gtag?.(...args) } catch { /* Analytics never interrupts a CTA. */ } }
const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }
function start() {
  if (consent !== 'granted' || !eligible()) return
  if (live()) {
    Object.assign(window, { [`ga-disable-${MEASUREMENT_ID}`]: false })
    if (!initialized) {
      initialized = true
      window.dataLayer = window.dataLayer || []
      window.gtag = function () { window.dataLayer?.push(arguments) }
      command('consent', 'default', denied)
      command('consent', 'update', { ...denied, analytics_storage: 'granted' })
      command('js', new Date())
      command('config', MEASUREMENT_ID, {
        send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        page_location: canonical, page_referrer: safeReferrer(), page_title: title,
        cookie_expires: 180 * 86400, cookie_update: false,
      })
      try {
        const script = document.createElement('script')
        script.id = 'zelo-ga4'
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
        script.onerror = () => { /* Blocked tags leave navigation untouched. */ }
        document.head.append(script)
      } catch { /* Restrictive browser policies must not affect the landing. */ }
    } else command('consent', 'update', { ...denied, analytics_storage: 'granted' })
  }
  if (!viewed && (live() || diagnostic())) {
    viewed = true
    track('page_view', { page_location: canonical, page_title: title })
  }
}
function safeReferrer() {
  try { return document.referrer ? new URL(document.referrer).origin + '/' : '' } catch { return '' }
}
function clearCookies() {
  for (const item of document.cookie.split(';')) {
    const name = item.trim().split('=')[0]
    if (name !== '_ga' && !name.startsWith('_ga_')) continue
    const host = window.location.hostname.split('.')
    const domains = ['', ...host.map((_, index) => '.' + host.slice(index).join('.'))]
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''} SameSite=Lax`
  }
}
function stop() {
  Object.assign(window, { [`ga-disable-${MEASUREMENT_ID}`]: true })
  // Remove queued events if consent is revoked before gtag.js has downloaded.
  if (window.dataLayer) {
    for (let index = window.dataLayer.length - 1; index >= 0; index--) {
      const value = window.dataLayer[index] as { 0?: string }
      if (value?.[0] === 'event') window.dataLayer.splice(index, 1)
    }
  }
  if (initialized) command('consent', 'update', denied)
  try { clearCookies() } catch { /* Cookies may be unavailable in a restricted browser. */ }
}
export function getConsent() { return consent }
export function subscribeConsent(callback: () => void) { subscribers.add(callback); return () => { subscribers.delete(callback) } }
export function setConsent(choice: Exclude<Consent, 'unset'>) {
  consent = choice
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, choice, savedAt: Date.now() })) } catch { /* Memory fallback. */ }
  if (choice === 'granted') start(); else stop()
  subscribers.forEach(callback => callback())
}
export function initializeAnalytics() { start() }
window.addEventListener('storage', event => {
  if (event.key !== CONSENT_KEY && event.key !== null) return
  consent = readConsent()
  if (consent === 'granted') start(); else stop()
  subscribers.forEach(callback => callback())
})
export function track<K extends keyof Events>(event: K, params: Events[K]) {
  if (consent !== 'granted' || !eligible() || (!live() && !diagnostic())) return
  const schema = allowed[event]
  if (!schema) return
  const clean: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    const rule = schema[key]
    if (rule === 'count' && typeof value === 'number' && Number.isFinite(value)) clean[key] = Math.max(0, Math.min(100, Math.floor(value)))
    else if (Array.isArray(rule) && typeof value === 'string' && rule.includes(value)) clean[key] = value
  }
  // Reject malformed required fields, and never forward arbitrary runtime strings.
  for (const key of Object.keys(schema)) if (key !== 'service_context' && !(key in clean)) return
  if (diagnostic()) window.dispatchEvent(new CustomEvent('zelo:analytics', { detail: { event, params: clean } }))
  else command('event', event, { ...clean, send_to: MEASUREMENT_ID })
}
