import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { MotionSettingsProvider } from '@shared/motion/MotionSettings'
import './index.css'
import { GlobalErrorBoundary } from '@shared/errors/GlobalErrorBoundary'
import { applyErrorMetadata } from '@shared/errors/errorMetadata'

if (/^\/debug-(model|crossfade)\/?$/.test(window.location.pathname)) {
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (!robots) {
    robots = document.createElement('meta')
    robots.name = 'robots'
    document.head.append(robots)
  }
  robots.content = 'noindex, nofollow, noarchive'
}

const rootContainer = document.getElementById('root')!
const nativeRecovery = document.querySelector<HTMLTemplateElement>('#zelo-native-recovery')?.innerHTML ?? rootContainer.innerHTML
const rootOptions = import.meta.env.PROD ? {
  // componentDidCatch owns the sanitized caught-error diagnostic.
  onCaughtError: () => {},
  onUncaughtError: () => {
    console.error('[Zelo] APP_ROOT_FAILED')
    rootContainer.innerHTML = nativeRecovery
    rootContainer.querySelector('[data-boot-fallback]')?.setAttribute('data-boot-failed', '')
    rootContainer.querySelector('[data-boot-fallback]')?.setAttribute('data-error-code', '500')
    rootContainer.querySelectorAll<HTMLImageElement>('img[data-error-src]').forEach(image => {
      image.src = image.dataset.errorSrc!
    })
    applyErrorMetadata(500)
    const heading = rootContainer.querySelector<HTMLElement>('#ze-error-heading')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  },
} : undefined

const application = (
  <StrictMode>
    <GlobalErrorBoundary>
      <MotionSettingsProvider>
      <App />
      </MotionSettingsProvider>
    </GlobalErrorBoundary>
  </StrictMode>
)
if (rootContainer.hasAttribute('data-prerendered') && window.location.pathname === '/') hydrateRoot(rootContainer, application, rootOptions)
else { rootContainer.removeAttribute('data-prerendered'); createRoot(rootContainer, rootOptions).render(application) }
