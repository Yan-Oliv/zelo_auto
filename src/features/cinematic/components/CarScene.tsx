import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { dirtFragment, foamFragment, foamVertex, layerVertex } from '../shaders/surfaceLayers'
import { calculateCinematicState, type CinematicState } from '../utils/cinematicProgress'
import { getSceneKeyframes, type SceneId } from '../data/cinematicKeyframes'

const MODEL_URL = '/models/lincoln.glb'
const FOAM_MACRO_MODEL_URL = '/models/lincoln_foam_macro.glb'
// GLB audit: these are the only materials admitted to the paint FoamShell.
// Everything else (Badges, Badges_IOR, Glass, Glass_IOR, Wheel) is excluded.
const FOAM_MATERIAL_WHITELIST = new Set(['Body', 'Paint'])
const GLASS_MATERIAL_WHITELIST = new Set(['Glass', 'Glass_IOR'])

type CarSceneProps = { reducedMotion: boolean; activeSection: string; activeSceneId: SceneId; sceneProgress: number; globalProgress: number; onReadyChange?: (ready: boolean) => void }

export function CarScene({ reducedMotion, activeSection, activeSceneId, sceneProgress, globalProgress, onReadyChange }: CarSceneProps) {
  const lowQuality = activeSection !== 'hero'
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugCinematic') === '1'
  const debugCompare = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugFoamCompare') === '1'
  const [debugProgress, setDebugProgress] = useState<number | null>(null)
  const [debugFoamPreset, setDebugFoamPreset] = useState<FoamComparePreset>(() => typeof window === 'undefined' ? 'balanced' : readFoamPreset(new URLSearchParams(window.location.search).get('foamPreset')))
  const displayProgress = debugProgress ?? (activeSceneId === 'hero' ? sceneProgress : 1)
  const debugState = calculateCinematicState(displayProgress)
  return <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
    <Canvas frameloop="demand" dpr={lowQuality || isMobile ? [0.7, 1] : [0.8, 1.35]} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.18 }}>
      <fog attach="fog" args={['#0D1B2A', 8.5, 21]} />
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0.35, 1.2, 5.8]} fov={34} />
        <ambientLight intensity={.82} color="#d9e4ef" />
        <directionalLight position={[4.6, 4.2, 4.2]} intensity={2.15} color="#f5f4ef" />
        <directionalLight position={[-5.4, 2.3, -4.8]} intensity={1.35} color="#D4AF37" />
        <Environment preset="night" resolution={64} />
        <CinematicRig activeSceneId={activeSceneId} sceneProgress={sceneProgress} globalProgress={globalProgress} reducedMotion={reducedMotion} onReadyChange={onReadyChange} progressOverride={debugProgress} />
      </Suspense>
    </Canvas>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,27,42,.58),rgba(13,27,42,.04)_64%),linear-gradient(180deg,transparent,rgba(13,27,42,.14))]" />
    {debug ? <aside className="pointer-events-auto fixed bottom-4 left-4 z-[100] w-72 border border-white/20 bg-[#07111bdd] p-3 font-mono text-[11px] text-white"><label>Progress {displayProgress.toFixed(2)}<input className="mt-2 w-full" type="range" min="0" max="1" step="0.01" value={displayProgress} onChange={(event) => setDebugProgress(Number(event.target.value))}/></label><div className="mt-3 grid grid-cols-2 gap-1 text-white/70"><span>dirt {debugState.dirtAmount.toFixed(2)}</span><span>foam {debugState.foamCoverage.toFixed(2)}</span><span>clean {debugState.cleaningMask.toFixed(2)}</span><span>wet {debugState.wetness.toFixed(2)}</span></div></aside> : null}
    {debugCompare ? <FoamComparePanel preset={debugFoamPreset} onPreset={setDebugFoamPreset} /> : null}
  </div>
}

type FoamComparePreset = FoamPreset | 'hybrid'
function FoamComparePanel({ preset, onPreset }: { preset: FoamComparePreset; onPreset: (preset: FoamComparePreset) => void }) {
  useEffect(() => {
    const update = (event: Event) => onPreset((event as CustomEvent<FoamComparePreset>).detail)
    window.addEventListener('foam-preset', update)
    return () => window.removeEventListener('foam-preset', update)
  }, [onPreset])
  return <aside className="pointer-events-auto fixed bottom-4 right-4 z-[100] w-56 border border-white/20 bg-[#07111bdd] p-3 font-mono text-[11px] text-white"><div>Foam PBR compare</div><div className="mt-1 text-cyan-200">active: {preset}</div><div className="mt-2 text-white/60">1 balanced · 2 hybrid</div></aside>
}

function CinematicRig({ activeSceneId, sceneProgress, globalProgress: _globalProgress, reducedMotion, onReadyChange, progressOverride }: Omit<CarSceneProps, 'activeSection'> & { progressOverride: number | null }) {
  const gltf = useGLTF(MODEL_URL)
  const debugParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
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
  const macroEdgeEnabled = debugParams?.get('foamEdge') === '1'
  const testRigTransform = debugParams?.get('testRigTransform') === '1'
  const validationSettings = {
    shellOffset: readDebugNumber(debugParams, 'shellOffset', .003),
    polygonOffsetFactor: readDebugNumber(debugParams, 'polygonOffsetFactor', -1),
    polygonOffsetUnits: readDebugNumber(debugParams, 'polygonOffsetUnits', -1),
    depthTest: debugParams?.get('depthTest') !== '0',
    depthWrite: debugParams?.get('depthWrite') !== '0',
    side: debugParams?.get('side') === 'double' ? THREE.DoubleSide : THREE.FrontSide,
    renderOrder: readDebugNumber(debugParams, 'renderOrder', 20),
  }
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
  const foamLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'foam', 'paint', foamDensityMap, debugFoamShell, foamSource, validationSettings), [debugFoamShell, foamDensityMap, foamSource, gltf.scene, validationSettings])
  const staticFoamLayer = useMemo(() => makeStaticFoamLayer(gltf.scene, foamDensityMap, staticState), [foamDensityMap, gltf.scene, staticState])
  const continuousConfig = debugFoamContinuous ? CONTINUOUS_PRESETS[continuousPreset] : null
  const pbrFoamLayer = useMemo(() => makePbrFoamLayer(gltf.scene, foamPackedMap, foamNormalMap, pbrState, continuousConfig, continuousDebugView), [continuousConfig, continuousDebugView, foamNormalMap, foamPackedMap, gltf.scene, pbrState])
  const hybridLayers = useMemo(() => makeHybridFoamLayers(gltf.scene, foamPackedMap, foamNormalMap, typeof window !== 'undefined' && window.innerWidth < 768, geometryPreset, hybridDebugView), [foamNormalMap, foamPackedMap, geometryPreset, gltf.scene, hybridDebugView])
  const glassDirtLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'dirt', 'glass', dirtMap), [dirtMap, gltf.scene])
  const glassFoamLayer = useMemo(() => makeSurfaceLayer(gltf.scene, 'foam', 'glass', foamDensityMap), [foamDensityMap, gltf.scene])
  const group = useRef<THREE.Group>(null)
  const sweepLight = useRef<THREE.PointLight>(null)
  const time = useRef(0)
  const { camera, gl, invalidate, viewport } = useThree()
  const currentProgress = progressOverride ?? (activeSceneId === 'hero' ? sceneProgress : 1)
  const state = calculateCinematicState(currentProgress)

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

  useFrame((_, delta) => {
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
    const state = calculateCinematicState(effectiveProgress)
    const active = activeSceneId === 'hero' && (state.dustAmount > .01 || state.foamCoverage > .01 && state.cleaningMask < .99)
    if (active && !reducedMotion) time.current += Math.min(delta, .033)
    updateLayer(dirtLayer, state, time.current)
    updateLayer(foamLayer, state, time.current)
    updateLayer(glassDirtLayer, state, time.current)
    updateLayer(glassFoamLayer, state, time.current)
    foamLayer.visible = debugFoamShell || state.foamCoverage > .005 && state.cleaningMask < .995
    dirtLayer.visible = !debugFoamShell && state.dirtAmount > .005
    glassDirtLayer.visible = !debugFoamShell && state.dirtAmount > .005
    glassFoamLayer.visible = !debugFoamShell && state.foamCoverage > .005 && state.cleaningMask < .995
    staticFoamLayer.visible = false
    pbrFoamLayer.visible = false
    updateHybridFoamLayers(hybridLayers, 0, false, 'all')
    const keys = getSceneKeyframes(activeSceneId); const from = keys[0]; const to = keys[1]
    if (from && to && group.current) {
      const t = effectiveProgress; const compact = viewport.width < 9
      const carShift = interpolate(t, [[0,-.34],[.25,-.08],[.55,.12],[.8,.03],[1,0]])
      const carYaw = interpolate(t, [[0,-.1],[.3,.05],[.6,-.06],[1,.02]])
      group.current.rotation.y = THREE.MathUtils.lerp(from.rotationY, to.rotationY, t) + carYaw
      if ((debugFoamShell || debugFoamStatic) && foamView === 'front') group.current.rotation.y = 0
      if ((debugFoamShell || debugFoamStatic) && foamView === 'rear') group.current.rotation.y = Math.PI
      group.current.position.set(THREE.MathUtils.lerp(from.position[0],to.position[0],t)+carShift+(compact?-.58:0), THREE.MathUtils.lerp(from.position[1],to.position[1],t), THREE.MathUtils.lerp(from.position[2],to.position[2],t))
      group.current.scale.setScalar(compact ? 1.12 : 1.62)
      const perspective = camera as THREE.PerspectiveCamera; perspective.position.z = interpolate(t, [[0,6.3],[.3,5.9],[.65,6.15],[1,6.7]]); perspective.fov = THREE.MathUtils.lerp(from.fov,to.fov,t); perspective.updateProjectionMatrix()
    }
    if (sweepLight.current) { sweepLight.current.intensity = state.shineSweep * 7; sweepLight.current.position.x = THREE.MathUtils.lerp(-3,3,state.progress) }
    if (active) invalidate()
  })

  const showOriginalMacroCar = macroLayer === 'car' || macroLayer === 'film' || macroLayer === 'film-macro' || macroLayer === 'all' || macroLayer === 'edge'
  const showMacroAsset = macroLayer === 'macro' || macroLayer === 'film-macro' || macroLayer === 'all'
  return <group ref={group} position={[1.12,.02,-.1]} rotation={[0,-.62,0]} scale={2.04}>
    <primitive object={originalCar} visible={debugFoamMacroAsset ? showOriginalMacroCar : !foamShellOnly} />
    <primitive object={dirtLayer} />
    <primitive object={foamLayer} />
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
    {!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset ? <FoamDrips state={state} time={time} /> : null}
    {!debugFoamShell && !debugFoamStatic && !debugFoamPBR && !debugFoamHybrid && !debugFoamCompare && !debugFoamMacroAsset ? <DustParticles state={state} time={time} reducedMotion={reducedMotion} /> : null}
    {debugFoamShell ? <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffffff" /> : null}
    {(debugFoamPBR || debugFoamHybrid || debugFoamCompare) && foamPbrNeutralLight ? <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffffff" /> : null}
    <pointLight position={[0,1.05,.4]} color="#7f98aa" distance={2.8} intensity={.45} />
    <pointLight ref={sweepLight} position={[-3,1.4,1.4]} color="#f6df9b" distance={6} intensity={0} />
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

function makeSurfaceLayer(source: THREE.Group, kind: 'dirt' | 'foam', target: 'paint' | 'glass', map: THREE.Texture, debugSolid = false, foamSource: 'paint' | 'body' | 'all' = 'all', validation?: FoamValidationSettings) {
  const root = new THREE.Group()
  const uniforms = kind === 'dirt'
    ? { uDirtAmount: { value: 1 }, uCleaningMask: { value: 0 }, uTime: { value: 0 }, uLayerOpacity: { value: target === 'glass' ? .42 : 1 }, uDirtMap: { value: map } }
    : { uCoverage: { value: 0 }, uCleaningMask: { value: 0 }, uTime: { value: 0 }, uBubbleStrength: { value: .35 }, uMicroBubbleStrength: { value: .18 }, uLayerOpacity: { value: target === 'glass' ? .35 : 1 }, uFoamDensityMap: { value: map } }
  const material: THREE.Material = debugSolid && kind === 'foam'
    ? new THREE.MeshStandardMaterial({ color: 0xf5f8fa, metalness: 0, roughness: .82, transparent: false, opacity: 1, depthTest: validation?.depthTest ?? true, depthWrite: validation?.depthWrite ?? true, side: validation?.side ?? THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: validation?.polygonOffsetFactor ?? -1, polygonOffsetUnits: validation?.polygonOffsetUnits ?? -1 })
    : new THREE.ShaderMaterial({ vertexShader: kind === 'foam' ? foamVertex : layerVertex, fragmentShader: kind === 'dirt' ? dirtFragment : foamFragment, uniforms: uniforms as unknown as THREE.ShaderMaterialParameters['uniforms'], transparent: true, depthWrite: false, depthTest: kind !== 'foam', side: THREE.DoubleSide })
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
      // Each GLB primitive is material-scoped. We select whole primitives only;
      // no triangle filtering or geometric classification happens in the browser.
      const mesh = new THREE.Mesh(offsetGeometry(node.geometry, validation?.shellOffset ?? .003), material)
      mesh.name = `Layer:${kind}:${target}:${node.name}`; mesh.position.copy(node.position); mesh.quaternion.copy(node.quaternion); mesh.scale.copy(node.scale); mesh.renderOrder = debugSolid ? validation?.renderOrder ?? 20 : target === 'glass' ? (kind === 'foam' ? 5 : 4) : (kind === 'foam' ? 3 : 2); parent.add(mesh); return
    }
    const branch = new THREE.Group(); branch.position.copy(node.position); branch.quaternion.copy(node.quaternion); branch.scale.copy(node.scale); parent.add(branch); node.children.forEach((child) => add(child, branch))
  }
  source.children.forEach((child) => add(child, root))
  root.userData.uniforms = uniforms
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

function readDebugNumber(params: URLSearchParams | null, key: string, fallback: number) {
  const value = Number(params?.get(key))
  return Number.isFinite(value) ? value : fallback
}

function updateLayer(layer: THREE.Group, state: CinematicState, time: number) {
  const uniforms = layer.userData.uniforms as Record<string, { value: number }>
  uniforms.uTime.value = time; uniforms.uCleaningMask.value = state.cleaningMask
  if ('uDirtAmount' in uniforms) uniforms.uDirtAmount.value = state.dirtAmount
  if ('uCoverage' in uniforms) uniforms.uCoverage.value = state.foamCoverage
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
  const compact = useThree((store) => store.viewport.width < 9); const count = compact ? 10 : 24
  const ref = useRef<THREE.Points>(null); const { invalidate } = useThree()
  const geometry = useMemo(() => { const values = new Float32Array(count * 3); for (let i=0;i<count;i++) { values[i*3] = -.8 + (i % 8) * .22; values[i*3+1] = -.18 - (i % 3) * .16; values[i*3+2] = .55 + ((i * 7) % 5) * .05 } const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(values,3)); return g },[count])
  useFrame(() => { const points = ref.current; if (!points) return; const active=state.foamCoverage>.35 && state.cleaningMask<.95; points.visible=active; const position=points.geometry.getAttribute('position') as THREE.BufferAttribute; for(let i=0;i<count;i++){ const phase=(time.current*.12+i*.173)%1; position.setY(i,-.14-(i%3)*.13-phase*.52) } position.needsUpdate=true; if(active) invalidate() })
  return <points ref={ref} geometry={geometry}><pointsMaterial color="#eef8ff" transparent depthWrite={false} size={.024} sizeAttenuation opacity={.72}/></points>
}

useGLTF.preload(MODEL_URL)
