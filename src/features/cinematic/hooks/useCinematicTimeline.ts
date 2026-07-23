import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSetCinematicState } from '../context/CinematicContext'

gsap.registerPlugin(ScrollTrigger)

// One scrubbed source of truth. Going backwards reconstructs the exact prior state.
export function useCinematicTimeline(enabled: boolean) {
  const setSceneState = useSetCinematicState()
  useEffect(() => {
    if (!enabled) return
    const context = gsap.context(() => {
      const hero = document.getElementById('hero')
      if (!hero) return
      // The foam story keeps the same deterministic 0–1 progress, but now
      // consumes 1.7× more physical scroll (3600px → 6120px).
      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=6120', pin: true, scrub: .8, invalidateOnRefresh: true, onUpdate: (self) => setSceneState('hero', self.progress) } })
    })
    ScrollTrigger.refresh()
    return () => context.revert()
  }, [enabled, setSceneState])
}
