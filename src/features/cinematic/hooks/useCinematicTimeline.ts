import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cinematicScenes } from '../data/cinematicKeyframes'
import { useSetCinematicState } from '../context/CinematicContext'

gsap.registerPlugin(ScrollTrigger)

export function useCinematicTimeline(enabled: boolean) {
  const setSceneState = useSetCinematicState()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const triggers = cinematicScenes
      .map((scene) => {
        const triggerElement = document.getElementById(scene.triggerId)

        if (!triggerElement) {
          return null
        }

        return ScrollTrigger.create({
          trigger: triggerElement,
          pin: true,
          scrub: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * (scene.pinDurationVh / 100)}`,
          invalidateOnRefresh: true,
          onEnter: () => setSceneState(scene.id, 0),
          onEnterBack: () => setSceneState(scene.id, 1),
          onUpdate: (self) => {
            setSceneState(scene.id, self.progress)
          },
        })
      })
      .filter((trigger): trigger is ScrollTrigger => Boolean(trigger))

    ScrollTrigger.refresh()

    return () => {
      triggers.forEach((trigger) => trigger.kill())
    }
  }, [enabled, setSceneState])
}
