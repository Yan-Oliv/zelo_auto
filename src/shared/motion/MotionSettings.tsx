import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type MotionSettingsValue = {
  forceAnimations: boolean
  reducedMotion: boolean
  toggleForceAnimations: () => void
}

const MotionSettingsContext = createContext<MotionSettingsValue | null>(null)

const STORAGE_KEY = 'zelo-force-animations'

export function MotionSettingsProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [forceAnimations, setForceAnimations] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setForceAnimations(stored === 'true')
  }, [])

  const value = useMemo<MotionSettingsValue>(
    () => ({
      forceAnimations,
      reducedMotion: prefersReducedMotion && !forceAnimations,
      toggleForceAnimations: () => {
        setForceAnimations((current) => {
          const next = !current
          window.localStorage.setItem(STORAGE_KEY, String(next))
          return next
        })
      },
    }),
    [forceAnimations, prefersReducedMotion],
  )

  return <MotionSettingsContext.Provider value={value}>{children}</MotionSettingsContext.Provider>
}

export function useMotionSettings() {
  const context = useContext(MotionSettingsContext)
  if (!context) {
    throw new Error('useMotionSettings must be used within MotionSettingsProvider')
  }
  return context
}
