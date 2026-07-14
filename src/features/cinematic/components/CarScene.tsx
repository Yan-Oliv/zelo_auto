import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Html,
  PerspectiveCamera,
  useGLTF,
  useProgress,
} from '@react-three/drei'
import * as THREE from 'three'
import {
  getSceneKeyframes,
  type SceneId,
} from '../data/cinematicKeyframes'

const CLEAN_MODEL_URL = '/models/lincoln.glb'

type CarSceneProps = {
  reducedMotion: boolean
  activeSection: string
  activeSceneId: SceneId
  sceneProgress: number
  globalProgress: number
  onReadyChange?: (ready: boolean) => void
}

type PreparedMeshGroup = {
  scene: THREE.Group
  materials: OpacityMaterial[]
  lastOpacity: number
  lastDepthWrite: boolean | null
}

type OpacityMaterial = THREE.Material & {
  opacity: number
  transparent: boolean
  depthWrite: boolean
  needsUpdate: boolean
  polygonOffset: boolean
  polygonOffsetFactor: number
  polygonOffsetUnits: number
}

let dirtyPaintTexture: THREE.CanvasTexture | null = null
let dirtyGlassTexture: THREE.CanvasTexture | null = null
let carShadowTexture: THREE.CanvasTexture | null = null
let warmedModelFetch: Promise<unknown> | null = null

export function CarScene({
  reducedMotion,
  activeSection,
  activeSceneId,
  sceneProgress,
  globalProgress,
  onReadyChange,
}: CarSceneProps) {
  const [carReady, setCarReady] = useState(false)
  const { active: assetsLoading, progress } = useProgress()
  const handleCarReady = useCallback(() => {
    setCarReady(true)
    onReadyChange?.(true)
  }, [onReadyChange])

  useEffect(() => {
    setCarReady(false)
    onReadyChange?.(false)
  }, [onReadyChange])

  useEffect(() => {
    if (!carReady && (assetsLoading || progress < 100)) {
      setCarReady(false)
      onReadyChange?.(false)
    }
  }, [assetsLoading, carReady, onReadyChange, progress])

  useEffect(() => {
    if (carReady || assetsLoading || progress < 100) {
      return
    }

    let firstFrame = 0
    let secondFrame = 0

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(handleCarReady)
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [assetsLoading, carReady, handleCarReady, progress])

  useEffect(() => {
    if (typeof window === 'undefined' || warmedModelFetch) {
      return
    }

    warmedModelFetch = fetch(CLEAN_MODEL_URL, { cache: 'force-cache' }).catch(() => undefined)
  }, [])

  const lowerQuality = activeSection === 'contato' || activeSection === 'parceiros' || activeSection === 'instagram'

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 z-[1] transition-opacity duration-700 ${carReady ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_52%,rgba(212,175,55,0.14),transparent_0_32%),linear-gradient(90deg,rgba(13,27,42,0.14)_0%,rgba(13,27,42,0)_52%)]" />
        <div className="absolute right-[10vw] top-[30vh] h-[28vw] max-h-[360px] min-h-[180px] w-[44vw] max-w-[760px] min-w-[260px] rounded-[46%] bg-[radial-gradient(circle_at_50%_52%,rgba(212,175,55,0.22),rgba(212,175,55,0.08)_42%,transparent_72%)] blur-2xl" />
      </div>
      <Canvas
        frameloop="demand"
        dpr={lowerQuality ? [0.7, 0.95] : [0.8, 1]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.18
        }}
      >
        <color attach="background" args={['#0D1B2A']} />
        <fog attach="fog" args={['#0D1B2A', 8.5, 21]} />
        <Suspense fallback={<LoadingMark />}>
          <PerspectiveCamera makeDefault position={[0.35, 1.2, 5.8]} fov={34} />
          <ambientLight intensity={0.65} color="#d9e4ef" />
          <directionalLight position={[4.6, 4.2, 4.2]} intensity={2.15} color="#f5f4ef" />
          <directionalLight position={[-5.4, 2.3, -4.8]} intensity={1.8} color="#D4AF37" />
          <spotLight position={[0.8, 5.8, 2.2]} angle={0.48} penumbra={0.82} intensity={24} color="#D4AF37" />
          <Environment preset="night" resolution={64} />
          <CinematicRig
            activeSceneId={activeSceneId}
            sceneProgress={sceneProgress}
            globalProgress={globalProgress}
            reducedMotion={reducedMotion}
            onReady={handleCarReady}
          />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,27,42,0.58)_0%,rgba(13,27,42,0.24)_34%,rgba(13,27,42,0)_64%),linear-gradient(180deg,rgba(13,27,42,0)_0%,rgba(13,27,42,0.04)_62%,rgba(13,27,42,0.14)_100%)]" />
    </div>
  )
}

function CinematicRig({
  activeSceneId,
  sceneProgress,
  globalProgress,
  reducedMotion,
  onReady,
}: {
  activeSceneId: SceneId
  sceneProgress: number
  globalProgress: number
  reducedMotion: boolean
  onReady: () => void
}) {
  const cleanGltf = useGLTF(CLEAN_MODEL_URL)
  const cleanGroupRef = useRef<THREE.Group>(null)
  const dirtyGroupRef = useRef<THREE.Group>(null)
  const shadowGroupRef = useRef<THREE.Group>(null)
  const rimLightRef = useRef<THREE.PointLight>(null)
  const revealLightRef = useRef<THREE.PointLight>(null)
  const sparkleRef = useRef<THREE.Sprite>(null)
  const smoothSceneProgress = useRef(sceneProgress)
  const smoothGlobalProgress = useRef(globalProgress)
  const introReveal = useRef(0)
  const currentRotation = useRef(-0.62)
  const currentPosition = useRef(new THREE.Vector3(1.12, 0.02, -0.1))
  const targetPosition = useRef(new THREE.Vector3(1.12, 0.02, -0.1))
  const currentFov = useRef(34)
  const cleanModel = usePreparedModel(cleanGltf.scene, 'clean')
  const dirtyModel = usePreparedModel(cleanGltf.scene, 'dirty')
  const { camera, invalidate, viewport } = useThree()
  const compactViewport = viewport.width < 9
  const climaxStartedAt = useRef<number | null>(null)
  const climaxPlayed = useRef(false)
  const readyFrameCount = useRef(0)
  const readyNotified = useRef(false)

  useEffect(() => {
    readyFrameCount.current = 0
    readyNotified.current = false
  }, [onReady])

  useEffect(() => {
    invalidate()
  }, [activeSceneId, cleanGltf.scene, globalProgress, invalidate, sceneProgress])

  useEffect(() => {
    let firstFrame = 0
    let secondFrame = 0

    firstFrame = window.requestAnimationFrame(() => {
      invalidate()
      secondFrame = window.requestAnimationFrame(() => {
        if (!readyNotified.current) {
          readyNotified.current = true
          onReady()
        }
      })
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [cleanGltf.scene, invalidate, onReady])

  useEffect(() => {
    if (activeSceneId !== 'contato' || sceneProgress < 0.4 || climaxPlayed.current) {
      return
    }

    climaxStartedAt.current = performance.now()
    climaxPlayed.current = true
  }, [activeSceneId, sceneProgress])

  useFrame((_, delta) => {
    const revealDamping = reducedMotion ? 6.6 : 4.2
    introReveal.current = THREE.MathUtils.damp(introReveal.current, 1, revealDamping, delta)
    const motionSmoothing = reducedMotion ? 0.14 : 0.08
    smoothSceneProgress.current += (sceneProgress - smoothSceneProgress.current) * motionSmoothing
    smoothGlobalProgress.current += (globalProgress - smoothGlobalProgress.current) * motionSmoothing

    const sceneKeyframes = getSceneKeyframes(activeSceneId)
    const from = sceneKeyframes[0]
    const to = sceneKeyframes[1]

    if (!from || !to) {
      return
    }

    const sceneT = smoothSceneProgress.current
    const dirtProgress = THREE.MathUtils.lerp(from.dirtProgress, to.dirtProgress, sceneT)
    const cleanReveal = cinematicEase(THREE.MathUtils.smoothstep(dirtProgress, 0.06, 0.96))
    const targetRotation = THREE.MathUtils.lerp(from.rotationY, to.rotationY, sceneT)
    const targetFov = THREE.MathUtils.lerp(from.fov, to.fov, sceneT)
    targetPosition.current.set(
      THREE.MathUtils.lerp(from.position[0], to.position[0], sceneT),
      THREE.MathUtils.lerp(from.position[1], to.position[1], sceneT),
      THREE.MathUtils.lerp(from.position[2], to.position[2], sceneT),
    )

    currentRotation.current += (targetRotation - currentRotation.current) * 0.08
    currentPosition.current.lerp(targetPosition.current, 0.08)
    currentFov.current += (targetFov - currentFov.current) * 0.08

    const entranceEase = cinematicEase(introReveal.current)
    const scale = compactViewport ? 1.28 : 2.04
    const animatedScale = THREE.MathUtils.lerp(scale * 0.92, scale, entranceEase)
    const mobileOffsetX = compactViewport ? -0.58 : 0
    const mobileOffsetY = compactViewport ? -0.02 : 0
    const entranceLift = (1 - entranceEase) * 0.14

    for (const group of [cleanGroupRef.current, dirtyGroupRef.current]) {
      if (!group) {
        continue
      }

      group.rotation.y += (currentRotation.current - group.rotation.y) * motionSmoothing
      group.position.x += ((currentPosition.current.x + mobileOffsetX) - group.position.x) * motionSmoothing
      group.position.y += ((currentPosition.current.y + mobileOffsetY - entranceLift) - group.position.y) * motionSmoothing
      group.position.z += (currentPosition.current.z - group.position.z) * motionSmoothing
      group.scale.setScalar(animatedScale)
    }

    if (shadowGroupRef.current) {
      shadowGroupRef.current.rotation.y += (currentRotation.current - shadowGroupRef.current.rotation.y) * motionSmoothing
      shadowGroupRef.current.position.x += ((currentPosition.current.x + mobileOffsetX) - shadowGroupRef.current.position.x) * motionSmoothing
      shadowGroupRef.current.position.y += ((currentPosition.current.y + mobileOffsetY - 0.035 - entranceLift * 0.6) - shadowGroupRef.current.position.y) * motionSmoothing
      shadowGroupRef.current.position.z += (currentPosition.current.z - shadowGroupRef.current.position.z) * motionSmoothing
      shadowGroupRef.current.scale.setScalar(animatedScale)

      shadowGroupRef.current.children.forEach((child, index) => {
        if (!(child instanceof THREE.Mesh)) {
          return
        }

        const material = child.material as THREE.MeshBasicMaterial
        const baseOpacity = index === 0 ? 0.58 : 0.34
        material.opacity = baseOpacity * entranceEase
      })
    }

    const perspectiveCamera = camera as THREE.PerspectiveCamera
    const nextFov = perspectiveCamera.fov + (currentFov.current - perspectiveCamera.fov) * motionSmoothing
    if (Math.abs(nextFov - perspectiveCamera.fov) > 0.001) {
      perspectiveCamera.fov = nextFov
      perspectiveCamera.updateProjectionMatrix()
    }

    const dirtyOpacity = Math.max(0, 1 - cleanReveal)
    const revealEnvelope = dirtProgress > 0.04 && dirtProgress < 0.98
      ? Math.sin(cleanReveal * Math.PI)
      : 0

    if (dirtyGroupRef.current) {
      dirtyGroupRef.current.visible = dirtyOpacity > 0.015
    }

    if (cleanGroupRef.current) {
      cleanGroupRef.current.visible = true
    }

    setGroupOpacity(dirtyModel, dirtyOpacity * entranceEase, false)
    if (entranceEase < 0.995 || cleanModel.lastOpacity < 0.995) {
      setGroupOpacity(cleanModel, entranceEase, true)
    }

    const now = performance.now()
    const climaxElapsed = climaxStartedAt.current === null ? 9999 : now - climaxStartedAt.current
    const rimEnvelope = climaxElapsed < 800
      ? Math.sin((climaxElapsed / 800) * Math.PI)
      : 0
    const sparkleEnvelope = climaxElapsed < 1500
      ? Math.max(0, 1 - climaxElapsed / 1500)
      : 0

    if (rimLightRef.current) {
      rimLightRef.current.intensity = (0.8 + rimEnvelope * 9) * entranceEase
      rimLightRef.current.position.x = 2.8 - rimEnvelope * 5.2
      rimLightRef.current.position.y = 1.5 + rimEnvelope * 1.2
    }

    if (revealLightRef.current) {
      revealLightRef.current.intensity = (0.35 + revealEnvelope * 5.8) * entranceEase
      revealLightRef.current.position.x = THREE.MathUtils.lerp(2.4, -2.8, cleanReveal)
      revealLightRef.current.position.y = 1.25 + revealEnvelope * 0.75
      revealLightRef.current.position.z = 1.45
    }

    if (sparkleRef.current) {
      const revealSparkle = revealEnvelope * 0.34
      sparkleRef.current.material.opacity = Math.max(sparkleEnvelope, revealSparkle) * entranceEase
      sparkleRef.current.position.x = THREE.MathUtils.lerp(1.15, 0.28, cleanReveal)
      sparkleRef.current.position.y = 0.28 + revealEnvelope * 0.16
      sparkleRef.current.scale.setScalar(0.18 + rimEnvelope * 0.42 + revealEnvelope * 0.2)
    }

    if (!readyNotified.current && cleanGroupRef.current) {
      readyFrameCount.current += 1
      if (readyFrameCount.current >= 14 && entranceEase > 0.6) {
        readyNotified.current = true
        onReady()
      }
    }

    const isSettled =
      Math.abs(sceneProgress - smoothSceneProgress.current) < 0.0015 &&
      Math.abs(globalProgress - smoothGlobalProgress.current) < 0.0015 &&
      Math.abs(targetRotation - currentRotation.current) < 0.0015 &&
      currentPosition.current.distanceToSquared(targetPosition.current) < 0.000004 &&
      Math.abs(targetFov - currentFov.current) < 0.003 &&
      introReveal.current > 0.995

    if (!isSettled) {
      invalidate()
    }
  })

  return (
    <>
      <pointLight
        ref={rimLightRef}
        position={[2.8, 1.5, 1.6]}
        intensity={0.8}
        color="#D4AF37"
        distance={7}
      />

      <pointLight
        ref={revealLightRef}
        position={[2.4, 1.25, 1.45]}
        intensity={0.35}
        color="#f8ddb0"
        distance={5.8}
      />

      <group
        ref={shadowGroupRef}
        position={[1.12, -0.015, -0.1]}
        rotation={[0, -0.62, 0]}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0.16]} renderOrder={-2}>
          <planeGeometry args={[2.82, 6.42, 1, 1]} />
          <meshBasicMaterial
            map={getCarShadowTexture()}
            color="#020812"
            transparent
            opacity={0.58}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.16]} renderOrder={-1}>
          <planeGeometry args={[1.88, 5.76, 1, 1]} />
          <meshBasicMaterial
            map={getCarShadowTexture()}
            color="#00040a"
            transparent
            opacity={0.34}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group
        ref={dirtyGroupRef}
        position={[1.12, 0.02, -0.1]}
        rotation={[0, -0.62, 0]}
        scale={2.04}
      >
        <primitive object={dirtyModel.scene} />
      </group>

      <group
        ref={cleanGroupRef}
        position={[1.12, 0.02, -0.1]}
        rotation={[0, -0.62, 0]}
        scale={2.04}
      >
        <primitive object={cleanModel.scene} />
      </group>

      <CinematicParticleField
        globalProgress={smoothGlobalProgress}
        compactViewport={compactViewport}
      />

      <sprite ref={sparkleRef} position={[0.84, 0.28, 0.92]} scale={0.18}>
        <spriteMaterial
          color="#fff8d8"
          opacity={0}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </>
  )
}

function CinematicParticleField({
  globalProgress,
  compactViewport,
}: {
  globalProgress: MutableRefObject<number>
  compactViewport: boolean
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = compactViewport ? 42 : 96
  const positions = useMemo(() => new Float32Array(particleCount * 3), [particleCount])
  const colors = useMemo(() => new Float32Array(particleCount * 3), [particleCount])
  const seeds = useMemo(() => new Float32Array(particleCount), [particleCount])
  const frameTick = useRef(0)
  const elapsedTime = useRef(0)
  const dustColor = useMemo(() => new THREE.Color('#C59A61'), [])
  const foamColor = useMemo(() => new THREE.Color('#DDE8EA'), [])
  const dropColor = useMemo(() => new THREE.Color('#D7C7A4'), [])
  const colorScratch = useMemo(() => new THREE.Color(), [])
  const { invalidate } = useThree()

  useMemo(() => {
    for (let index = 0; index < particleCount; index += 1) {
      seeds[index] = Math.random()
      resetParticle(positions, index, seeds[index])
    }
  }, [particleCount, positions, seeds])

  useFrame((_, delta) => {
    elapsedTime.current += delta
    const progress = globalProgress.current
    const material = pointsRef.current?.material as THREE.PointsMaterial | undefined
    const geometry = pointsRef.current?.geometry

    if (!material || !geometry) {
      return
    }

    const phaseOne = THREE.MathUtils.clamp(1 - progress / 0.33, 0, 1)
    const phaseTwo = THREE.MathUtils.clamp(1 - Math.abs(progress - 0.5) / 0.17, 0, 1)
    const phaseThree = THREE.MathUtils.clamp((progress - 0.66) / 0.34, 0, 1)
    const visibleIntensity = 1 - THREE.MathUtils.smoothstep(progress, 0.82, 1)
    const updateColors = frameTick.current % 3 === 0
    frameTick.current += 1

    for (let index = 0; index < particleCount; index += 1) {
      const stride = index * 3
      const seed = seeds[index] * 12.81 + index * 0.173
      const modelWake = 0.55 + phaseOne * 0.45 + phaseTwo * 0.7 + phaseThree * 0.35
      const xDrift = Math.sin(elapsedTime.current * 1.05 + seed) * (0.005 + phaseOne * 0.01) * modelWake
      const zDrift = Math.cos(elapsedTime.current * 0.9 + seed) * (0.004 + phaseOne * 0.009) * modelWake
      const gravity = phaseTwo * 0.0035 + phaseThree * 0.007

      positions[stride] += xDrift
      positions[stride + 1] -= gravity
      positions[stride + 2] += zDrift

      const radius = Math.hypot(positions[stride] * 0.9, positions[stride + 1] * 1.45, positions[stride + 2] * 1.2)
      if (positions[stride + 1] < -0.76 || positions[stride + 1] > 0.98 || radius > 1.38) {
        resetParticle(positions, index, seeds[index])
      }

      if (updateColors) {
        colorScratch.copy(dustColor)
        if (phaseTwo > phaseOne && phaseTwo > phaseThree) {
          colorScratch.lerp(foamColor, 0.66)
        }
        if (phaseThree > phaseTwo) {
          colorScratch.lerp(dropColor, 0.72)
        }

        colors[stride] = colorScratch.r
        colors[stride + 1] = colorScratch.g
        colors[stride + 2] = colorScratch.b
      }
    }

    geometry.attributes.position.needsUpdate = true
    if (updateColors) {
      geometry.attributes.color.needsUpdate = true
    }
    material.opacity = 0.05 + visibleIntensity * 0.34
    material.size = 0.018 + phaseOne * 0.014 + phaseTwo * 0.036 + phaseThree * 0.018
    invalidate()
  })

  return (
    <points ref={pointsRef} position={[0.98, 0.42, 0.72]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        depthWrite={false}
        size={0.028}
        sizeAttenuation
        vertexColors
        opacity={0.32}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

function resetParticle(positions: Float32Array, index: number, seed: number) {
  const stride = index * 3
  const angle = seed * Math.PI * 2
  const band = (seed * 7.17) % 1
  const radius = 0.18 + band * 0.82

  positions[stride] = Math.cos(angle) * radius - 0.08
  positions[stride + 1] = -0.42 + ((seed * 11.3) % 1) * 1.08
  positions[stride + 2] = Math.sin(angle) * (0.18 + radius * 0.36)
}

function cinematicEase(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function usePreparedModel(scene: THREE.Group, variant: 'clean' | 'dirty'): PreparedMeshGroup {
  return useMemo(() => {
    const clonedScene = scene.clone(true)
    const materials: OpacityMaterial[] = []

    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }

      if (variant === 'dirty') {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        const hasDirtySurface = materials.some((material) => shouldReceiveDirtyOverlay(material.name))

        if (!hasDirtySurface) {
          child.visible = false
          return
        }
      }

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => {
          const clonedMaterial = material.clone() as OpacityMaterial
          clonedMaterial.transparent = true
          if (variant === 'dirty' && !shouldReceiveDirtyOverlay(material.name)) {
            clonedMaterial.opacity = 0
            clonedMaterial.depthWrite = false
          }
          tuneCarMaterial(clonedMaterial, variant)
          materials.push(clonedMaterial)
          return clonedMaterial
        })
        return
      }

      const clonedMaterial = child.material.clone() as OpacityMaterial
      clonedMaterial.transparent = true
      tuneCarMaterial(clonedMaterial, variant)
      child.material = clonedMaterial
      materials.push(clonedMaterial)
    })

    return { scene: clonedScene, materials, lastOpacity: -1, lastDepthWrite: null }
  }, [scene, variant])
}

function shouldReceiveDirtyOverlay(materialName: string) {
  const name = materialName.toLowerCase()
  return name.includes('paint') || name.includes('body') || name.includes('glass')
}

function tuneCarMaterial(material: OpacityMaterial, variant: 'clean' | 'dirty') {
  const physicalMaterial = material as THREE.MeshPhysicalMaterial
  const standardMaterial = material as THREE.MeshStandardMaterial
  const materialName = material.name.toLowerCase()

  if ('envMapIntensity' in standardMaterial) {
    standardMaterial.envMapIntensity = materialName.includes('paint') || materialName.includes('body')
      ? 2.45
      : materialName.includes('glass')
        ? 2.8
        : materialName.includes('wheel') || materialName.includes('badge')
          ? 2.2
          : 1.65
  }

  if (materialName.includes('paint') || materialName.includes('body')) {
    standardMaterial.metalness = Math.max(standardMaterial.metalness ?? 0, 0.78)
    standardMaterial.roughness = Math.min(standardMaterial.roughness ?? 0.5, 0.22)
    if ('clearcoat' in physicalMaterial) {
      physicalMaterial.clearcoat = Math.max(physicalMaterial.clearcoat ?? 0, 0.72)
      physicalMaterial.clearcoatRoughness = Math.min(physicalMaterial.clearcoatRoughness ?? 0.2, 0.06)
    }
  }

  if (materialName.includes('wheel') || materialName.includes('badge')) {
    standardMaterial.metalness = Math.max(standardMaterial.metalness ?? 0, 0.82)
    standardMaterial.roughness = Math.min(standardMaterial.roughness ?? 0.5, 0.24)
  }

  if (materialName.includes('glass')) {
    standardMaterial.roughness = Math.min(standardMaterial.roughness ?? 0.18, 0.08)
    if ('clearcoat' in physicalMaterial) {
      physicalMaterial.clearcoat = Math.max(physicalMaterial.clearcoat ?? 0, 0.6)
      physicalMaterial.clearcoatRoughness = Math.min(physicalMaterial.clearcoatRoughness ?? 0.2, 0.08)
    }
  }

  if (variant === 'dirty') {
    const materialWithColor = material as THREE.MeshStandardMaterial & { color?: THREE.Color }

    if (materialWithColor.color) {
      if (materialName.includes('paint') || materialName.includes('body')) {
        materialWithColor.color.set('#b78f58')
      } else if (materialName.includes('glass')) {
        materialWithColor.color.lerp(new THREE.Color('#8c806b'), 0.34)
      } else if (materialName.includes('wheel') || materialName.includes('badge')) {
        materialWithColor.color.lerp(new THREE.Color('#6d6251'), 0.18)
      }
    }

    if ('envMapIntensity' in standardMaterial) {
      standardMaterial.envMapIntensity *= materialName.includes('paint') || materialName.includes('body') ? 0.58 : 0.72
    }

    if (materialName.includes('paint') || materialName.includes('body')) {
      standardMaterial.map = getDirtyPaintTexture()
      standardMaterial.roughness = Math.max(standardMaterial.roughness ?? 0.35, 0.84)
      standardMaterial.metalness = Math.min(standardMaterial.metalness ?? 0.78, 0.28)
      if ('clearcoat' in physicalMaterial) {
        physicalMaterial.clearcoat = Math.min(physicalMaterial.clearcoat ?? 0.3, 0.08)
        physicalMaterial.clearcoatRoughness = Math.max(physicalMaterial.clearcoatRoughness ?? 0.2, 0.76)
      }
    }

    if (materialName.includes('glass')) {
      standardMaterial.map = getDirtyGlassTexture()
      standardMaterial.roughness = Math.max(standardMaterial.roughness ?? 0.18, 0.68)
      if ('envMapIntensity' in standardMaterial) {
        standardMaterial.envMapIntensity *= 0.42
      }
      if ('clearcoat' in physicalMaterial) {
        physicalMaterial.clearcoat = Math.min(physicalMaterial.clearcoat ?? 0.3, 0.12)
        physicalMaterial.clearcoatRoughness = Math.max(physicalMaterial.clearcoatRoughness ?? 0.2, 0.72)
      }
    }

    material.polygonOffset = true
    material.polygonOffsetFactor = -1
    material.polygonOffsetUnits = -1
  }

  material.needsUpdate = true
}

function getDirtyPaintTexture() {
  if (dirtyPaintTexture) {
    return dirtyPaintTexture
  }

  const canvas = document.createElement('canvas')
  canvas.width = 384
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) {
    dirtyPaintTexture = new THREE.CanvasTexture(canvas)
    return dirtyPaintTexture
  }

  context.fillStyle = '#c6a06b'
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let index = 0; index < 1700; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = 0.45 + Math.random() * 2.8
    const alpha = 0.05 + Math.random() * 0.22
    context.fillStyle = Math.random() > 0.34
      ? `rgba(92, 70, 45, ${alpha})`
      : `rgba(226, 202, 156, ${alpha * 0.9})`
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  for (let index = 0; index < 26; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height * 0.62
    const length = 46 + Math.random() * 170
    const width = 1 + Math.random() * 4
    const gradient = context.createLinearGradient(x, y, x + 8, y + length)
    gradient.addColorStop(0, 'rgba(80, 57, 36, 0)')
    gradient.addColorStop(0.22, 'rgba(80, 57, 36, 0.2)')
    gradient.addColorStop(1, 'rgba(80, 57, 36, 0)')
    context.strokeStyle = gradient
    context.lineWidth = width
    context.beginPath()
    context.moveTo(x, y)
    context.bezierCurveTo(x + 8, y + length * 0.25, x - 10, y + length * 0.68, x + 4, y + length)
    context.stroke()
  }

  dirtyPaintTexture = new THREE.CanvasTexture(canvas)
  dirtyPaintTexture.colorSpace = THREE.SRGBColorSpace
  dirtyPaintTexture.wrapS = THREE.RepeatWrapping
  dirtyPaintTexture.wrapT = THREE.RepeatWrapping
  dirtyPaintTexture.repeat.set(2.6, 1.35)
  dirtyPaintTexture.needsUpdate = true
  return dirtyPaintTexture
}

function getDirtyGlassTexture() {
  if (dirtyGlassTexture) {
    return dirtyGlassTexture
  }

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) {
    dirtyGlassTexture = new THREE.CanvasTexture(canvas)
    return dirtyGlassTexture
  }

  const baseGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  baseGradient.addColorStop(0, '#7f7664')
  baseGradient.addColorStop(0.52, '#c0aa82')
  baseGradient.addColorStop(1, '#6f604a')
  context.fillStyle = baseGradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let index = 0; index < 900; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = 0.35 + Math.random() * 2.2
    const alpha = 0.04 + Math.random() * 0.18
    context.fillStyle = Math.random() > 0.42
      ? `rgba(73, 55, 36, ${alpha})`
      : `rgba(221, 205, 170, ${alpha})`
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  for (let index = 0; index < 18; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height * 0.28
    const length = 72 + Math.random() * 210
    const gradient = context.createLinearGradient(x, y, x + 4, y + length)
    gradient.addColorStop(0, 'rgba(235, 220, 184, 0)')
    gradient.addColorStop(0.2, 'rgba(235, 220, 184, 0.18)')
    gradient.addColorStop(1, 'rgba(86, 62, 38, 0)')
    context.strokeStyle = gradient
    context.lineWidth = 1 + Math.random() * 3
    context.beginPath()
    context.moveTo(x, y)
    context.bezierCurveTo(x + 5, y + length * 0.35, x - 7, y + length * 0.65, x + 2, y + length)
    context.stroke()
  }

  dirtyGlassTexture = new THREE.CanvasTexture(canvas)
  dirtyGlassTexture.colorSpace = THREE.SRGBColorSpace
  dirtyGlassTexture.wrapS = THREE.RepeatWrapping
  dirtyGlassTexture.wrapT = THREE.RepeatWrapping
  dirtyGlassTexture.repeat.set(1.85, 1.2)
  dirtyGlassTexture.needsUpdate = true
  return dirtyGlassTexture
}

function getCarShadowTexture() {
  if (carShadowTexture) {
    return carShadowTexture
  }

  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) {
    carShadowTexture = new THREE.CanvasTexture(canvas)
    return carShadowTexture
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  const mainShadow = context.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.height * 0.04,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.5,
  )
  mainShadow.addColorStop(0, 'rgba(0, 0, 0, 0.82)')
  mainShadow.addColorStop(0.38, 'rgba(0, 0, 0, 0.44)')
  mainShadow.addColorStop(0.72, 'rgba(0, 0, 0, 0.16)')
  mainShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')

  context.fillStyle = mainShadow
  context.fillRect(0, 0, canvas.width, canvas.height)

  const wheelCenters = [0.18, 0.48, 0.78]
  for (const center of wheelCenters) {
    const wheelShadow = context.createRadialGradient(
      canvas.width * center,
      canvas.height * 0.52,
      canvas.height * 0.02,
      canvas.width * center,
      canvas.height * 0.52,
      canvas.height * 0.34,
    )
    wheelShadow.addColorStop(0, 'rgba(0, 0, 0, 0.66)')
    wheelShadow.addColorStop(0.55, 'rgba(0, 0, 0, 0.22)')
    wheelShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = wheelShadow
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  carShadowTexture = new THREE.CanvasTexture(canvas)
  carShadowTexture.colorSpace = THREE.SRGBColorSpace
  carShadowTexture.wrapS = THREE.ClampToEdgeWrapping
  carShadowTexture.wrapT = THREE.ClampToEdgeWrapping
  carShadowTexture.needsUpdate = true
  return carShadowTexture
}

function setGroupOpacity(model: PreparedMeshGroup, opacity: number, keepDepthWrite: boolean) {
  if (Math.abs(model.lastOpacity - opacity) < 0.003 && model.lastDepthWrite === keepDepthWrite) {
    return
  }

  model.lastOpacity = opacity
  model.lastDepthWrite = keepDepthWrite

  model.materials.forEach((material) => {
    material.opacity = opacity
    const shouldBeTransparent = opacity < 0.985
    if (material.transparent !== shouldBeTransparent) {
      material.transparent = shouldBeTransparent
      material.needsUpdate = true
    }
    if (material.depthWrite !== keepDepthWrite) {
      material.depthWrite = keepDepthWrite
    }
  })
}

function LoadingMark() {
  return (
    <Html center>
      <div className="rounded-2xl border border-white/10 bg-brand-graphite/88 px-6 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div className="font-['Eurostile_Extended','Montserrat',sans-serif] text-[0.95rem] uppercase tracking-[0.28em] text-brand-gold">
          {'Carregando 3D'}
        </div>
      </div>
    </Html>
  )
}

useGLTF.preload(CLEAN_MODEL_URL)
