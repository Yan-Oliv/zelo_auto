import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { MotionSettingsProvider } from '@shared/motion/MotionSettings'
import { LazyMotion, domAnimation } from 'framer-motion'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionSettingsProvider>
      <LazyMotion features={domAnimation} strict><App /></LazyMotion>
    </MotionSettingsProvider>
  </StrictMode>,
)
