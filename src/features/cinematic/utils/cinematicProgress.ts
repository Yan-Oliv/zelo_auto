export type CinematicState = {
  progress: number
  dirtAmount: number
  dustAmount: number
  dustToFoam: number
  foamCoverage: number
  cleaningMask: number
  wetness: number
  shineSweep: number
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

// Pure and reversible: ScrollTrigger can move in either direction without stale state.
export function calculateCinematicState(rawProgress: number): CinematicState {
  const progress = clamp(rawProgress)
  const cleaningMask = ease(progress, 0.65, 0.86)
  return {
    progress,
    dirtAmount: 1 - cleaningMask,
    dustAmount: 1 - ease(progress, 0.15, 0.38),
    dustToFoam: ease(progress, 0.15, 0.32),
    foamCoverage: ease(progress, 0.32, 0.62),
    cleaningMask,
    wetness: ease(progress, 0.84, 0.91) * (1 - ease(progress, 0.94, 1)),
    shineSweep: ease(progress, 0.94, 0.97) * (1 - ease(progress, 0.98, 1)),
  }
}
