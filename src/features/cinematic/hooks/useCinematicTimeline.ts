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
      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=3600', pin: true, scrub: .8, invalidateOnRefresh: true, onUpdate: (self) => setSceneState('hero', self.progress) } })
    })
    ScrollTrigger.refresh()
    return () => context.revert()
  }, [enabled, setSceneState])
}
