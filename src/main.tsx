import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CinematicProvider } from '@features/cinematic/context/CinematicContext'
import { MotionSettingsProvider } from '@shared/motion/MotionSettings'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionSettingsProvider>
      <CinematicProvider>
        <App />
      </CinematicProvider>
    </MotionSettingsProvider>
  </StrictMode>,
)
