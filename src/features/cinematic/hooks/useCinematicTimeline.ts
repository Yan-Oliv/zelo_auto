import { useEffect } from 'react'
import { cinematicScenes } from '../data/cinematicKeyframes'
import { useSetCinematicState } from '../context/CinematicContext'

export function useCinematicTimeline(enabled: boolean) {
  const setSceneState = useSetCinematicState()

  useEffect(() => {
    if (!enabled) {
      return
    }

    let frameId = 0

    const updateSceneState = () => {
      frameId = 0

      const viewportHeight = window.innerHeight
      const viewportCenter = window.scrollY + viewportHeight * 0.5
      const sceneMetrics = cinematicScenes
        .map((scene) => {
          const element = document.getElementById(scene.triggerId)

          if (!element) {
            return null
          }

          const rect = element.getBoundingClientRect()
          const top = window.scrollY + rect.top
          const height = Math.max(element.offsetHeight, viewportHeight * 0.92)
          const start = scene.id === 'hero' ? top : top - viewportHeight * 0.6
          const end = top + height - viewportHeight * 0.35
          const progress = clamp((window.scrollY - start) / Math.max(1, end - start))
          const center = top + height * 0.5

          return {
            id: scene.id,
            progress,
            distance: Math.abs(center - viewportCenter),
          }
        })
        .filter((scene): scene is { id: typeof cinematicScenes[number]['id']; progress: number; distance: number } => Boolean(scene))

      const activeScene = sceneMetrics.sort((left, right) => left.distance - right.distance)[0]

      if (activeScene) {
        setSceneState(activeScene.id, activeScene.progress)
      }
    }

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateSceneState)
      }
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [enabled, setSceneState])
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}
