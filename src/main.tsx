import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { MotionSettingsProvider } from '@shared/motion/MotionSettings'
import { LazyMotion, domAnimation } from 'framer-motion'
import './index.css'

if (window.location.pathname === '/debug-model' || window.location.pathname === '/debug-crossfade') {
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (!robots) {
    robots = document.createElement('meta')
    robots.name = 'robots'
    document.head.append(robots)
  }
  robots.content = 'noindex, nofollow, noarchive'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionSettingsProvider>
      <LazyMotion features={domAnimation} strict><App /></LazyMotion>
    </MotionSettingsProvider>
  </StrictMode>,
)
