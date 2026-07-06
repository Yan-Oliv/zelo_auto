export type SceneId =
  | 'hero'
  | 'servicos'
  | 'marcas'
  | 'instagram'
  | 'caminho'
  | 'contato'

export type CinematicKeyframe = {
  sceneId: SceneId
  at: 0 | 1
  position: [number, number, number]
  rotationY: number
  fov: number
  dirtProgress: number
}

export type CinematicSceneConfig = {
  id: SceneId
  triggerId: string
  pinDurationVh: number
}

export const cinematicScenes: CinematicSceneConfig[] = [
  { id: 'hero', triggerId: 'hero', pinDurationVh: 180 },
  { id: 'servicos', triggerId: 'servicos', pinDurationVh: 300 },
  { id: 'marcas', triggerId: 'marcas', pinDurationVh: 110 },
  { id: 'instagram', triggerId: 'instagram', pinDurationVh: 220 },
  { id: 'caminho', triggerId: 'caminho', pinDurationVh: 200 },
  { id: 'contato', triggerId: 'contato', pinDurationVh: 120 },
]

// These transforms are inferred from the cinematic script and tuned to create
// deliberate scene cuts with larger readable framing changes.
export const cinematicKeyframes: CinematicKeyframe[] = [
  { sceneId: 'hero', at: 0, position: [1.12, 0.02, -0.1], rotationY: -0.62, fov: 34, dirtProgress: 0 },
  { sceneId: 'hero', at: 1, position: [1.02, 0.04, -1.08], rotationY: -0.52, fov: 37, dirtProgress: 0 },

  { sceneId: 'servicos', at: 0, position: [0.94, 0.02, -1.2], rotationY: -0.28, fov: 38, dirtProgress: 0.1 },
  { sceneId: 'servicos', at: 1, position: [0.76, 0.04, -0.94], rotationY: -0.04, fov: 35.6, dirtProgress: 0.25 },

  { sceneId: 'marcas', at: 0, position: [0.9, 0.04, -1.1], rotationY: 0.18, fov: 36.4, dirtProgress: 0.25 },
  { sceneId: 'marcas', at: 1, position: [0.78, 0.06, -0.86], rotationY: 0.42, fov: 34.6, dirtProgress: 0.4 },

  { sceneId: 'instagram', at: 0, position: [0.62, 0.04, -1.1], rotationY: 0.82, fov: 36.8, dirtProgress: 0.4 },
  { sceneId: 'instagram', at: 1, position: [0.46, 0.06, -0.82], rotationY: 1.1, fov: 34.2, dirtProgress: 0.6 },

  { sceneId: 'caminho', at: 0, position: [0.58, 0.06, -0.98], rotationY: 1.2, fov: 35.2, dirtProgress: 0.6 },
  { sceneId: 'caminho', at: 1, position: [0.42, 0.08, -0.68], rotationY: 1.44, fov: 32.6, dirtProgress: 0.8 },

  { sceneId: 'contato', at: 0, position: [1.0, 0.04, -0.9], rotationY: -0.76, fov: 34, dirtProgress: 0.8 },
  { sceneId: 'contato', at: 1, position: [1.1, 0.06, -0.5], rotationY: -0.6, fov: 31.4, dirtProgress: 1 },
]

export function getSceneKeyframes(sceneId: SceneId) {
  return cinematicKeyframes.filter((keyframe) => keyframe.sceneId === sceneId)
}
