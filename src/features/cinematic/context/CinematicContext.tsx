import {
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cinematicScenes, type SceneId } from '../data/cinematicKeyframes'

export type CinematicState = {
  activeSceneId: SceneId
  sceneProgress: number
  globalProgress: number
}

type CinematicContextValue = {
  state: CinematicState
  setSceneState: (sceneId: SceneId, sceneProgress: number) => void
}

const CinematicContext = createContext<CinematicContextValue | null>(null)

const totalDuration = cinematicScenes.reduce((sum, scene) => sum + scene.pinDurationVh, 0)
const sceneOffsets = cinematicScenes.reduce<Record<SceneId, number>>((accumulator, scene, index) => {
  const previous = cinematicScenes
    .slice(0, index)
    .reduce((sum, currentScene) => sum + currentScene.pinDurationVh, 0)

  accumulator[scene.id] = previous / totalDuration
  return accumulator
}, {} as Record<SceneId, number>)

const sceneWeights = cinematicScenes.reduce<Record<SceneId, number>>((accumulator, scene) => {
  accumulator[scene.id] = scene.pinDurationVh / totalDuration
  return accumulator
}, {} as Record<SceneId, number>)

export function CinematicProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CinematicState>({
    activeSceneId: 'hero',
    sceneProgress: 0,
    globalProgress: 0,
  })
  const setSceneState = useCallback((sceneId: SceneId, sceneProgress: number) => {
    const clampedSceneProgress = Math.max(0, Math.min(1, sceneProgress))
    const globalProgress = Math.max(
      0,
      Math.min(1, sceneOffsets[sceneId] + sceneWeights[sceneId] * clampedSceneProgress),
    )

    setState((currentState) => {
      if (
        currentState.activeSceneId === sceneId &&
        Math.abs(currentState.sceneProgress - clampedSceneProgress) < 0.001 &&
        Math.abs(currentState.globalProgress - globalProgress) < 0.001
      ) {
        return currentState
      }

      return {
        activeSceneId: sceneId,
        sceneProgress: clampedSceneProgress,
        globalProgress,
      }
    })
  }, [])

  const value = useMemo<CinematicContextValue>(
    () => ({
      state,
      setSceneState,
    }),
    [setSceneState, state],
  )

  return <CinematicContext.Provider value={value}>{children}</CinematicContext.Provider>
}

export function useCinematicState() {
  const context = useContext(CinematicContext)

  if (!context) {
    throw new Error('useCinematicState must be used within CinematicProvider')
  }

  return context.state
}

export function useSetCinematicState() {
  const context = useContext(CinematicContext)

  if (!context) {
    throw new Error('useSetCinematicState must be used within CinematicProvider')
  }

  return context.setSceneState
}
