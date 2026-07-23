export type CinematicState = {
  progress: number
  dirtAmount: number
  dustAmount: number
  dustToFoam: number
  foamCoverage: number
  cleaningMask: number
  wetness: number
  shineSweep: number
  applicationProgress: number
  peakDensity: number
  drainProgress: number
  rinseProgress: number
  wetnessProgress: number
  dryProgress: number
}

export type FoamTimelineState = Pick<CinematicState, 'applicationProgress' | 'peakDensity' | 'drainProgress' | 'rinseProgress' | 'wetnessProgress' | 'dryProgress'> & { time: number }
export type FoamTimelinePreset = 'restored' | 'extended' | 'extendedCatchUp'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

// Pure and reversible: ScrollTrigger can move in either direction without stale state.
export function calculateCinematicState(rawProgress: number, preset: FoamTimelinePreset = 'extendedCatchUp'): CinematicState {
  const progress = clamp(rawProgress)
  const applicationProgress = ease(progress, 0.18, 0.52)
  const peakDensity = ease(progress, 0.52, 0.62)
  const extended = preset === 'extended' || preset === 'extendedCatchUp'
  const drainProgress = ease(progress, extended ? 0.58 : 0.64, extended ? 0.94 : 0.90)
  const rinseProgress = ease(progress, extended ? 0.76 : 0.80, extended ? 0.975 : 0.96)
  const wetnessProgress = ease(progress, extended ? 0.84 : 0.82, extended ? 0.99 : 0.97)
  const dryProgress = ease(progress, 0.94, 1.00)
  const cleaningMask = rinseProgress
  return {
    progress,
    dirtAmount: 1 - cleaningMask,
    dustAmount: 1 - ease(progress, 0.18, 0.46),
    dustToFoam: ease(progress, 0.18, 0.38),
    foamCoverage: applicationProgress,
    cleaningMask,
    wetness: wetnessProgress * (1 - dryProgress),
    shineSweep: ease(progress, 0.94, 0.97) * (1 - ease(progress, 0.98, 1)),
    applicationProgress,
    peakDensity,
    drainProgress,
    rinseProgress,
    wetnessProgress,
    dryProgress,
  }
}
