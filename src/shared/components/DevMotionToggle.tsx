import { Settings2 } from 'lucide-react'
import { useMotionSettings } from '../motion/MotionSettings'

export function DevMotionToggle() {
  const { forceAnimations, toggleForceAnimations, reducedMotion } = useMotionSettings()

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <button
      type="button"
      aria-label={forceAnimations ? 'Animacoes forcadas ativas' : 'Forcar animacoes'}
      onClick={toggleForceAnimations}
      className="fixed bottom-3 left-3 z-[70] inline-flex h-10 w-10 items-center justify-center border border-brand-gold/45 bg-brand-graphite/92 text-brand-gold backdrop-blur-xl md:bottom-4 md:left-auto md:right-4 md:h-auto md:w-auto md:px-4 md:py-3 md:text-[10px] md:uppercase md:tracking-[0.24em]"
    >
      <Settings2 className="md:hidden" size={17} />
      <span className="hidden md:block">
        {forceAnimations ? 'Animacoes forcadas ativas' : 'Forcar animacoes (dev)'}
        <span className="mt-1 block text-brand-silver">
          {reducedMotion ? 'Reduced motion do SO ativo' : 'Movimento normal'}
        </span>
      </span>
    </button>
  )
}
