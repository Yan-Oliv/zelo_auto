import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { dirtFragment, foamFlowFragment, foamFlowVertex, foamFragment, foamVertex, layerVertex, wetFilmFragment, wetFilmVertex } from '../shaders/surfaceLayers'
import { calculateCinematicState, type CinematicState, type FoamTimelinePreset } from '../utils/cinematicProgress'
import { getSceneKeyframes, type SceneId } from '../data/cinematicKeyframes'

const MODEL_URL = '/models/lincoln.glb'
const FOAM_MACRO_MODEL_URL = '/models/lincoln_foam_macro.glb'
// Kept deliberately visible in the diagnostic panel: it eliminates stale-preview
// and cached-bundle ambiguity when validating the real render loop.
const BUILD_ID = 'animation-production-playback-2026-07-23-01'
const BUILD_TIMESTAMP = '2026-07-23T09:56:00-03:00'
const JS_BUNDLE_HASH = import.meta.url.split('/').pop() ?? 'dev-module'
// GLB audit: these are the only materials admitted to the paint FoamShell.
// Everything else (Badges, Badges_IOR, Glass, Glass_IOR, Wheel) is excluded.
const FOAM_MATERIAL_WHITELIST = new Set(['Body', 'Paint'])
const GLASS_MATERIAL_WHITELIST = new Set(['Glass', 'Glass_IOR'])

type CarSceneProps = { reducedMotion: boolean; activeSection: string; activeSceneId: SceneId; sceneProgress: number; globalProgress: number; onReadyChange?: (ready: boolean) => void }

type AnimationDebugData = {
  frameCount: number; framesLastSecond: number; useFrameRunning: boolean; playbackTime: number; playbackDelta: number; shouldAnimate: boolean
  cinematicProgress: number; foamVisualProgress: number; foamCatchUpActive: boolean; drainProgressTarget: number; drainProgressVisual: number; rinseProgressTarget: number; rinseProgressVisual: number; forcePlayback: boolean; probeY: number; drop0State: string; drop0Elapsed: number; drop0Y: number
  drop0Visible: boolean; calculatedDropY: number; matrixDropY: number; dropMatrixUpdates: number; impactMatrixUpdates: number; rendererFrame: number
  singleDropCycle: number; singleDropState: string; singleDropY: number; playbackEpoch: number; performanceNow: number; componentMountId: string
  visibleFoamMaterialUUID: string; updatedFoamMaterialUUID: string; compiledFoamShaderExists: boolean; shaderMicroTime: number
  visibleFlowMaterialUUID: string; updatedFlowMaterialUUID: string; visibleDropMeshUUID: string; updatedDropMeshUUID: string
  visibleImpactMeshUUID: string; updatedImpactMeshUUID: string
  filmMeshUuid: string; compiledShaderIdentity: string; filmDiagnosticEnabled: boolean
}

const createAnimationDebugData = (): AnimationDebugData => ({
  frameCount: 0, framesLastSecond: 0, useFrameRunning: false, playbackTime: 0, playbackDelta: 0, shouldAnimate: false,
  cinematicProgress: 0, foamVisualProgress: 0, foamCatchUpActive: false, drainProgressTarget: 0, drainProgressVisual: 0, rinseProgressTarget: 0, rinseProgressVisual: 0, forcePlayback: false, probeY: 0, drop0State: 'idle', drop0Elapsed: 0, drop0Y: 0,
  drop0Visible: false, calculatedDropY: 0, matrixDropY: 0, dropMatrixUpdates: 0, impactMatrixUpdates: 0, rendererFrame: 0,
  singleDropCycle: 0, singleDropState: 'off', singleDropY: 0, playbackEpoch: 0, performanceNow: 0, componentMountId: '',
  visibleFoamMaterialUUID: '', updatedFoamMaterialUUID: '', compiledFoamShaderExists: false, shaderMicroTime: 0,
  visibleFlowMaterialUUID: '', updatedFlowMaterialUUID: '', visibleDropMeshUUID: '', updatedDropMeshUUID: '', visibleImpactMeshUUID: '', updatedImpactMeshUUID: '',
  filmMeshUuid: '', compiledShaderIdentity: '', filmDiagnosticEnabled: false,
})

export function CarScene({ reducedMotion, activeSection, activeSceneId, sceneProgress, globalProgress, onReadyChange }: CarSceneProps) {
  const lowQuality = activeSection !== 'hero'
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugCinematic') === '1'
  const debugCompare = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugFoamCompare') === '1'
  const queryCinematicProgress = typeof window === 'undefined' ? null : Number(new URLSearchParams(window.location.search).get('cinematicProgress'))
  const [debugProgress, setDebugProgress] = useState<number | null>(() => debug && Number.isFinite(queryCinematicProgress) ? THREE.MathUtils.clamp(queryCinematicProgress!, 0, 1) : null)
  const [debugFoamPreset, setDebugFoamPreset] = useState<FoamComparePreset>(() => typeof window === 'undefined' ? 'balanced' : readFoamPreset(new URLSearchParams(window.location.search).get('foamPreset')))
  const animationDebugRef = useRef<AnimationDebugData>(createAnimationDebugData())
  const [animationDebugSnapshot, setAnimationDebugSnapshot] = useState<AnimationDebugData>(() => createAnimationDebugData())
  const displayProgress = debugProgress ?? (activeSceneId === 'hero' ? sceneProgress : 1)
  const debugState = calculateCinematicState(displayProgress)
  useEffect(() => {
    if (!debug) return
    const expose = () => {
      const snapshot = { ...animationDebugRef.current }
      setAnimationDebugSnapshot(snapshot)
      ;(window as typeof window & { __ZELO_ANIMATION_DEBUG__?: object }).__ZELO_ANIMATION_DEBUG__ = {
        buildId: BUILD_ID,
        buildTimestamp: BUILD_TIMESTAMP,
        jsBundleHash: JS_BUNDLE_HASH,
        ...snapshot,
      }
    }
    expose()
    const timer = window.setInterval(expose, 250)
    return () => window.clearInterval(timer)
  }, [debug])
  return <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
    <Canvas id="zelo-hero-canvas" data-canvas-id="zelo-hero-production" frameloop={activeSceneId === 'hero' || debug ? 'always' : 'demand'} dpr={lowQuality || isMobile ? [0.7, 1] : [0.8, 1.35]} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }} onCreated={({ gl, scene, camera }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.18
      const rendererUuid = crypto.randomUUID()
      gl.domElement.id = 'zelo-hero-canvas'
      gl.domElement.dataset.canvasId = 'zelo-hero-production'
      gl.domElement.dataset.rendererUuid = rendererUuid
      ;(window as typeof window & { __ZELO_VISIBLE_RENDERER__?: object }).__ZELO_VISIBLE_RENDERER__ = { canvas: gl.domElement, renderer: gl, scene, camera, rendererUuid }
      window.setTimeout(() => {
        const canvases = [...document.querySelectorAll('canvas')]
        console.table(canvases.map((canvas, index) => { const rect = canvas.getBoundingClientRect(); const style = getComputedStyle(canvas); return { index, width: canvas.width, height: canvas.height, rectWidth: rect.width, rectHeight: rect.height, top: rect.top, left: rect.left, display: style.display, visibility: style.visibility, opacity: style.opacity, zIndex: style.zIndex, position: style.position, pointerEvents: style.pointerEvents, connected: canvas.isConnected, dataCanvasId: canvas.dataset.canvasId ?? '' } }))
        const x = window.innerWidth * .5; const y = window.innerHeight * .62
        console.log('[ZELO canvas audit] elementsFromPoint', document.elementsFromPoint(x, y).map((element) => ({ tag: element.tagName, className: element.className, id: element.id, canvasId: element instanceof HTMLCanvasElement ? element.dataset.canvasId : undefined })))
      }, 0)
    }}>
      <fog attach="fog" args={['#0D1B2A', 8.5, 21]} />
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0.35, 1.2, 5.8]} fov={34} />
        <ambientLight intensity={.82} color="#d9e4ef" />
        <directionalLight position={[4.6, 4.2, 4.2]} intensity={2.15} color="#f5f4ef" />
        <directionalLight position={[-5.4, 2.3, -4.8]} intensity={1.35} color="#D4AF37" />
        <Environment preset="night" resolution={64} />
        <CinematicRig activeSceneId={activeSceneId} sceneProgress={sceneProgress} globalProgress={globalProgress} reducedMotion={reducedMotion} onReadyChange={onReadyChange} progressOverride={debugProgress} animationDebug={animationDebugRef} />
      </Suspense>
    </Canvas>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,27,42,.58),rgba(13,27,42,.04)_64%),linear-gradient(180deg,transparent,rgba(13,27,42,.14))]" />
    {debug ? <aside className="pointer-events-auto fixed bottom-4 left-4 z-[100] w-[22rem] border border-fuchsia-300/50 bg-[#07111bEE] p-3 font-mono text-[11px] text-white"><div className="text-fuchsia-200">BUILD {BUILD_ID}</div><div className="mt-1 break-all text-[9px] text-white/50">{BUILD_TIMESTAMP} · {JS_BUNDLE_HASH}</div><label className="mt-3 block">Progress {displayProgress.toFixed(2)}<input className="mt-2 w-full" type="range" min="0" max="1" step="0.01" value={displayProgress} onChange={(event) => setDebugProgress(Number(event.target.value))}/></label><div className="mt-3 grid grid-cols-2 gap-1 text-white/70"><span>apply {debugState.applicationProgress.toFixed(2)}</span><span>peak {debugState.peakDensity.toFixed(2)}</span><span>drain {debugState.drainProgress.toFixed(2)}</span><span>rinse {debugState.rinseProgress.toFixed(2)}</span><span>wet {debugState.wetness.toFixed(2)}</span><span>dry {debugState.dryProgress.toFixed(2)}</span></div><div className="mt-3 border-t border-white/15 pt-2 text-cyan-100"><div>target {animationDebugSnapshot.cinematicProgress.toFixed(3)} · visual {animationDebugSnapshot.foamVisualProgress.toFixed(3)} · catch-up {String(animationDebugSnapshot.foamCatchUpActive)}</div><div>drain {animationDebugSnapshot.drainProgressTarget.toFixed(2)} → {animationDebugSnapshot.drainProgressVisual.toFixed(2)} · rinse {animationDebugSnapshot.rinseProgressTarget.toFixed(2)} → {animationDebugSnapshot.rinseProgressVisual.toFixed(2)}</div><div>playback {animationDebugSnapshot.playbackTime.toFixed(2)} · shader {animationDebugSnapshot.shaderMicroTime.toFixed(2)} · diagnostic {String(animationDebugSnapshot.filmDiagnosticEnabled)}</div><div>epoch {animationDebugSnapshot.playbackEpoch.toFixed(0)} · now {animationDebugSnapshot.performanceNow.toFixed(0)}</div><div>drop y {animationDebugSnapshot.calculatedDropY.toFixed(2)} / matrix {animationDebugSnapshot.matrixDropY.toFixed(2)}</div><div>mount {animationDebugSnapshot.componentMountId.slice(0,8)} · film {animationDebugSnapshot.filmMeshUuid.slice(0,8)} · material {animationDebugSnapshot.visibleFoamMaterialUUID.slice(0,8)}</div><div>compiled {animationDebugSnapshot.compiledShaderIdentity} · alive {String(animationDebugSnapshot.compiledFoamShaderExists)}</div><div>drop matrix updates {animationDebugSnapshot.dropMatrixUpdates} · impacts {animationDebugSnapshot.impactMatrixUpdates}</div></div></aside> : null}
    {debugCompare ? <FoamComparePanel preset={debugFoamPreset} onPreset={setDebugFoamPreset} /> : null}
  </div>
}

type FoamComparePreset = FoamPreset | 'hybrid'
type FlowPreset = 'legacy' | 'sparseSlow' | 'mediumSlow'
type FoamMotionPreset = 'subtle' | 'production' | 'strong'
const FOAM_MOTION_PRESETS: Record<FoamMotionPreset, { bubbleSpeed: number; bubbleActivity: number; bubbleHighlight: number }> = {
  subtle: { bubbleSpeed: .075, bubbleActivity: .34, bubbleHighlight: .44 },
  production: { bubbleSpeed: .12, bubbleActivity: .66, bubbleHighlight: .72 },
  strong: { bubbleSpeed: .18, bubbleActivity: 1, bubbleHighlight: .88 },
}
const FLOW_PRESETS: Record<FlowPreset, { coverage: number; width: number; speed: number; alpha: number; verticality: number; lowerAccumulation: number; broad: number; medium: number; fine: number }> = {
  legacy: { coverage: .58, width: .16, speed: .08, alpha: .58, verticality: 1, lowerAccumulation: .12, broad: .20, medium: .65, fine: .30 },
  sparseSlow: { coverage: .09, width: .055, speed: .0045, alpha: .40, verticality: 1, lowerAccumulation: .045, broad: .08, medium: .62, fine: .34 },
  mediumSlow: { coverage: .14, width: .075, speed: .0075, alpha: .46, verticality: 1, lowerAccumulation: .065, broad: .12, medium: .66, fine: .38 },
}
function readFoamMotionPreset(value: string | null | undefined): FoamMotionPreset { return value === 'subtle' || value === 'strong' ? value : 'production' }
function FoamComparePanel({ preset, onPreset }: { preset: FoamComparePreset; onPreset: (preset: FoamComparePreset) => void }) {
  useEffect(() => {
    const update = (event: Event) => onPreset((event as CustomEvent<FoamComparePreset>).detail)
    window.addEventListener('foam-preset', update)
    return () => window.removeEventListener('foam-preset', update)
  }, [onPreset])
  return <aside className="pointer-events-auto fixed bottom-4 right-4 z-[100] w-56 border border-white/20 bg-[#07111bdd] p-3 font-mono text-[11px] text-white"><div>Foam PBR compare</div><div className="mt-1 text-cyan-200">active: {preset}</div><div className="mt-2 text-white/60">1 balanced · 2 hybrid</div></aside>
}

function CinematicRig({ activeSceneId, sceneProgress, globalProgress: _globalProgress, reducedMotion, onReadyChange, progressOverride, animationDebug }: Omit<CarSceneProps, 'activeSection'> & { progressOverride: number | null; animationDebug: MutableRefObject<AnimationDebugData> }) {
  const gltf = useGLTF(MODEL_URL)
  // The URL is immutable during a normal visit. Keeping this object stable is
  // essential: a debug-panel repaint must never recreate production materials.
  const debugSearch = typeof window !== 'undefined' ? window.location.search : ''
  const debugParams = useMemo(() => new URLSearchParams(debugSearch), [debugSearch])
  const debugFoamShell = debugParams?.get('debugFoamShell') === '1'
  const debugFoamStatic = debugParams?.get('debugFoamStatic') === '1'
  const debugFoamPBR = debugParams?.get('debugFoamPBR') === '1'
  const debugFoamHybrid = debugParams?.get('debugFoamHybrid') === '1'
  const debugFoamContinuous = debugParams?.get('debugFoamContinuous') === '1'
  const debugFoamMacroAsset = debugParams?.get('debugFoamMacroAsset') === '1'
  const debugFoamCompare = debugParams?.get('debugFoamCompare') === '1'
  const foamPbrNeutralLight = debugParams?.get('foamPbrNeutralLight') === '1'
  const foamShellOnly = debugParams?.get('foamShellOnly') === '1'
  const requestedHybridLayer = debugParams?.get('foamLayer')
  const hybridLayer = requestedHybridLayer === 'base' || requestedHybridLayer === 'accumulation' || requestedHybridLayer === 'edge' ? requestedHybridLayer : 'all'
  const requestedGeometryPreset = debugParams?.get('foamGeometryPreset')
  const geometryPreset: FoamGeometryPreset = requestedGeometryPreset === 'soft' || requestedGeometryPreset === 'dramatic' ? requestedGeometryPreset : 'balanced'
  const requestedDebugView = debugParams?.get('foamDebugView')
  const hybridDebugView: FoamDebugView = requestedDebugView === 'wireframe' || requestedDebugView === 'normals' ? requestedDebugView : 'solid'
  const continuousDebugView: ContinuousDebugView = requestedDebugView === 'macroHeight' || requestedDebugView === 'macroStart' || requestedDebugView === 'macroDensity' || requestedDebugView === 'wireframe' ? requestedDebugView : 'solid'
  const requestedContinuousPreset = debugParams?.get('foamPreset')
  const continuousPreset: ContinuousPreset = requestedContinuousPreset === 'soft' || requestedContinuousPreset === 'dramatic' ? requestedContinuousPreset : 'balanced'
  const foamEdgeEnabled = debugParams?.get('foamEdge') !== '0'
  const foamView = debugParams?.get('foamView')
  const macroDebugMaterial = debugParams?.get('foamDebugMaterial') === 'white' ? 'white' : 'pink'
  const macroMorph = readFoamMacroMorph(debugParams?.get('foamMorph'))
  const macroLayer = readFoamMacroLayer(debugParams?.get('foamLayer'))
  const macroDebugView = readFoamMacroDebugView(debugParams?.get('foamDebugView'))
  const cinematicDebugView = readCinematicDebugView(debugParams?.get('foamDebugView'))
  const forcePlayback = debugParams?.get('forcePlayback') === '1'
  const requestedTimelinePreset = debugParams?.get('foamTimelinePreset')
  const foamTimelinePreset: FoamTimelinePreset = requestedTimelinePreset === 'restored' || requestedTimelinePreset === 'extended' ? requestedTimelinePreset : 'extendedCatchUp'
  const catchUpEnabled = foamTimelinePreset === 'extendedCatchUp'
  const foamCatchUpTime = THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamCatchUpTime', .55), .35, 1.20)
  const foamMaxForwardRate = THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamMaxForwardRate', .105), .07, .16)
  const foamMaxBackwardRate = THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamMaxBackwardRate', .16), .10, .25)
  const animationProbeEnabled = debugParams?.get('animationProbe') === '1'
  const singleDropProbe = debugParams?.get('singleDropProbe') === '1'
  const deterministicDrop = debugParams?.get('deterministicDrop') === '1'
  const requestedFlowPreset = debugParams?.get('flowPreset')
  const flowPreset: FlowPreset = requestedFlowPreset === 'legacy' || requestedFlowPreset === 'mediumSlow' ? requestedFlowPreset : 'sparseSlow'
  const cinematicLayer = debugParams?.get('foamLayer')
  const isolateFlow = debugParams?.get('debugCinematic') === '1' && cinematicLayer === 'flow'
  const isolateFilm = debugParams?.get('debugCinematic') === '1' && cinematicLayer === 'film'
  const isolateFilmFlow = debugParams?.get('debugCinematic') === '1' && cinematicLayer === 'film-flow'
  const isolateDrops = debugParams?.get('debugCinematic') === '1' && cinematicLayer === 'drops'
  const flowPresetValues = FLOW_PRESETS[flowPreset]
  const flowSettings = useMemo(() => ({
    coverage: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'flowCoverage', flowPresetValues.coverage), .04, .18),
    width: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'flowWidth', flowPresetValues.width), .025, .10),
    speed: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'flowSpeed', flowPresetValues.speed), .003, .009),
    alpha: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'flowAlpha', flowPresetValues.alpha), .2, .58),
    verticality: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'flowVerticality', 1), .3, 1),
    lowerAccumulation: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'lowerAccumulation', flowPresetValues.lowerAccumulation), .02, .16),
    broad: flowPresetValues.broad,
    medium: flowPresetValues.medium,
    fine: flowPresetValues.fine,
  }), [debugParams, flowPresetValues])
  const motionSettings = useMemo(() => ({
    carPosition: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'carPositionDamping', 8), 4, 14),
    carRotation: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'carRotationDamping', 7), 4, 14),
    camera: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'cameraDamping', 7), 4, 14),
  }), [debugParams])
  const macroEdgeEnabled = debugParams?.get('foamEdge') === '1'
  const testRigTransform = debugParams?.get('testRigTransform') === '1'
  const validationSettings = useMemo(() => ({
    shellOffset: readDebugNumber(debugParams, 'shellOffset', .003),
    polygonOffsetFactor: readDebugNumber(debugParams, 'polygonOffsetFactor', -1),
    polygonOffsetUnits: readDebugNumber(debugParams, 'polygonOffsetUnits', -1),
    depthTest: debugParams?.get('depthTest') !== '0',
    depthWrite: debugParams?.get('depthWrite') !== '0',
    side: debugParams?.get('side') === 'double' ? THREE.DoubleSide : THREE.FrontSide,
    renderOrder: readDebugNumber(debugParams, 'renderOrder', 20),
  }), [debugParams])
  const staticState: FoamStaticState = {
    coverage: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamCoverage', .7), 0, 1),
    density: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'density', .88), 0, 1),
    edgeSoftness: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'edgeSoftness', .82), .2, 2),
    breakupStrength: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'breakupStrength', .34), 0, 1),
  }
  const requestedPreset = readFoamPreset(debugParams?.get('foamPreset'))
  const [comparePreset, setComparePreset] = useState<FoamComparePreset | null>(null)
  const compareMode = comparePreset ?? 'balanced'
  const compareHybrid = debugFoamCompare && compareMode === 'hybrid'
  const foamPreset = debugFoamCompare ? (compareMode === 'hybrid' ? 'balanced' : compareMode) : requestedPreset
  const preset = FOAM_PBR_PRESETS[foamPreset]
  const pbrState: FoamPbrState = {
    ...staticState,
    density: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'density', preset.baseMass), 0, 1),
    baseMass: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamBaseMass', preset.baseMass), 0, 1),
    microStructure: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamMicroStructure', preset.microStructure), 0, 1),
    roughness: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamRoughness', preset.roughness), .4, .95),
    mediumNormalStrength: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamMediumNormal', preset.mediumNormalStrength), 0, .4),
    microNormalStrength: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamMicroNormal', preset.microNormalStrength), 0, .5),
    displacement: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamDisplacement', preset.displacement), 0, .004),
    wetness: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamWetness', preset.wetness), 0, 1),
    colorVariation: THREE.MathUtils.clamp(readDebugNumber(debugParams, 'foamColorVariation', preset.colorVariation), 0, 1),
  }
  const foamSourceParam = debugParams?.get('foamSource')
  const debugFoamSource: 'paint' | 'body' | 'all' = foamSourceParam === 'paint' || foamSourceParam === 'body' ? foamSourceParam : 'all'
  // Production uses the Paint primitive only. Debug retains all three source views.
  const foamSource: 'paint' | 'body' | 'all' = debugFoamShell ? debugFoamSource : 'paint'
  const [foamDensityMap, dirtMap, foamPackedMap, foamNormalMap] = useTexture(['/textures/cinematic/foam_density.png', '/textures/cinematic/dirt_distribution.png', '/textures/cinematic/foam_packed.webp', '/textures/cinematic/foam_normal.webp'])
  useMemo(() => [foamDensityMap, dirtMap, foamPackedMap, foamNormalMap].forEach((map) => { map.wrapS = THREE.RepeatWrapping; map.wrapT = THREE.RepeatWrapping; map.minFilter = THREE.LinearMipmapLinearFilter; map.magFilter = THREE.LinearFilter; map.generateMipmaps = true; map.colorSpace = THREE.NoColorSpace }), [dirtMap, foamDensityMap, foamNormalMap, foamPackedMap])
  const originalCar = useMemo(() => cloneOriginalCar(gltf.scene), [gltf.scene])
  const dirtLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'dirt', 'paint', dirtMap), [dirtMap, gltf.scene])
  const foamLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'foam', 'paint', foamDensityMap, debugFoamShell, foamSource, validationSettings, { packed: foamPackedMap, normal: foamNormalMap, debugParams }), [debugFoamShell, foamDensityMap, foamNormalMap, foamPackedMap, foamSource, gltf.scene, validationSettings])
  const foamFlowLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'flow', 'paint', foamDensityMap), [foamDensityMap, gltf.scene])
  const wetFilmLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'wet', 'paint', foamDensityMap), [foamDensityMap, gltf.scene])
  const staticFoamLayer = useMemo(() => makeStaticFoamLayer(gltf.scene, foamDensityMap, staticState), [foamDensityMap, gltf.scene, staticState])
  const continuousConfig = debugFoamContinuous ? CONTINUOUS_PRESETS[continuousPreset] : null
  const pbrFoamLayer = useMemo(() => makePbrFoamLayer(gltf.scene, foamPackedMap, foamNormalMap, pbrState, continuousConfig, continuousDebugView), [continuousConfig, continuousDebugView, foamNormalMap, foamPackedMap, gltf.scene, pbrState])
  const hybridLayers = useMemo(() => makeHybridFoamLayers(gltf.scene, foamPackedMap, foamNormalMap, typeof window !== 'undefined' && window.innerWidth < 768, geometryPreset, hybridDebugView), [foamNormalMap, foamPackedMap, geometryPreset, gltf.scene, hybridDebugView])
  const glassDirtLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'dirt', 'glass', dirtMap), [dirtMap, gltf.scene])
  const glassFoamLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'foam', 'glass', foamDensityMap), [foamDensityMap, gltf.scene])
  const group = useRef<THREE.Group>(null)
  const sweepLight = useRef<THREE.PointLight>(null)
  const time = useRef(0)
  // Deliberately independent from cinematicProgress: this is the real-time
  // playback clock for bubbles, flow, drops, impacts and wetness.
  const foamPlaybackTimeRef = useRef(0)
  const foamPlaybackEpochRef = useRef<number | null>(null)
  const mountIdRef = useRef(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cinematic-${Math.random().toString(36).slice(2)}`)
  const targetCarPositionRef = useRef(new THREE.Vector3())
  const targetCarQuaternionRef = useRef(new THREE.Quaternion())
  const targetCarScaleRef = useRef(new THREE.Vector3(1.62, 1.62, 1.62))
  const targetCameraPositionRef = useRef(new THREE.Vector3())
  const motionInitializedRef = useRef(false)
  const fpsWindowRef = useRef({ startedAt: 0, frames: 0 })
  const { camera, gl, invalidate, viewport } = useThree()
  const currentProgress = progressOverride ?? (activeSceneId === 'hero' ? sceneProgress : 1)
  const state = calculateCinematicState(currentProgress, foamTimelinePreset)
  const foamVisualProgressRef = useRef<number | null>(null)

  useEffect(() => { onReadyChange?.(true); return () => onReadyChange?.(false) }, [onReadyChange])
  useEffect(() => {
    if (!debugFoamCompare) return
    const choosePreset = (event: KeyboardEvent) => {
      const next = ({ '1': 'balanced', '2': 'hybrid' } as Record<string, FoamComparePreset | undefined>)[event.key]
      if (next) {
        setComparePreset(next)
        window.dispatchEvent(new CustomEvent<FoamComparePreset>('foam-preset', { detail: next }))
      }
    }
    window.addEventListener('keydown', choosePreset)
    return () => window.removeEventListener('keydown', choosePreset)
  }, [debugFoamCompare])
  useEffect(() => { invalidate() }, [invalidate, currentProgress, activeSceneId])
  useEffect(() => { [foamDensityMap, foamPackedMap, foamNormalMap].forEach((map) => { map.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4); map.needsUpdate = true }) }, [foamDensityMap, foamNormalMap, foamPackedMap, gl])

  useFrame((frameState, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30)
    const telemetry = animationDebug.current
    telemetry.frameCount += 1
    telemetry.useFrameRunning = true
    telemetry.playbackDelta = delta
    telemetry.rendererFrame = frameState.gl.info.render.frame
    // This is the authoritative micro-animation clock. It deliberately has no
    // dependency on scroll, R3F's scene clock, visibility gates or macro phase.
    const now = performance.now()
    if (foamPlaybackEpochRef.current === null) foamPlaybackEpochRef.current = now
    foamPlaybackTimeRef.current = Math.max(0, (now - foamPlaybackEpochRef.current) / 1000)
    telemetry.playbackTime = foamPlaybackTimeRef.current
    telemetry.playbackEpoch = foamPlaybackEpochRef.current
    telemetry.performanceNow = now
    telemetry.componentMountId = mountIdRef.current
    if (fpsWindowRef.current.startedAt === 0) fpsWindowRef.current.startedAt = now
    fpsWindowRef.current.frames += 1
    if (now - fpsWindowRef.current.startedAt >= 1000) {
      telemetry.framesLastSecond = fpsWindowRef.current.frames
      fpsWindowRef.current.frames = 0
      fpsWindowRef.current.startedAt = now
    }
    if (debugFoamStatic || debugFoamPBR || debugFoamHybrid || debugFoamContinuous || debugFoamCompare || debugFoamMacroAsset) {
      // This mode deliberately ignores scroll-driven scene state: it is one static frame.
      if (group.current) {
        group.current.position.set(foamView === 'rear' ? .2 : 1.12, .02, -.1)
        group.current.scale.setScalar(viewport.width < 9 ? 1.12 : 1.62)
        group.current.rotation.y = foamView === 'front' ? 0 : foamView === 'rear' ? Math.PI : -.62
        if (debugFoamMacroAsset && testRigTransform) {
          // Technical-only proof that every foam layer inherits the same ModelAnchor transform.
          group.current.position.add(new THREE.Vector3(.18, .06, -.12))
          group.current.rotation.y += .14
          group.current.scale.multiplyScalar(1.07)
        }
      }
      const perspective = camera as THREE.PerspectiveCamera
      perspective.position.z = 6.3
      perspective.fov = 34
      perspective.updateProjectionMatrix()
      foamLayer.visible = false
      foamFlowLayer.visible = false
      wetFilmLayer.visible = false
      dirtLayer.visible = false
      glassDirtLayer.visible = false
      glassFoamLayer.visible = false
      staticFoamLayer.visible = debugFoamStatic
      pbrFoamLayer.visible = debugFoamMacroAsset
        ? (macroLayer === 'film' || macroLayer === 'film-macro' || macroLayer === 'all')
        : (debugFoamPBR || debugFoamHybrid || debugFoamContinuous || debugFoamCompare) && hybridLayer !== 'accumulation' && hybridLayer !== 'edge'
      updateHybridFoamLayers(
        hybridLayers,
        staticState.coverage,
        debugFoamMacroAsset ? macroLayer === 'edge' && macroEdgeEnabled : debugFoamHybrid || compareHybrid || (debugFoamContinuous && foamEdgeEnabled),
        debugFoamMacroAsset ? 'edge' : debugFoamContinuous ? 'edge' : hybridLayer,
      )
      return
    }
    const effectiveProgress = progressOverride ?? (activeSceneId === 'hero' ? sceneProgress : 1)
    const state = calculateCinematicState(effectiveProgress, foamTimelinePreset)
    if (foamVisualProgressRef.current === null) foamVisualProgressRef.current = effectiveProgress
    const previousVisualProgress = foamVisualProgressRef.current
    const shouldCatchUp = catchUpEnabled && (effectiveProgress >= .60 || previousVisualProgress >= .60)
    if (shouldCatchUp) {
      const difference = effectiveProgress - previousVisualProgress
      const dampingAlpha = 1 - Math.exp(-delta / foamCatchUpTime)
      const dampedStep = difference * dampingAlpha
      const maxForwardStep = foamMaxForwardRate * delta
      const maxBackwardStep = foamMaxBackwardRate * delta
      foamVisualProgressRef.current = THREE.MathUtils.clamp(
        previousVisualProgress + THREE.MathUtils.clamp(dampedStep, -maxBackwardStep, maxForwardStep),
        Math.min(previousVisualProgress, effectiveProgress),
        Math.max(previousVisualProgress, effectiveProgress),
      )
    } else {
      foamVisualProgressRef.current = effectiveProgress
    }
    const foamVisualProgress = foamVisualProgressRef.current
    const visualMacroState = calculateCinematicState(foamVisualProgress, foamTimelinePreset)
    // Application remains scroll-immediate; only removal, residue and wetness
    // consume the protected visual progress during a fast jump.
    const foamState: CinematicState = {
      ...state,
      progress: foamVisualProgress,
      drainProgress: visualMacroState.drainProgress,
      rinseProgress: visualMacroState.rinseProgress,
      wetnessProgress: visualMacroState.wetnessProgress,
      dryProgress: visualMacroState.dryProgress,
      cleaningMask: visualMacroState.cleaningMask,
      dirtAmount: visualMacroState.dirtAmount,
      wetness: visualMacroState.wetness,
    }
    // Macro progress is scroll-owned. This playback clock is never derived from
    // scroll position and remains alive while that macro state is frozen.
    const sceneVisible = typeof document === 'undefined' || document.visibilityState === 'visible'
    const productionAnimationActive = sceneVisible && activeSceneId === 'hero' && effectiveProgress > .18 && effectiveProgress < .98
    const shouldAnimate = !reducedMotion && (productionAnimationActive || animationProbeEnabled)
    telemetry.shouldAnimate = productionAnimationActive
    telemetry.cinematicProgress = effectiveProgress
    telemetry.foamVisualProgress = foamVisualProgress
    telemetry.foamCatchUpActive = Math.abs(effectiveProgress - foamVisualProgress) > .0005
    telemetry.drainProgressTarget = state.drainProgress
    telemetry.drainProgressVisual = foamState.drainProgress
    telemetry.rinseProgressTarget = state.rinseProgress
    telemetry.rinseProgressVisual = foamState.rinseProgress
    telemetry.forcePlayback = forcePlayback
    if (shouldAnimate) time.current += delta
    // All visible production materials receive the same scroll-independent
    // clock. They are not laboratory clones or debug-only uniform objects.
    updateLayer(dirtLayer, foamState, time.current, 'final', undefined, foamPlaybackTimeRef.current, true)
    updateLayer(foamLayer, foamState, foamPlaybackTimeRef.current, cinematicDebugView, undefined, foamPlaybackTimeRef.current, true)
    updateLayer(foamFlowLayer, foamState, foamPlaybackTimeRef.current, cinematicDebugView, flowSettings, foamPlaybackTimeRef.current, true)
    updateLayer(wetFilmLayer, foamState, foamPlaybackTimeRef.current, 'final', undefined, foamPlaybackTimeRef.current, true)
    updateLayer(glassDirtLayer, state, time.current)
    const foamMaterial = foamLayer.userData.material as THREE.ShaderMaterial
    const flowMaterial = foamFlowLayer.userData.material as THREE.ShaderMaterial
    telemetry.visibleFoamMaterialUUID = foamMaterial?.uuid ?? ''
    telemetry.updatedFoamMaterialUUID = foamMaterial?.uuid ?? ''
    telemetry.compiledFoamShaderExists = Boolean(foamMaterial?.uniforms?.uFoamMicroTime)
    telemetry.shaderMicroTime = Number(foamMaterial?.uniforms?.uFoamMicroTime?.value ?? 0)
    let filmMeshUuid = ''
    foamLayer.traverse((node) => {
      if (!filmMeshUuid && node instanceof THREE.Mesh) filmMeshUuid = node.uuid
    })
    telemetry.filmMeshUuid = filmMeshUuid
    telemetry.filmDiagnosticEnabled = Number(foamMaterial?.uniforms?.uFilmDiagnostic?.value ?? 0) > .5
    telemetry.compiledShaderIdentity = String((foamMaterial as unknown as { program?: { id?: number } })?.program?.id ?? 'ShaderMaterial')
    if (typeof window !== 'undefined') {
      ;(window as typeof window & { __ZELO_FILM_SHADER__?: Record<string, unknown> }).__ZELO_FILM_SHADER__ = {
        filmMeshUuid,
        filmMaterialUuid: foamMaterial?.uuid,
        compiledShaderIdentity: telemetry.compiledShaderIdentity,
        uFoamMicroTimeJS: foamLayer.userData.uniforms?.uFoamMicroTime?.value,
        uFoamMicroTimeShader: foamMaterial?.uniforms?.uFoamMicroTime?.value,
        diagnostic: foamMaterial?.uniforms?.uFilmDiagnostic?.value,
      }
    }
    telemetry.visibleFlowMaterialUUID = flowMaterial?.uuid ?? ''
    telemetry.updatedFlowMaterialUUID = flowMaterial?.uuid ?? ''
    // The shader owns regional removal. Do not hard-hide foam while its final
    // residue band is still meant to be visible.
    foamLayer.visible = !isolateFlow && !isolateDrops && (debugFoamShell || foamState.foamCoverage > .005 && foamVisualProgress < .999)
    foamFlowLayer.visible = !debugFoamShell && !isolateFilm && !isolateDrops && foamState.drainProgress > .01 && foamVisualProgress < .999
    if (isolateFilmFlow) { foamLayer.visible = true; foamFlowLayer.visible = true }
    wetFilmLayer.visible = !debugFoamShell && !isolateFlow && !isolateFilm && !isolateFilmFlow && !isolateDrops && foamState.wetness > .012
    dirtLayer.visible = !debugFoamShell && !isolateFlow && !isolateFilm && !isolateFilmFlow && !isolateDrops && foamState.dirtAmount > .005
    glassDirtLayer.visible = !debugFoamShell && !isolateFlow && !isolateFilm && !isolateFilmFlow && !isolateDrops && foamState.dirtAmount > .005
    // Production FoamFilmShell is intentionally Paint-only. Keep the original
    // glass readable throughout the sequence; a separate glass foam pass is
    // reserved for a future, independently approved treatment.
    glassFoamLayer.visible = false
    staticFoamLayer.visible = false
    pbrFoamLayer.visible = false
    updateHybridFoamLayers(hybridLayers, 0, false, 'all')
    const keys = getSceneKeyframes(activeSceneId); const from = keys[0]; const to = keys[1]
    if (from && to && group.current) {
      const t = effectiveProgress; const compact = viewport.width < 9
      const carShift = interpolate(t, [[0,-.34],[.25,-.08],[.55,.12],[.8,.03],[1,0]])
      const carYaw = interpolate(t, [[0,-.1],[.3,.05],[.6,-.06],[1,.02]])
      const targetYaw = THREE.MathUtils.lerp(from.rotationY, to.rotationY, t) + carYaw
      targetCarPositionRef.current.set(THREE.MathUtils.lerp(from.position[0],to.position[0],t)+carShift+(compact?-.58:0), THREE.MathUtils.lerp(from.position[1],to.position[1],t), THREE.MathUtils.lerp(from.position[2],to.position[2],t))
      targetCarQuaternionRef.current.setFromEuler(new THREE.Euler(0, targetYaw, 0))
      targetCarScaleRef.current.setScalar(compact ? 1.12 : 1.62)
      const perspective = camera as THREE.PerspectiveCamera
      targetCameraPositionRef.current.copy(perspective.position).setZ(interpolate(t, [[0,6.3],[.3,5.9],[.65,6.15],[1,6.7]]))
      const positionAlpha = 1 - Math.exp(-motionSettings.carPosition * delta)
      const rotationAlpha = 1 - Math.exp(-motionSettings.carRotation * delta)
      const cameraAlpha = 1 - Math.exp(-motionSettings.camera * delta)
      if (!motionInitializedRef.current) {
        group.current.position.copy(targetCarPositionRef.current)
        group.current.quaternion.copy(targetCarQuaternionRef.current)
        group.current.scale.copy(targetCarScaleRef.current)
        perspective.position.copy(targetCameraPositionRef.current)
        motionInitializedRef.current = true
      } else {
        group.current.position.lerp(targetCarPositionRef.current, positionAlpha)
        group.current.quaternion.slerp(targetCarQuaternionRef.current, rotationAlpha)
        group.current.scale.lerp(targetCarScaleRef.current, positionAlpha)
        perspective.position.lerp(targetCameraPositionRef.current, cameraAlpha)
      }
      perspective.fov = THREE.MathUtils.lerp(perspective.fov, THREE.MathUtils.lerp(from.fov,to.fov,t), cameraAlpha)
      perspective.updateProjectionMatrix()
    }
    if (sweepLight.current) { sweepLight.current.intensity = state.shineSweep * 7; sweepLight.current.position.x = THREE.MathUtils.lerp(-3,3,state.progress) }
    if (shouldAnimate) invalidate()
  })

  const showOriginalMacroCar = macroLayer === 'car' || macroLayer === 'film' || macroLayer === 'film-macro' || macroLayer === 'all' || macroLayer === 'edge'
  const showMacroAsset = macroLayer === 'macro' || macroLayer === 'film-macro' || macroLayer === 'all'
  return <group ref={group} position={[1.12,.02,-.1]} rotation={[0,-.62,0]} scale={2.04}>
    <CarContactShadow visible={!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset} />
    <primitive object={originalCar} visible={debugFoamMacroAsset ? showOriginalMacroCar : !foamShellOnly} />
    <primitive object={dirtLayer} />
    <primitive object={foamLayer} />
    <primitive object={foamFlowLayer} />
    <primitive object={wetFilmLayer} />
    <primitive object={staticFoamLayer} />
    <primitive object={pbrFoamLayer} />
    <primitive object={hybridLayers.root} />
    {debugFoamMacroAsset ? <FoamMacroAsset
      material={macroDebugMaterial}
      morph={macroMorph}
      debugView={macroDebugView}
      visible={showMacroAsset}
    /> : null}
    <primitive object={glassDirtLayer} />
    <primitive object={glassFoamLayer} />
    {!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset && !isolateFlow && !isolateDrops ? <FoamDrips state={state} time={time} /> : null}
    {!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset ? <FoamDropLayer state={state} microTime={foamPlaybackTimeRef} debug={animationDebug} singleProbe={singleDropProbe} deterministic={deterministicDrop} /> : null}
    {!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset ? <FoamImpactLayer state={state} microTime={foamPlaybackTimeRef} debug={animationDebug} /> : null}
    {!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset ? <DustParticles state={state} time={time} reducedMotion={reducedMotion} /> : null}
    {debugFoamShell ? <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffffff" /> : null}
    {(debugFoamPBR || debugFoamHybrid || debugFoamCompare) && foamPbrNeutralLight ? <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffffff" /> : null}
    <pointLight position={[0,1.05,.4]} color="#7f98aa" distance={2.8} intensity={.45} />
    <pointLight ref={sweepLight} position={[-3,1.4,1.4]} color="#f6df9b" distance={6} intensity={0} />
    {animationProbeEnabled ? <AnimationProbe debug={animationDebug} /> : null}
  </group>
}

function AnimationProbe({ debug }: { debug: MutableRefObject<AnimationDebugData> }) {
  const probe = useRef<THREE.Mesh>(null)
  useFrame((frameState) => {
    if (!probe.current) return
    const realTime = frameState.clock.getElapsedTime()
    const y = .42 + Math.sin(realTime * 2) * .35
    probe.current.position.y = y
    probe.current.rotation.y = realTime * 1.7
    debug.current.probeY = y
  })
  return <mesh ref={probe} position={[1.45,.42,.7]} renderOrder={100}><sphereGeometry args={[.18, 16, 16]} /><meshBasicMaterial color="#ff00ff" depthTest={false} /></mesh>
}

function CarContactShadow({ visible }: { visible: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128
    const context = canvas.getContext('2d')!; const gradient = context.createRadialGradient(128, 64, 4, 128, 64, 118)
    gradient.addColorStop(0, 'rgba(1,8,13,.62)'); gradient.addColorStop(.46, 'rgba(1,8,13,.28)'); gradient.addColorStop(1, 'rgba(1,8,13,0)')
    context.fillStyle = gradient; context.fillRect(0, 0, 256, 128)
    const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace; result.needsUpdate = true
    return result
  }, [])
  return <group visible={visible} position={[0,-.79,.02]} rotation={[-Math.PI / 2,0,0]}>
    <mesh scale={[2.05,.72,1]} renderOrder={-1}><planeGeometry args={[2,2]} /><meshBasicMaterial map={texture} transparent opacity={.34} depthWrite={false} color="#06101a" /></mesh>
    <mesh position={[.12,.006,0]} scale={[1.36,.22,1]} renderOrder={-1}><planeGeometry args={[2,2]} /><meshBasicMaterial map={texture} transparent opacity={.18} depthWrite={false} color="#02080d" /></mesh>
  </group>
}

type FoamMacroMorph = 'base' | 'thin' | 'full' | 'drained'
type FoamMacroLayer = 'car' | 'film' | 'macro' | 'edge' | 'film-macro' | 'all'
type FoamMacroDebugView = 'solid' | 'wireframe' | 'normals' | 'application' | 'density' | 'drainage' | 'wetness' | 'uv' | 'tangents'

function readFoamMacroMorph(value: string | null | undefined): FoamMacroMorph {
  return value === 'thin' || value === 'full' || value === 'drained' ? value : 'base'
}

function readFoamMacroLayer(value: string | null | undefined): FoamMacroLayer {
  return value === 'car' || value === 'film' || value === 'macro' || value === 'edge' || value === 'film-macro' ? value : 'all'
}

function readFoamMacroDebugView(value: string | null | undefined): FoamMacroDebugView {
  return value === 'wireframe' || value === 'normals' || value === 'application' || value === 'density' || value === 'drainage' || value === 'wetness' || value === 'uv' || value === 'tangents' ? value : 'solid'
}

function setFoamMacroMorph(mesh: THREE.Mesh, state: FoamMacroMorph) {
  const influences = mesh.morphTargetInfluences
  const dictionary = mesh.morphTargetDictionary
  if (!influences || !dictionary) throw new Error('[FoamMacro] Morph targets indisponíveis.')
  influences.fill(0)
  if (state === 'base') return
  const targetName = { thin: 'FoamThin', full: 'FoamFull', drained: 'FoamDrained' }[state]
  const index = dictionary[targetName]
  if (index === undefined) throw new Error(`[FoamMacro] Morph ${targetName} não encontrado. Dicionário: ${Object.keys(dictionary).join(', ')}`)
  influences[index] = 1
}

function makeMacroDebugMaterial(view: FoamMacroDebugView, material: 'pink' | 'white') {
  if (view === 'wireframe') return new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, side: THREE.DoubleSide, depthTest: true, depthWrite: true })
  if (view === 'normals') return new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
  if (view === 'solid') return material === 'white'
    ? new THREE.MeshStandardMaterial({ color: 0xf5f8fa, metalness: 0, roughness: .84, transparent: false, depthTest: true, depthWrite: true, side: THREE.FrontSide })
    : new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: false, opacity: 1, depthTest: true, depthWrite: true, side: THREE.DoubleSide })
  const channel = ({ application: 0, density: 1, drainage: 2, wetness: 3 } as Partial<Record<FoamMacroDebugView, number>>)[view]
  if (channel !== undefined) return new THREE.ShaderMaterial({
    vertexShader: 'attribute vec4 color; varying vec4 vColor; void main(){ vColor=color; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec4 vColor; void main(){ float value=vColor[${channel}]; gl_FragColor=vec4(vec3(value),1.0); }`,
    side: THREE.DoubleSide, depthTest: true, depthWrite: true,
  })
  if (view === 'uv') return new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'varying vec2 vUv; void main(){gl_FragColor=vec4(vUv,0.0,1.0);}', side: THREE.DoubleSide })
  return new THREE.ShaderMaterial({ vertexShader: 'attribute vec4 tangent; varying vec3 vTangent; void main(){vTangent=normalize(mat3(modelMatrix)*tangent.xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'varying vec3 vTangent; void main(){gl_FragColor=vec4(vTangent*.5+.5,1.0);}', side: THREE.DoubleSide })
}

function auditFoamMacroMesh(mesh: THREE.Mesh) {
  const geometry = mesh.geometry
  const position = geometry.getAttribute('position')
  const index = geometry.index
  const color = geometry.getAttribute('color')
  const conservativeBounds = new THREE.Box3()
  if (position) {
    const vertex = new THREE.Vector3()
    const addPositions = (target?: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
      for (let index = 0; index < position.count; index += 1) {
        vertex.set(position.getX(index), position.getY(index), position.getZ(index))
        if (target) {
          if (geometry.morphTargetsRelative) vertex.add(new THREE.Vector3(target.getX(index), target.getY(index), target.getZ(index)))
          else vertex.set(target.getX(index), target.getY(index), target.getZ(index))
        }
        conservativeBounds.expandByPoint(vertex)
      }
    }
    addPositions()
    geometry.morphAttributes.position?.forEach((target) => addPositions(target))
    geometry.boundingBox = conservativeBounds
    geometry.boundingSphere = conservativeBounds.getBoundingSphere(new THREE.Sphere())
  }
  const morphTargetStats = Object.entries(mesh.morphTargetDictionary ?? {}).map(([name, targetIndex]) => {
    const target = geometry.morphAttributes.position?.[targetIndex]
    if (!target || !position) return { name, targetIndex, min: 0, average: 0, max: 0, affectedVertices: 0 }
    let min = Number.POSITIVE_INFINITY; let max = 0; let sum = 0; let affectedVertices = 0
    for (let index = 0; index < position.count; index += 1) {
      const dx = geometry.morphTargetsRelative ? target.getX(index) : target.getX(index) - position.getX(index)
      const dy = geometry.morphTargetsRelative ? target.getY(index) : target.getY(index) - position.getY(index)
      const dz = geometry.morphTargetsRelative ? target.getZ(index) : target.getZ(index) - position.getZ(index)
      const distance = Math.hypot(dx, dy, dz)
      min = Math.min(min, distance); max = Math.max(max, distance); sum += distance
      if (distance > .000001) affectedVertices += 1
    }
    return { name, targetIndex, min: Number.isFinite(min) ? min : 0, average: sum / position.count, max, affectedVertices }
  })
  const audit = {
    mesh: mesh.name, geometry: geometry.type, vertices: position?.count ?? 0,
    indices: index?.count ?? 0, triangles: (index?.count ?? position?.count ?? 0) / 3,
    attributes: Object.keys(geometry.attributes), colorItemSize: color?.itemSize ?? 0,
    morphTargetsRelative: geometry.morphTargetsRelative,
    morphNormalTargets: geometry.morphAttributes.normal?.length ?? 0,
    morphTargetDictionary: mesh.morphTargetDictionary ?? {},
    morphTargetInfluences: mesh.morphTargetInfluences ? [...mesh.morphTargetInfluences] : [],
    morphTargetStats,
    boundingBox: geometry.boundingBox ? { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() } : null,
    boundingSphere: geometry.boundingSphere ? { center: geometry.boundingSphere.center.toArray(), radius: geometry.boundingSphere.radius } : null,
    position: mesh.position.toArray(), rotation: mesh.rotation.toArray(), scale: mesh.scale.toArray(),
  }
  console.info('[FoamMacro] runtime audit', audit)
  ;(window as Window & { __foamMacroAudit?: unknown }).__foamMacroAudit = audit
  return audit
}

function FoamMacroAsset({ material, morph, debugView, visible }: { material: 'pink' | 'white'; morph: FoamMacroMorph; debugView: FoamMacroDebugView; visible: boolean }) {
  const macroGltf = useGLTF(FOAM_MACRO_MODEL_URL)
  const asset = useMemo(() => {
    const clone = macroGltf.scene.clone(true)
    const root = clone.getObjectByName('FoamMacroRoot')
    if (!root) throw new Error('[FoamMacro] FoamMacroRoot não encontrado.')
    const macroMesh = root.getObjectByName('FoamMacroMesh')
    if (!(macroMesh instanceof THREE.Mesh)) throw new Error('[FoamMacro] FoamMacroMesh não encontrada ou não é uma Mesh.')
    const geometry = macroMesh.geometry
    for (const name of ['position', 'normal', 'tangent', 'uv', 'color']) if (!geometry.getAttribute(name)) throw new Error(`[FoamMacro] Atributo obrigatório ausente: ${name}.`)
    if (geometry.getAttribute('color').itemSize !== 4) throw new Error(`[FoamMacro] COLOR_0 inválido: itemSize ${geometry.getAttribute('color').itemSize}; esperado 4.`)
    if (!geometry.morphAttributes.position?.length) throw new Error('[FoamMacro] morphAttributes.position ausente.')
    setFoamMacroMorph(macroMesh, morph)
    macroMesh.material = makeMacroDebugMaterial(debugView, material)
    macroMesh.renderOrder = 21
    const audit = auditFoamMacroMesh(macroMesh)
    console.info('[FoamMacro] root transform', { position: root.position.toArray(), rotation: root.rotation.toArray(), scale: root.scale.toArray() })
    root.userData.runtimeAudit = audit
    return clone
  }, [debugView, macroGltf.scene, material, morph])
  return <primitive object={asset} visible={visible} />
}

// The clean car is a private clone of the GLB. Its material clones are never modified afterwards.
function cloneOriginalCar(source: THREE.Group) {
  const car = source.clone(true)
  car.traverse((node) => { if (node instanceof THREE.Mesh) node.material = Array.isArray(node.material) ? node.material.map((entry) => entry.clone()) : node.material.clone() })
  return car
}

type FoamValidationSettings = { shellOffset: number; polygonOffsetFactor: number; polygonOffsetUnits: number; depthTest: boolean; depthWrite: boolean; side: THREE.Side; renderOrder: number }
interface FoamStaticState { coverage: number; density: number; edgeSoftness: number; breakupStrength: number }
type FoamPreset = 'current' | 'creamy' | 'balanced' | 'wet'
interface FoamPbrState extends FoamStaticState {
  baseMass: number; microStructure: number; roughness: number
  mediumNormalStrength: number; microNormalStrength: number
  displacement: number; wetness: number; colorVariation: number
}
type ContinuousPreset = 'soft' | 'balanced' | 'dramatic'
type ContinuousDebugView = 'solid' | 'macroHeight' | 'macroStart' | 'macroDensity' | 'wireframe'
type ContinuousMacroConfig = { strength: number; clamp: number; activationWidth: number }
const CONTINUOUS_PRESETS: Record<ContinuousPreset, ContinuousMacroConfig> = {
  soft: { strength: .55, clamp: .007, activationWidth: .18 },
  balanced: { strength: .82, clamp: .011, activationWidth: .15 },
  dramatic: { strength: 1.08, clamp: .015, activationWidth: .12 },
}

// Static-only material studies. The presets change shading composition, never
// geometry, coverage mechanics, opacity, camera or timeline state.
const FOAM_PBR_PRESETS: Record<FoamPreset, Omit<FoamPbrState, keyof FoamStaticState>> = {
  current: { baseMass: .88, microStructure: .62, roughness: .82, mediumNormalStrength: .087, microNormalStrength: .20, displacement: .0014, wetness: .28, colorVariation: .22 },
  creamy: { baseMass: .95, microStructure: .42, roughness: .89, mediumNormalStrength: .09, microNormalStrength: .18, displacement: .0012, wetness: .16, colorVariation: .16 },
  balanced: { baseMass: .91, microStructure: .64, roughness: .84, mediumNormalStrength: .14, microNormalStrength: .27, displacement: .0012, wetness: .31, colorVariation: .28 },
  wet: { baseMass: .82, microStructure: .56, roughness: .75, mediumNormalStrength: .11, microNormalStrength: .23, displacement: .0008, wetness: .52, colorVariation: .38 },
}

function readFoamPreset(value: string | null | undefined): FoamPreset {
  return value === 'creamy' || value === 'balanced' || value === 'wet' || value === 'current' ? value : 'balanced'
}

type SurfaceLayerKind = 'dirt' | 'foam' | 'flow' | 'wet'
type CinematicDebugView = 'final' | 'presence' | 'gravity' | 'streaks' | 'rinse' | 'rinseEdge' | 'wetness'

function readCinematicDebugView(value: string | null | undefined): CinematicDebugView {
  return value === 'presence' || value === 'gravity' || value === 'streaks' || value === 'rinse' || value === 'rinseEdge' || value === 'wetness' ? value : 'final'
}

function makeSurfaceLayer(source: THREE.Group, kind: SurfaceLayerKind, target: 'paint' | 'glass', map: THREE.Texture, debugSolid = false, foamSource: 'paint' | 'body' | 'all' = 'all', validation?: FoamValidationSettings, pbr?: { packed: THREE.Texture; normal: THREE.Texture; debugParams: URLSearchParams | null }) {
  const root = new THREE.Group()
  const motion = FOAM_MOTION_PRESETS[readFoamMotionPreset(pbr?.debugParams?.get('foamMotionPreset'))]
  const uniforms = kind === 'dirt'
    ? { uDirtAmount: { value: 1 }, uCleaningMask: { value: 0 }, uTime: { value: 0 }, uLayerOpacity: { value: target === 'glass' ? .42 : 1 }, uDirtMap: { value: map } }
    : kind === 'foam'
      ? {
          uCoverage: { value: 0 }, uCleaningMask: { value: 0 }, uTime: { value: 0 }, uFoamMicroTime: { value: 0 }, uFoamLife: { value: 1 },
          uFilmDiagnostic: { value: pbr?.debugParams?.get('filmShaderPulse') === '1' ? 1 : 0 }, uFilmVertexDiagnostic: { value: pbr?.debugParams?.get('filmVertexPulse') === '1' ? 1 : 0 },
          uBubbleSpeed: { value: motion.bubbleSpeed }, uBubbleActivity: { value: motion.bubbleActivity }, uPeakDensity: { value: 0 }, uDrainProgress: { value: 0 }, uRinseProgress: { value: 0 }, uWetnessProgress: { value: 0 }, uDebugView: { value: 0 },
          uBubbleStrength: { value: .48 }, uMicroBubbleStrength: { value: .14 }, uLayerOpacity: { value: target === 'glass' ? .35 : 1 },
          uFoamDensityMap: { value: map }, uFoamPackedMap: { value: pbr?.packed ?? map }, uFoamNormalMap: { value: pbr?.normal ?? map },
          uMediumNormalStrength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'mediumNormalStrength', .30), 0, .4) },
          uMicroNormalStrength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'microNormalStrength', .16), 0, .16) },
          uPeakDisplacement: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'peakDisplacement', .0016), 0, .0016) },
          uDenseRoughness: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'denseRoughness', .74), .5, .95) },
          uWetRoughness: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'wetRoughness', .24), .1, .7) },
          uBubbleHighlightStrength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'bubbleHighlightStrength', motion.bubbleHighlight), .05, .9) },
          uPaintGapStrength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'paintGapStrength', .07), 0, .08) },
          uDrainEdgeSoftness: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'drainEdgeSoftness', .045), .015, .13) },
          uDrainDistortion: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'drainDistortion', .58), .1, 1) },
          uStreakLength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'streakLength', 1.25), .9, 1.55) },
          uStreakWidth: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'streakWidth', .135), .04, .32) },
          uStreakSpeed: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'streakSpeed', .0075), .0035, .014) },
          uResidueStrength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'residueStrength', .34), .1, .9) },
          uRegionalDrainDelay: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'regionalDrainDelay', .18), 0, .30) },
          uRegionalDrainVariation: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'regionalDrainVariation', .20), 0, .35) },
          uDrainCurveExponent: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'drainCurveExponent', 1.65), 1, 2.5) },
          uResidualFoamStrength: { value: THREE.MathUtils.clamp(readDebugNumber(pbr?.debugParams ?? null, 'residualFoamStrength', .34), .1, .6) },
        }
      : kind === 'flow'
        ? { uDrainProgress: { value: 0 }, uRinseProgress: { value: 0 }, uTime: { value: 0 }, uDebugView: { value: 0 }, uFlowCoverage: { value: .09 }, uFlowWidth: { value: .055 }, uFlowSpeed: { value: .008 }, uFlowAlpha: { value: .40 }, uFlowVerticality: { value: 1 }, uLowerAccumulation: { value: .045 }, uBroadTrailStrength: { value: .08 }, uMediumTrailStrength: { value: .62 }, uFineTrailStrength: { value: .34 } }
        : { uWetness: { value: 0 }, uRinseProgress: { value: 0 }, uTime: { value: 0 }, uFoamDensityMap: { value: map } }
  const material: THREE.Material = debugSolid && kind === 'foam'
    ? new THREE.MeshStandardMaterial({ color: 0xf5f8fa, metalness: 0, roughness: .82, transparent: false, opacity: 1, depthTest: validation?.depthTest ?? true, depthWrite: validation?.depthWrite ?? true, side: validation?.side ?? THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: validation?.polygonOffsetFactor ?? -1, polygonOffsetUnits: validation?.polygonOffsetUnits ?? -1 })
    : new THREE.ShaderMaterial({
      vertexShader: kind === 'foam' ? foamVertex : kind === 'flow' ? foamFlowVertex : kind === 'wet' ? wetFilmVertex : layerVertex,
      fragmentShader: kind === 'dirt' ? dirtFragment : kind === 'foam' ? foamFragment : kind === 'flow' ? foamFlowFragment : wetFilmFragment,
      uniforms: uniforms as unknown as THREE.ShaderMaterialParameters['uniforms'],
      // Foam is a locally discarded opaque mass, never a globally faded overlay.
      transparent: kind !== 'foam',
      depthWrite: kind === 'foam',
      depthTest: true,
      side: kind === 'foam' ? THREE.FrontSide : THREE.DoubleSide,
      polygonOffset: kind === 'foam',
      polygonOffsetFactor: kind === 'foam' ? -1 : 0,
      polygonOffsetUnits: kind === 'foam' ? -1 : 0,
    })
  // Rebuild only the transform hierarchy needed by Body/Paint meshes; no glass, wheels or interior.
  const add = (node: THREE.Object3D, parent: THREE.Object3D) => {
    if (node instanceof THREE.Mesh) {
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      const selectedIndices = materials.flatMap((entry, index) => {
        const allowed = target === 'paint'
          ? foamSource === 'all' ? FOAM_MATERIAL_WHITELIST.has(entry.name) : entry.name === (foamSource === 'paint' ? 'Paint' : 'Body')
          : GLASS_MATERIAL_WHITELIST.has(entry.name)
        return allowed ? [index] : []
      })
      if (!selectedIndices.length) return
      // Use the authoring-time GLB material groups exactly as exported. This is
      // a material-index selection, not runtime geometric classification.
      const selectedGeometry = geometryForMaterialIndices(node.geometry, selectedIndices)
      if (!selectedGeometry) return
      const mesh = new THREE.Mesh(offsetGeometry(selectedGeometry, validation?.shellOffset ?? .003), material)
      mesh.name = `Layer:${kind}:${target}:${node.name}`; mesh.position.copy(node.position); mesh.quaternion.copy(node.quaternion); mesh.scale.copy(node.scale); mesh.renderOrder = debugSolid ? validation?.renderOrder ?? 20 : target === 'glass' ? (kind === 'foam' ? 5 : 4) : (kind === 'foam' ? 3 : 2); parent.add(mesh); return
    }
    const branch = new THREE.Group(); branch.position.copy(node.position); branch.quaternion.copy(node.quaternion); branch.scale.copy(node.scale); parent.add(branch); node.children.forEach((child) => add(child, branch))
  }
  source.children.forEach((child) => add(child, root))
  // Every descendant mesh uses this exact ShaderMaterial instance. Keeping the
  // identity on the layer root lets the runtime panel prove that the uniform
  // being updated belongs to the material currently rendered in production.
  root.userData.uniforms = uniforms
  root.userData.material = material
  return root
}

function makeStaticFoamLayer(source: THREE.Group, densityMap: THREE.Texture, state: FoamStaticState) {
  const root = new THREE.Group()
  root.visible = false
  const uniforms = {
    uFoamDensityMap: { value: densityMap },
    uCoverage: { value: state.coverage },
    uDensity: { value: state.density },
    uEdgeSoftness: { value: state.edgeSoftness },
    uBreakupStrength: { value: state.breakupStrength },
  }
  const material = new THREE.MeshStandardMaterial({
    color: 0xf5f8fa, metalness: 0, roughness: .82, transparent: false,
    depthTest: true, depthWrite: true, side: THREE.FrontSide,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  })
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFoamUv;\nvarying vec3 vFoamWorldPosition;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvFoamUv = uv;\nvFoamWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform sampler2D uFoamDensityMap;
uniform float uCoverage;
uniform float uDensity;
uniform float uEdgeSoftness;
uniform float uBreakupStrength;
varying vec2 vFoamUv;
varying vec3 vFoamWorldPosition;
float foamHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float foamNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(foamHash(i), foamHash(i + vec2(1.0, 0.0)), f.x), mix(foamHash(i + vec2(0.0, 1.0)), foamHash(i + vec2(1.0)), f.x), f.y);
}
float foamFbm(vec2 p) {
  float value = 0.0; float amplitude = 0.58;
  for (int i = 0; i < 4; i++) { value += foamNoise(p) * amplitude; p = p * 2.07 + vec2(9.2, 3.7); amplitude *= 0.5; }
  return value;
}
float staticFoamPresence() {
  vec3 densityTexture = texture2D(uFoamDensityMap, vFoamUv * 1.12).rgb;
  float macro = foamFbm(vFoamUv * 1.85 + vec2(0.18, 0.43));
  float medium = foamFbm(vFoamUv * 4.9 + vec2(2.71, 0.62));
  float directional = clamp((vFoamWorldPosition.y - 0.03) / 2.75, 0.0, 1.0);
  float field = directional * 0.80 + macro * 0.13 + medium * 0.05 + (densityTexture.g - 0.5) * 0.02 + (uDensity - 0.5) * 0.10;
  float smallBreaks = smoothstep(0.57, 0.72, foamFbm(vFoamUv * 4.1 + vec2(5.1, 1.7))) * uBreakupStrength;
  field -= smallBreaks * 0.11;
  float threshold = mix(0.45, 0.04, smoothstep(0.0, 1.0, uCoverage));
  float width = max(fwidth(field), 0.008) * uEdgeSoftness;
  float presence = smoothstep(threshold - width, threshold + width, field);
  if (smallBreaks > 0.22) presence = 0.0;
  return presence;
}`)
      .replace('#include <alphatest_fragment>', `#include <alphatest_fragment>
float foamPresence = staticFoamPresence();
if (foamPresence < 0.08) discard;
diffuseColor.rgb = mix(vec3(0.86, 0.89, 0.92), vec3(0.961, 0.973, 0.980), clamp(foamPresence * uDensity + 0.12, 0.0, 1.0));`)
  }
  const add = (node: THREE.Object3D, parent: THREE.Object3D) => {
    if (node instanceof THREE.Mesh) {
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      if (!materials.some((entry) => entry.name === 'Paint')) return
      const mesh = new THREE.Mesh(offsetGeometry(node.geometry, .003), material)
      mesh.name = `StaticFoam:Paint:${node.name}`
      mesh.position.copy(node.position); mesh.quaternion.copy(node.quaternion); mesh.scale.copy(node.scale)
      mesh.renderOrder = 20; parent.add(mesh); return
    }
    const branch = new THREE.Group()
    branch.position.copy(node.position); branch.quaternion.copy(node.quaternion); branch.scale.copy(node.scale)
    parent.add(branch); node.children.forEach((child) => add(child, branch))
  }
  source.children.forEach((child) => add(child, root))
  return root
}

function makePbrFoamLayer(source: THREE.Group, packedMap: THREE.Texture, normalMap: THREE.Texture, state: FoamPbrState, continuous: ContinuousMacroConfig | null = null, debugView: ContinuousDebugView = 'solid') {
  const root = new THREE.Group(); root.visible = false
  const uniforms = {
    uFoamPackedMap: { value: packedMap }, uFoamNormalMap: { value: normalMap },
    uCoverage: { value: state.coverage }, uDensity: { value: state.density }, uEdgeSoftness: { value: state.edgeSoftness }, uBreakupStrength: { value: state.breakupStrength },
    uFoamRoughness: { value: state.roughness }, uBaseMass: { value: state.baseMass }, uMicroStructure: { value: state.microStructure },
    uMediumNormalStrength: { value: state.mediumNormalStrength }, uMicroNormalStrength: { value: state.microNormalStrength },
    uDisplacement: { value: state.displacement }, uWetness: { value: state.wetness }, uColorVariation: { value: state.colorVariation },
    uMacroVolumeStrength: { value: continuous?.strength ?? 0 }, uMacroHeightClamp: { value: continuous?.clamp ?? 0 }, uMacroActivationWidth: { value: continuous?.activationWidth ?? .15 },
  }
  const material = new THREE.MeshPhysicalMaterial({ color: 0xf3f7f8, metalness: 0, roughness: state.roughness, clearcoat: .025, clearcoatRoughness: .52, normalMap, normalScale: new THREE.Vector2(.32, .32), transparent: false, depthTest: true, depthWrite: true, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, wireframe: debugView === 'wireframe' })
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uFoamPackedMap;\nuniform float uDisplacement, uCoverage, uMacroVolumeStrength, uMacroHeightClamp, uMacroActivationWidth;\nattribute float foamMacroHeight, foamMacroStart, foamMacroDensity, foamMacroWetness;\nvarying vec2 vPbrFoamUv;\nvarying vec3 vPbrFoamWorldPosition;\nvarying float vMacroMass, vMacroWetness;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPbrFoamUv = uv;\nvPbrFoamWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat pbrHeight = smoothstep(0.42, 0.74, texture2D(uFoamPackedMap, uv).a) - 0.5;\nfloat macroActivation=smoothstep(foamMacroStart,foamMacroStart+uMacroActivationWidth,uCoverage);\nvMacroMass=foamMacroDensity*macroActivation; vMacroWetness=foamMacroWetness*macroActivation;\nfloat continuousHeight=min(foamMacroHeight*macroActivation*uMacroVolumeStrength,uMacroHeightClamp);\ntransformed += objectNormal * (pbrHeight*uDisplacement+continuousHeight);')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform sampler2D uFoamPackedMap;
uniform sampler2D uFoamNormalMap;
uniform float uCoverage, uDensity, uEdgeSoftness, uBreakupStrength, uFoamRoughness, uBaseMass, uMicroStructure, uMediumNormalStrength, uMicroNormalStrength, uWetness, uColorVariation;
varying vec2 vPbrFoamUv;
varying vec3 vPbrFoamWorldPosition;
varying float vMacroMass, vMacroWetness;
float pbrHash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float pbrNoise(vec2 p) { vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(pbrHash(i),pbrHash(i+vec2(1,0)),f.x),mix(pbrHash(i+vec2(0,1)),pbrHash(i+vec2(1)),f.x),f.y); }
float pbrFbm(vec2 p) { float v=0.0,a=.58; for(int i=0;i<4;i++){v+=pbrNoise(p)*a;p=p*2.07+vec2(9.2,3.7);a*=.5;} return v; }
float pbrPresence() {
  vec4 packed=texture2D(uFoamPackedMap,vPbrFoamUv*1.12);
  float macro=pbrFbm(vPbrFoamUv*1.85+vec2(.18,.43)); float medium=pbrFbm(vPbrFoamUv*4.9+vec2(2.71,.62));
  float directional=clamp((vPbrFoamWorldPosition.y-.03)/2.75,0.0,1.0);
  float field=directional*.80+macro*.13+medium*.05+(packed.g-.5)*.02+(uDensity-.5)*.10;
  float breaks=smoothstep(.57,.72,pbrFbm(vPbrFoamUv*4.1+vec2(5.1,1.7)))*uBreakupStrength;
  field-=breaks*.11; float threshold=mix(.45,.04,smoothstep(0.0,1.0,uCoverage)); float width=max(fwidth(field),.008)*uEdgeSoftness;
  float presence=smoothstep(threshold-width,threshold+width,field); if(breaks>.22) presence=0.0; return presence;
}`)
      .replace('#include <alphatest_fragment>', `#include <alphatest_fragment>
float foamPresence=pbrPresence(); if(foamPresence<.08) discard;
vec4 foamPacked=texture2D(uFoamPackedMap,vPbrFoamUv*1.12);
vec4 microPacked=texture2D(uFoamPackedMap,vPbrFoamUv*5.6+vec2(.23,.41));
float macroDensity=smoothstep(.38,.78,foamPacked.r);
float detailDensity=pow(clamp(microPacked.g,0.0,1.0),mix(2.25,1.35,uMicroStructure));
float cellular=clamp(mix(macroDensity,detailDensity,.46*uMicroStructure),0.0,1.0);
float poreMask=smoothstep(.44,.78,1.0-microPacked.g)*smoothstep(.16,.80,1.0-macroDensity);
float wetMask=poreMask*smoothstep(.22,.78,1.0-detailDensity);
float mass=clamp(.48+uBaseMass*.20+macroDensity*.18+cellular*.10,0.0,1.0);
vec3 foamDense=vec3(.985,.992,.992), foamMid=vec3(.884,.913,.920), foamWet=vec3(.734,.785,.802);
vec3 creamyMass=mix(foamMid,foamDense,mass);
float wetTint=wetMask*(.20+.75*uWetness)*(.45+.55*uColorVariation);
diffuseColor.rgb=mix(creamyMass,foamWet,wetTint);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.992,.996,.996),vMacroMass*.32);
${debugView === 'macroHeight' ? 'diffuseColor.rgb=vec3(vMacroMass, vMacroMass*.38, 1.0-vMacroMass);' : debugView === 'macroStart' ? 'diffuseColor.rgb=vec3(vMacroMass*.3+.2, foamPresence, 1.0-vMacroMass);' : debugView === 'macroDensity' ? 'diffuseColor.rgb=vec3(vMacroMass);' : ''}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
vec3 microNormal=texture2D(uFoamNormalMap,vPbrFoamUv*8.5).xyz*2.0-1.0;
vec3 mediumNormal=texture2D(uFoamNormalMap,vPbrFoamUv*3.1+vec2(.31,.17)).xyz*2.0-1.0;
normal=normalize(normal+(microNormal-vec3(0.0,0.0,1.0))*uMicroNormalStrength+(mediumNormal-vec3(0.0,0.0,1.0))*uMediumNormalStrength*(1.0-vMacroMass*.38));`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
float denseRoughness=mix(.82,.94,macroDensity);
float microRoughness=mix(denseRoughness,.66,detailDensity*.24*uMicroStructure);
float wetRoughness=mix(.58,.38,wetMask);
roughnessFactor=mix(mix(microRoughness,clamp(uFoamRoughness,0.0,1.0),.22),wetRoughness,wetMask*uWetness);
roughnessFactor=mix(roughnessFactor,.91,vMacroMass*.45);`)
  }
  const add = (node: THREE.Object3D, parent: THREE.Object3D) => {
    if (node instanceof THREE.Mesh) {
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      if (!materials.some((entry) => entry.name === 'Paint')) return
      const mesh = new THREE.Mesh(makeContinuousFoamGeometry(node.geometry, continuous), material); mesh.name = `PbrFoam:Paint:${node.name}`
      mesh.position.copy(node.position); mesh.quaternion.copy(node.quaternion); mesh.scale.copy(node.scale); mesh.renderOrder = 20; parent.add(mesh); return
    }
    const branch = new THREE.Group(); branch.position.copy(node.position); branch.quaternion.copy(node.quaternion); branch.scale.copy(node.scale); parent.add(branch); node.children.forEach((child) => add(child, branch))
  }
  source.children.forEach((child) => add(child, root)); return root
}

type HybridFoamLayers = { root: THREE.Group; accumulation: THREE.InstancedMesh; edge: THREE.InstancedMesh; patches: number[]; edges: number[]; patchMatrices: THREE.Matrix4[]; edgeMatrices: THREE.Matrix4[] }
type FoamGeometryPreset = 'soft' | 'balanced' | 'dramatic'
type FoamDebugView = 'solid' | 'wireframe' | 'normals'
const FOAM_GEOMETRY_PRESETS: Record<FoamGeometryPreset, { horizontal: number; vertical: number; edge: number }> = {
  soft: { horizontal: .72, vertical: .62, edge: .58 },
  balanced: { horizontal: 1, vertical: .78, edge: .72 },
  dramatic: { horizontal: 1.18, vertical: .94, edge: .88 },
}

// Macro volume is intentionally geometric: the base shell remains close to paint,
// while these two instanced meshes provide the small, irregular raised masses and
// hanging edges that a surface shader cannot communicate in a wide composition.
function makeHybridFoamLayers(source: THREE.Group, packedMap: THREE.Texture, normalMap: THREE.Texture, compact: boolean, presetName: FoamGeometryPreset, debugView: FoamDebugView): HybridFoamLayers {
  const root = new THREE.Group(); root.name = 'FoamHybridLayers'; root.visible = false
  const patchCount = compact ? 14 : 24; const edgeCount = compact ? 4 : 6
  const surfaces = findPaintSurfaces(source, patchCount + edgeCount + 18)
  const tops = surfaces.filter((hit) => hit.normal.y > .24)
  const sides = surfaces.filter((hit) => hit.normal.y <= .24 && hit.relativeHeight > .28)
  const patchMaterial = makeMacroFoamMaterial(packedMap, normalMap, .84, debugView, 'accumulation')
  const edgeMaterial = makeMacroFoamMaterial(packedMap, normalMap, .69, debugView, 'edge')
  const accumulation = new THREE.InstancedMesh(makeFoamBlobGeometry(17), patchMaterial, patchCount)
  const edge = new THREE.InstancedMesh(makeFoamEdgeGeometry(), edgeMaterial, edgeCount)
  accumulation.name = 'FoamAccumulationLayer'; edge.name = 'FoamEdgeLayer'
  accumulation.renderOrder = 21; edge.renderOrder = 22
  accumulation.frustumCulled = false; edge.frustumCulled = false
  const patches: number[] = []; const edges: number[] = []; const patchMatrices: THREE.Matrix4[] = []; const edgeMatrices: THREE.Matrix4[] = []
  const normalAxis = new THREE.Vector3(0, 0, 1); const matrix = new THREE.Matrix4(); const position = new THREE.Vector3(); const scale = new THREE.Vector3(); const twist = new THREE.Quaternion(); const orientation = new THREE.Quaternion()
  const preset = FOAM_GEOMETRY_PRESETS[presetName]
  for (let index = 0; index < patchCount; index += 1) {
    const horizontal = index < Math.round(patchCount * .63); const hit = (horizontal ? tops : sides)[index % Math.max(1, (horizontal ? tops : sides).length)] ?? surfaces[index % surfaces.length]; if (!hit) continue
    position.copy(hit.position).addScaledVector(hit.normal, .0005)
    orientation.setFromUnitVectors(normalAxis, hit.normal); twist.setFromAxisAngle(normalAxis, pseudoRandom(index + 19) * Math.PI * 2); orientation.multiply(twist)
    const multiplier = horizontal ? preset.horizontal : preset.vertical
    const wide = (horizontal ? .040 + pseudoRandom(index + 3) * .050 : .024 + pseudoRandom(index + 3) * .030) * multiplier
    const long = (horizontal ? .032 + pseudoRandom(index + 7) * .040 : .050 + pseudoRandom(index + 7) * .045) * multiplier
    scale.set(wide, long, (horizontal ? .010 + pseudoRandom(index + 11) * .012 : .006 + pseudoRandom(index + 11) * .009) * multiplier)
    matrix.compose(position, orientation, scale); accumulation.setMatrixAt(index, matrix); patchMatrices.push(matrix.clone()); patches.push(.45 + (index % 5) * .11)
  }
  for (let index = 0; index < edgeCount; index += 1) {
    const hit = sides[(index * 3 + 2) % Math.max(1, sides.length)] ?? surfaces[(index * 3 + 2) % surfaces.length]; if (!hit) continue
    position.copy(hit.position).addScaledVector(hit.normal, .001)
    orientation.setFromUnitVectors(normalAxis, hit.normal); twist.setFromAxisAngle(normalAxis, (pseudoRandom(index + 41) - .5) * .9); orientation.multiply(twist)
    scale.set((.018 + pseudoRandom(index + 27) * .018) * preset.edge, (.026 + pseudoRandom(index + 29) * .034) * preset.edge, (.008 + pseudoRandom(index + 31) * .010) * preset.edge)
    matrix.compose(position, orientation, scale); edge.setMatrixAt(index, matrix); edgeMatrices.push(matrix.clone()); edges.push(.62 + (index % 4) * .10)
  }
  accumulation.instanceMatrix.needsUpdate = true; edge.instanceMatrix.needsUpdate = true
  root.add(accumulation, edge)
  root.userData.stats = { patches: patchCount, edges: edgeCount, triangles: estimateTriangles(accumulation.geometry) * patchCount + estimateTriangles(edge.geometry) * edgeCount, drawCalls: 2 }
  return { root, accumulation, edge, patches, edges, patchMatrices, edgeMatrices }
}

function makeMacroFoamMaterial(packedMap: THREE.Texture, normalMap: THREE.Texture, roughness: number, debugView: FoamDebugView, layer: 'accumulation' | 'edge') {
  if (debugView === 'normals') return new THREE.MeshNormalMaterial({ side: THREE.FrontSide })
  const material = new THREE.MeshPhysicalMaterial({ color: layer === 'accumulation' ? 0xf7fafa : 0xe9f0f1, metalness: 0, roughness, clearcoat: .012, clearcoatRoughness: .62, normalMap, normalScale: new THREE.Vector2(.16, .16), transparent: false, depthTest: true, depthWrite: true, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, wireframe: debugView === 'wireframe' })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMacroFoamPacked = { value: packedMap }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vMacroFoamUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvMacroFoamUv = uv;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uMacroFoamPacked;\nvarying vec2 vMacroFoamUv;')
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
vec4 macroFoamPacked=texture2D(uMacroFoamPacked,vMacroFoamUv*5.3);
float macroWet=smoothstep(.50,.82,1.0-macroFoamPacked.g);
roughnessFactor=mix(${layer === 'accumulation' ? '.90' : '.74'},${layer === 'accumulation' ? '.66' : '.52'},macroWet*.28);`)
      .replace('#include <color_fragment>', `#include <color_fragment>
vec4 macroFoamColor=texture2D(uMacroFoamPacked,vMacroFoamUv*4.2);
float macroCell=smoothstep(.38,.76,macroFoamColor.g);
diffuseColor.rgb=mix(vec3(.88,.91,.92),vec3(.985,.992,.992),.55+macroCell*.40);`)
  }
  return material
}

function makeFoamBlobGeometry(seed: number) {
  const segments = 15; const positions: number[] = [(pseudoRandom(seed) - .5) * .28, (pseudoRandom(seed + 2) - .5) * .18, .54]; const indices: number[] = []
  for (let ring = 0; ring < 2; ring += 1) for (let index = 0; index < segments; index += 1) {
    const angle = index / segments * Math.PI * 2; const low = pseudoRandom(seed * 31 + index * 7 + ring * 13) - .5
    const radius = ring === 0 ? .56 + low * .12 : .98 + low * .20
    const squash = .54 + pseudoRandom(seed + index * 11) * .28
    const centerBias = ring === 0 ? .08 : .02
    positions.push(Math.cos(angle) * radius + Math.cos(angle * 2.0 + seed) * centerBias, Math.sin(angle) * radius * squash + Math.sin(angle * 3.0 + seed) * centerBias, ring === 0 ? .30 + pseudoRandom(seed + index) * .16 : -.035)
  }
  for (let index = 0; index < segments; index += 1) { const next = (index + 1) % segments; indices.push(0, 1 + index, 1 + next); const a = 1 + index; const b = 1 + next; const c = 1 + segments + index; const d = 1 + segments + next; indices.push(a, c, b, b, c, d) }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.normalizeNormals(); return geometry
}

function makeFoamEdgeGeometry() {
  const geometry = new THREE.BufferGeometry()
  const positions = [-.72,.66,.05, .72,.58,.05, .48,.12,.17, .26,-.78,.08, -.18,-1,.04, -.44,-.16,.16]
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex([0,1,2,0,2,5,5,2,3,5,3,4]); geometry.computeVertexNormals(); return geometry
}

function findPaintSurfaces(source: THREE.Group, desired: number) {
  source.updateMatrixWorld(true)
  const paintMeshes: THREE.Mesh[] = []; source.traverse((node) => { if (node instanceof THREE.Mesh) { const materials = Array.isArray(node.material) ? node.material : [node.material]; if (materials.some((material) => material.name === 'Paint')) paintMeshes.push(node) } })
  const box = new THREE.Box3().setFromObject(source); const center = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3()); const raycaster = new THREE.Raycaster(); const results: Array<{ position: THREE.Vector3; normal: THREE.Vector3; relativeHeight: number }> = []
  const cast = (origin: THREE.Vector3, direction: THREE.Vector3) => { raycaster.set(origin, direction); const hit = raycaster.intersectObjects(paintMeshes, false)[0]; if (hit?.face) results.push({ position: hit.point.clone(), normal: hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize(), relativeHeight: (hit.point.y - box.min.y) / Math.max(size.y, .001) }) }
  for (let i = 0; i < desired; i += 1) {
    const u = pseudoRandom(i + 4) - .5; const v = pseudoRandom(i + 71) - .5
    cast(new THREE.Vector3(center.x + u * size.x * .88, box.max.y + size.y * .3, center.z + v * size.z * .86), new THREE.Vector3(0, -1, 0))
    if (i % 2 === 0) cast(new THREE.Vector3(box.max.x + size.x * .2, center.y + v * size.y * .52, center.z + u * size.z * .82), new THREE.Vector3(-1, 0, 0))
    if (i % 3 === 0) cast(new THREE.Vector3(box.min.x - size.x * .2, center.y + v * size.y * .48, center.z + u * size.z * .82), new THREE.Vector3(1, 0, 0))
  }
  return results.length ? results : [{ position: center, normal: new THREE.Vector3(0, 1, 0), relativeHeight: .5 }]
}

function updateHybridFoamLayers(layers: HybridFoamLayers, coverage: number, active: boolean, isolate: string) {
  layers.root.visible = active
  const reveal = (mesh: THREE.InstancedMesh, stages: number[], originals: THREE.Matrix4[], layer: string) => {
    mesh.visible = active && (isolate === 'all' || isolate === layer) && coverage >= .42
    const matrix = new THREE.Matrix4(); const position = new THREE.Vector3(); const rotation = new THREE.Quaternion(); const scale = new THREE.Vector3()
    for (let index = 0; index < stages.length; index += 1) {
      matrix.copy(originals[index]!); matrix.decompose(position, rotation, scale)
      const enabled = coverage >= stages[index]!; const multiplier = enabled ? 1 : 0.00001
      matrix.compose(position, rotation, scale.multiplyScalar(multiplier)); mesh.setMatrixAt(index, matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }
  reveal(layers.accumulation, layers.patches, layers.patchMatrices, 'accumulation'); reveal(layers.edge, layers.edges, layers.edgeMatrices, 'edge')
}

function pseudoRandom(seed: number) { const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value) }
function estimateTriangles(geometry: THREE.BufferGeometry) { return (geometry.index?.count ?? geometry.getAttribute('position').count) / 3 }

function makeContinuousFoamGeometry(source: THREE.BufferGeometry, continuous: ContinuousMacroConfig | null) {
  const geometry = offsetGeometry(source, .003)
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const count = position.count; const height = new Float32Array(count); const start = new Float32Array(count); const density = new Float32Array(count); const wetness = new Float32Array(count)
  if (!continuous) { geometry.setAttribute('foamMacroHeight', new THREE.BufferAttribute(height, 1)); geometry.setAttribute('foamMacroStart', new THREE.BufferAttribute(start, 1)); geometry.setAttribute('foamMacroDensity', new THREE.BufferAttribute(density, 1)); geometry.setAttribute('foamMacroWetness', new THREE.BufferAttribute(wetness, 1)); return geometry }
  geometry.computeBoundingBox(); const box = geometry.boundingBox!; const center = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3())
  const anchors = makeContinuousAnchors(center, size)
  const point = new THREE.Vector3()
  for (let index = 0; index < count; index += 1) {
    point.fromBufferAttribute(position, index); let total = 0; let weightedStart = 0; let weightedWetness = 0
    anchors.forEach((anchor) => {
      const dx = (point.x - anchor.center.x) / anchor.radius.x; const dy = (point.y - anchor.center.y) / anchor.radius.y; const dz = (point.z - anchor.center.z) / anchor.radius.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz); const influence = Math.pow(Math.max(1 - distance, 0), anchor.falloff)
      total += influence * anchor.amplitude; weightedStart += influence * anchor.start; weightedWetness += influence * anchor.wetness
    })
    const field = Math.min(total, 1); height[index] = field * .012; density[index] = Math.min(field * 1.15, 1); start[index] = field > .01 ? weightedStart / Math.max(total, .001) : 1; wetness[index] = field > .01 ? weightedWetness / Math.max(total, .001) : 0
  }
  geometry.setAttribute('foamMacroHeight', new THREE.BufferAttribute(height, 1)); geometry.setAttribute('foamMacroStart', new THREE.BufferAttribute(start, 1)); geometry.setAttribute('foamMacroDensity', new THREE.BufferAttribute(density, 1)); geometry.setAttribute('foamMacroWetness', new THREE.BufferAttribute(wetness, 1)); geometry.computeVertexNormals(); geometry.normalizeNormals(); return geometry
}

function makeContinuousAnchors(center: THREE.Vector3, size: THREE.Vector3) {
  const values: Array<[number, number, number, number, number, number]> = [
    [-.42,.22,-.20,.26,.48,.20],[-.05,.18,-.32,.32,.56,.18],[.33,.22,-.12,.25,.62,.22],
    [-.28,.42,.12,.22,.58,.28],[.18,.44,.20,.28,.64,.25],[-.45,-.10,.18,.18,.70,.34],[.26,-.15,.32,.17,.73,.30],
    [.46,-.04,-.28,.17,.78,.26],[-.05,-.28,-.34,.22,.76,.32],[.34,-.30,.16,.18,.82,.27],
  ]
  return values.map(([x, y, z, radius, start, wet], index) => ({ center: new THREE.Vector3(center.x + x * size.x, center.y + y * size.y, center.z + z * size.z), radius: new THREE.Vector3(size.x * radius, size.y * (.17 + (index % 3) * .035), size.z * (radius * .72)), amplitude: .55 + (index % 4) * .10, falloff: 1.55 + (index % 3) * .3, start, wetness: wet }))
}

function offsetGeometry(source: THREE.BufferGeometry, shellOffset: number) {
  const geometry = source.clone(); const position = geometry.getAttribute('position'); const normal = geometry.getAttribute('normal')
  if (!normal) return geometry
  for (let i=0;i<position.count;i++) position.setXYZ(i, position.getX(i)+normal.getX(i)*shellOffset, position.getY(i)+normal.getY(i)*shellOffset, position.getZ(i)+normal.getZ(i)*shellOffset)
  position.needsUpdate = true; return geometry
}

function geometryForMaterialIndices(source: THREE.BufferGeometry, materialIndices: number[]) {
  const geometry = source.clone()
  const allowed = new Set(materialIndices)
  if (!geometry.groups.length) return materialIndices.length === 1 ? geometry : null
  const groups = geometry.groups.filter((group) => group.materialIndex !== undefined && allowed.has(group.materialIndex))
  if (!groups.length) return null
  geometry.clearGroups()
  groups.forEach((group) => geometry.addGroup(group.start, group.count, 0))
  return geometry
}

function readDebugNumber(params: URLSearchParams | null, key: string, fallback: number) {
  const value = Number(params?.get(key))
  return Number.isFinite(value) ? value : fallback
}

function updateLayer(layer: THREE.Group, state: CinematicState, time: number, debugView: CinematicDebugView = 'final', flowSettings?: { coverage: number; width: number; speed: number; alpha: number; verticality: number; lowerAccumulation: number; broad: number; medium: number; fine: number }, microTime = 0, foamLife = true) {
  const uniforms = layer.userData.uniforms as Record<string, { value: number }>
  uniforms.uTime.value = time
  if ('uFoamMicroTime' in uniforms) { uniforms.uFoamMicroTime.value = microTime; uniforms.uFoamLife.value = foamLife ? 1 : 0 }
  if ('uCleaningMask' in uniforms) uniforms.uCleaningMask.value = state.cleaningMask
  if ('uDirtAmount' in uniforms) uniforms.uDirtAmount.value = state.dirtAmount
  if ('uCoverage' in uniforms) {
    uniforms.uCoverage.value = state.applicationProgress
    uniforms.uPeakDensity.value = state.peakDensity
    uniforms.uDrainProgress.value = state.drainProgress
    uniforms.uRinseProgress.value = state.rinseProgress
    uniforms.uWetnessProgress.value = state.wetnessProgress
    uniforms.uDebugView.value = ({ final: 0, presence: 1, gravity: 2, streaks: 3, rinse: 4, rinseEdge: 5, wetness: 6 } as Record<CinematicDebugView, number>)[debugView]
  }
  if ('uDrainProgress' in uniforms && !('uCoverage' in uniforms)) {
    uniforms.uDrainProgress.value = state.drainProgress
    uniforms.uRinseProgress.value = state.rinseProgress
    uniforms.uDebugView.value = ({ final: 0, presence: 1, gravity: 2, streaks: 3, rinse: 4, rinseEdge: 5, wetness: 6 } as Record<CinematicDebugView, number>)[debugView]
    if (flowSettings) { uniforms.uFlowCoverage.value = flowSettings.coverage; uniforms.uFlowWidth.value = flowSettings.width; uniforms.uFlowSpeed.value = flowSettings.speed; uniforms.uFlowAlpha.value = flowSettings.alpha; uniforms.uFlowVerticality.value = flowSettings.verticality; uniforms.uLowerAccumulation.value = flowSettings.lowerAccumulation; uniforms.uBroadTrailStrength.value = flowSettings.broad; uniforms.uMediumTrailStrength.value = flowSettings.medium; uniforms.uFineTrailStrength.value = flowSettings.fine }
  }
  if ('uWetness' in uniforms) { uniforms.uWetness.value = state.wetness; uniforms.uRinseProgress.value = state.rinseProgress }
}

function interpolate(progress: number, points: Array<[number, number]>) {
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]; const next = points[index]
    if (previous && next && progress <= next[0]) return THREE.MathUtils.lerp(previous[1], next[1], (progress - previous[0]) / (next[0] - previous[0]))
  }
  return points[points.length - 1]?.[1] ?? 0
}

function DustParticles({ state, time, reducedMotion }: { state: CinematicState; time: MutableRefObject<number>; reducedMotion: boolean }) {
  const isMobile = useThree((s) => s.viewport.width < 9); const count = isMobile ? 64 : 160; const ref = useRef<THREE.Points>(null); const { invalidate } = useThree()
  const geometry = useMemo(() => { const values=new Float32Array(count*3); for(let i=0;i<count;i++){const a=i*2.399,r=.25+(i%17)/17;values[i*3]=Math.cos(a)*r;values[i*3+1]=-.45+((i*11)%100)/100*1.35;values[i*3+2]=Math.sin(a)*r*.55} const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(values,3));return g },[count])
  useFrame(() => { const material=ref.current?.material as THREE.PointsMaterial|undefined;if(!material)return; material.opacity=state.dustAmount*.42; material.color.setRGB(.45+.45*state.dustToFoam,.46+.48*state.dustToFoam,.42+.53*state.dustToFoam); ref.current!.visible=state.dustAmount>.01; if(!reducedMotion&&state.dustAmount>.01){ref.current!.rotation.y=time.current*.09;invalidate()} })
  return <points ref={ref} geometry={geometry} position={[0,.38,.55]}><pointsMaterial transparent depthWrite={false} size={.026} sizeAttenuation color="#77756e" opacity={.4}/></points>
}

function FoamDrips({ state, time }: { state: CinematicState; time: MutableRefObject<number> }) {
  const compact = useThree((store) => store.viewport.width < 9); const count = compact ? 4 : 6
  const ref = useRef<THREE.Points>(null); const { invalidate } = useThree()
  const geometry = useMemo(() => { const values = new Float32Array(count * 3); for (let i=0;i<count;i++) { values[i*3] = -.8 + (i % 8) * .22; values[i*3+1] = -.18 - (i % 3) * .16; values[i*3+2] = .55 + ((i * 7) % 5) * .05 } const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(values,3)); return g },[count])
  useFrame(() => { const points = ref.current; if (!points) return; const active=state.drainProgress>.01 && state.rinseProgress<.98; points.visible=active; const position=points.geometry.getAttribute('position') as THREE.BufferAttribute; for(let i=0;i<count;i++){ const seed=i*.173; const fall=Math.min(.16+state.drainProgress*.32+((time.current*.035+seed)%1)*.08,.58); position.setY(i,-.14-(i%3)*.13-fall) } position.needsUpdate=true; if(active) invalidate() })
  return <points ref={ref} geometry={geometry}><pointsMaterial color="#f3f8fa" transparent depthWrite={false} size={.018} sizeAttenuation opacity={.64}/></points>
}

function FoamDropLayer({ state, microTime, debug, singleProbe, deterministic }: { state: CinematicState; microTime: MutableRefObject<number>; debug: MutableRefObject<AnimationDebugData>; singleProbe: boolean; deterministic: boolean }) {
  const compact = useThree((store) => store.viewport.width < 9); const count = singleProbe ? 1 : compact ? 4 : 8
  const ref = useRef<THREE.InstancedMesh>(null); const { invalidate } = useThree()
  const origins = useMemo(() => [[-.92,.22,.42],[-.48,.18,.64],[.12,-.08,.72],[.58,-.16,.62],[.9,.08,.44],[-.18,.02,-.54],[.72,-.08,-.38],[-.7,-.12,-.42]].map((v) => new THREE.Vector3(...v)), [])
  const geometry = useMemo(() => makeFoamDropGeometry(), [])
  useEffect(() => { if (ref.current) ref.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage) }, [])
  useFrame(() => {
    const mesh=ref.current; if (!mesh) return
    debug.current.visibleDropMeshUUID = mesh.uuid; debug.current.updatedDropMeshUUID = mesh.uuid
    const active = deterministic || singleProbe || state.peakDensity > .12 && state.dryProgress < .98
    mesh.visible = active; mesh.frustumCulled = false; mesh.renderOrder = 25
    const matrix=new THREE.Matrix4(); const position=new THREE.Vector3(); const scale=new THREE.Vector3(); const rotation=new THREE.Quaternion()
    for(let i=0;i<count;i++) {
      const water=state.rinseProgress>.2; const origin=origins[i%origins.length]!; position.copy(singleProbe ? origins[2]! : origin)
      if (deterministic && i === 0) {
        const normalized = (microTime.current % 3) / 3
        position.y = origin.y - normalized * 1.8
        scale.set(.04, .10 + normalized * .08, .04)
        matrix.compose(position, rotation.identity(), scale)
        mesh.setMatrixAt(i, matrix)
        debug.current.drop0State = 'deterministic-falling'
        debug.current.drop0Elapsed = microTime.current % 3
        debug.current.drop0Y = position.y
        debug.current.calculatedDropY = position.y
        debug.current.drop0Visible = true
        continue
      }
      // Staggered 3.0–4.4s cycles keep each emitter sparse; falling remains
      // quicker than a surface streak but long enough to be read in-frame.
      const attached=.78+(i%3)*.16, stretching=.56+(i%2)*.14, falling=.92+(i%4)*.11, impact=.34, delay=.86+(i%4)*.26
      const cycleDuration=attached+stretching+falling+impact+delay; const age=(microTime.current+i*.71)%cycleDuration; const width=.025+(i%3)*.006
      let stateName='attached'
      if(age<attached) { scale.set(width,.055,width) }
      else if(age<attached+stretching) { stateName='stretching'; const t=(age-attached)/stretching; position.y-=t*.085; scale.set(width*(1-t*.34),.055+t*.115,width*(1-t*.34)) }
      else if(age<attached+stretching+falling) { stateName='falling'; const t=age-attached-stretching; const gravity=water?.52:.36; const velocity=water?.16:.075; const fall=velocity*t+.5*gravity*t*t; position.y-=.085+fall; position.x+=Math.sin(i*12.7)*t*.008; scale.set(width*.60,.13+Math.min(fall*.12,.10),width*.60) }
      else if(age<attached+stretching+falling+impact) { stateName='impact'; position.y=-.78; scale.set(0,0,0) }
      else { stateName='delay'; scale.set(0,0,0) }
      rotation.setFromAxisAngle(new THREE.Vector3(0,0,1),(i%2?-.12:.12)); matrix.compose(position,rotation,scale); mesh.setMatrixAt(i,matrix)
      if(i===0){debug.current.drop0State=stateName;debug.current.drop0Elapsed=age;debug.current.drop0Y=position.y;debug.current.calculatedDropY=position.y;debug.current.drop0Visible=scale.y>0}
    }
    mesh.instanceMatrix.needsUpdate=true
    const matrixReadback=new THREE.Matrix4();const matrixPosition=new THREE.Vector3();const matrixQuaternion=new THREE.Quaternion();const matrixScale=new THREE.Vector3();mesh.getMatrixAt(0,matrixReadback);matrixReadback.decompose(matrixPosition,matrixQuaternion,matrixScale);debug.current.matrixDropY=matrixPosition.y;debug.current.dropMatrixUpdates+=1
    if(active) invalidate()
  })
  return <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} renderOrder={25}><primitive object={geometry} attach="geometry" /><meshPhysicalMaterial color={singleProbe ? '#ff00ff' : deterministic ? '#dffbff' : '#f1f7f9'} roughness={.22} metalness={0} transmission={.05} thickness={.03} clearcoat={.35} clearcoatRoughness={.18} transparent opacity={.78} depthTest depthWrite={false} /></instancedMesh>
}

function makeFoamDropGeometry() { const points=[new THREE.Vector2(0,.50),new THREE.Vector2(.32,.30),new THREE.Vector2(.42,.04),new THREE.Vector2(.25,-.30),new THREE.Vector2(.08,-.48),new THREE.Vector2(0,-.56)]; const geometry=new THREE.LatheGeometry(points,7); geometry.rotateX(Math.PI); return geometry }

function FoamImpactLayer({ state, microTime, debug }: { state: CinematicState; microTime: MutableRefObject<number>; debug: MutableRefObject<AnimationDebugData> }) {
  const compact = useThree((store) => store.viewport.width < 9); const count = compact ? 3 : 6; const ref=useRef<THREE.InstancedMesh>(null); const { invalidate }=useThree()
  useFrame(() => { const mesh=ref.current; if(!mesh)return; debug.current.visibleImpactMeshUUID=mesh.uuid;debug.current.updatedImpactMeshUUID=mesh.uuid;const active=state.drainProgress>.08&&state.dryProgress<.98;mesh.visible=active;const matrix=new THREE.Matrix4();const p=new THREE.Vector3();const s=new THREE.Vector3();for(let i=0;i<count;i++){const phase=(microTime.current+i*.63)%1.6;const expansion=Math.min(phase/.62,1);p.set(-.88+(i%3)*.72,-.80,.18+(i%2)*.36);s.set(.035+expansion*.075,.022+expansion*.035,1);matrix.compose(p,new THREE.Quaternion(),s);mesh.setMatrixAt(i,matrix)}mesh.instanceMatrix.needsUpdate=true;debug.current.impactMatrixUpdates+=1;if(active)invalidate() })
  return <instancedMesh ref={ref} args={[undefined,undefined,count]} frustumCulled={false} renderOrder={1} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1,1]} /><meshBasicMaterial color="#1d2b34" transparent opacity={.24} depthWrite={false} /></instancedMesh>
}

useGLTF.preload(MODEL_URL)
