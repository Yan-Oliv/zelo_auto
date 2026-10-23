import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { getConsent, initializeAnalytics, setConsent, subscribeConsent } from './analytics'
import './consent.css'

export function ConsentControls() {
  const reducedMotion = useReducedMotion()
  const consent = useSyncExternalStore(subscribeConsent, getConsent)
  const [preferences, setPreferences] = useState(false)
  const [analytics, setAnalytics] = useState(consent === 'granted')
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  useEffect(() => { initializeAnalytics() }, [])
  useEffect(() => {
    if (!preferences) return
    returnRef.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    return () => { returnRef.current?.focus() }
  }, [preferences])
  const open = () => { setAnalytics(consent === 'granted'); setPreferences(true) }
  return <>
    <button className="zelo-privacy-access" type="button" onClick={open}>Privacidade e cookies</button>
    <AnimatePresence>
      {(consent === 'unset' || preferences) && <m.aside className="zelo-consent" aria-labelledby="zelo-consent-title" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: 10 }} transition={{ duration: reducedMotion ? 0 : .35 }}>
        <h2 id="zelo-consent-title">Privacidade e experiência</h2>
        <p>Utilizamos tecnologias opcionais para entender como nosso site é utilizado e melhorar sua experiência.</p>
        <div className="zelo-consent-actions">
          <button type="button" onClick={() => { setConsent('granted'); setPreferences(false) }}>Aceitar analytics</button>
          <button type="button" onClick={() => { setConsent('denied'); setPreferences(false) }}>Recusar opcionais</button>
          <button type="button" onClick={open}>Configurar preferências</button>
        </div>
      </m.aside>}
    </AnimatePresence>
    {preferences && <div className="zelo-privacy-backdrop" onClick={event => { if (event.target === event.currentTarget) setPreferences(false) }}>
      <section className="zelo-privacy-panel" role="dialog" aria-modal="true" aria-labelledby="zelo-privacy-title" onKeyDown={event => {
        if (event.key === 'Escape') setPreferences(false)
        if (event.key !== 'Tab') return
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, input, a[href]'))
        const first = controls[0], last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}>
        <button ref={closeRef} className="zelo-privacy-close" type="button" onClick={() => setPreferences(false)} aria-label="Fechar preferências">×</button>
        <h2 id="zelo-privacy-title">Sua privacidade na Zelo</h2>
        <p>Responsável pelo site: Zelo Estética Automotiva, Catalão–GO. Para dúvidas e solicitações sobre seus dados, fale com a equipe pelo contato disponível na seção Contato.</p>
        <p>Apenas com sua autorização, usamos o Google Analytics 4 para medir visitas e cliques de interesse. Não enviamos mensagens, telefones, termos de busca ou dados de formulários. Não usamos publicidade personalizada.</p>
        <p>O Google pode processar identificadores de cookies, informações do dispositivo e dados de conexão em servidores fora do Brasil. Cookies analíticos e sua escolha são mantidos por até 180 dias. O Google administra a retenção dos relatórios conforme a configuração da propriedade.</p>
        <p>Você pode recusar ou revogar a autorização aqui a qualquer momento, sem perder acesso ao site. A revogação interrompe novas medições e remove os cookies analíticos acessíveis a este site; dados já recebidos não são apagados automaticamente.</p>
        <p>Instagram, WhatsApp e mapas têm políticas próprias ao acessar ou carregar seus serviços. <a href="https://policies.google.com/privacy?hl=pt-BR" target="_blank" rel="noopener noreferrer">Política de privacidade do Google</a>.</p>
        <p><strong>Essenciais:</strong> guardamos sua escolha e o estado da animação, sem identificar você.</p>
        <label className="zelo-privacy-choice"><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /> Permitir analytics opcionais</label>
        <div className="zelo-consent-actions"><button type="button" onClick={() => { setConsent(analytics ? 'granted' : 'denied'); setPreferences(false) }}>Salvar preferências</button><button type="button" onClick={() => { setConsent('denied'); setPreferences(false) }}>Revogar analytics</button></div>
      </section>
    </div>}
  </>
}
