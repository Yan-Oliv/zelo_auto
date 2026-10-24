import { useEffect, useRef } from 'react'
import { applyErrorMetadata } from './errorMetadata'
import { errorContactUrl, errorMessages, type ErrorCode } from './errorMessages'

type ErrorPageProps = { code: ErrorCode; onRetry?: () => void }

export function ErrorPage({ code, onRetry }: ErrorPageProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  const message = errorMessages[code]
  useEffect(() => {
    const restore = applyErrorMetadata(code)
    heading.current?.focus({ preventScroll: true })
    return restore
  }, [code])

  return (
    <div className="ze-error" data-error-code={code}>
      <header className="ze-error__header">
        <a href="/" aria-label="Zelo — início"><img className="ze-error__logo" src="/hero/responsive/zelo-logo-480.webp" width="240" height="60" alt="Zelo Auto Estética" /></a>
        <a className="ze-error__back" href="/">Voltar ao início <span aria-hidden="true">↗</span></a>
      </header>
      <main id="error-root" className="ze-error__main" aria-labelledby="ze-error-heading">
        <div className="ze-error__art" aria-hidden="true">
          <span className="ze-error__wordmark">ZELO</span>
          <svg className="ze-error__number" viewBox="0 0 640 240" focusable="false"><text x="320" y="204" textAnchor="middle">{code}</text></svg>
          <img className="ze-error__silhouette" src="/errors/silhouette.svg" alt="" width="560" height="70" />
        </div>
        <div className="ze-error__copy">
          <p className="ze-error__eyebrow">{message.eyebrow}</p>
          <h1 id="ze-error-heading" ref={heading} tabIndex={-1}>{message.title}</h1>
          <p className="ze-error__description">{message.description}</p>
          <div className="ze-error__actions">
            {code === 404 ? <a className="ze-error__button ze-error__button--gold" href="/">Voltar ao início <span aria-hidden="true">→</span></a> : <button className="ze-error__button ze-error__button--gold" type="button" data-error-retry onClick={onRetry ?? (() => window.location.reload())}>Tentar novamente <span aria-hidden="true">↻</span></button>}
            <a className="ze-error__button" href={code !== 500 ? errorContactUrl : '/'} {...(code !== 500 ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{code !== 500 ? 'Falar com a Zelo' : 'Voltar ao início'} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </main>
      <footer className="ze-error__footer"><span>MAIS QUE ESTÉTICA.</span><span>É VALORIZAÇÃO.</span></footer>
    </div>
  )
}
