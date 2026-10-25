import { renderToString } from 'react-dom/server'
import { LazyMotion, domAnimation } from 'framer-motion'
import { MotionSettingsProvider } from './shared/motion/MotionSettings'
import { LandingPage } from './features/landing/LandingPage'

export function renderHero() {
  return renderToString(<MotionSettingsProvider><LazyMotion features={domAnimation} strict><LandingPage /></LazyMotion></MotionSettingsProvider>)
}
