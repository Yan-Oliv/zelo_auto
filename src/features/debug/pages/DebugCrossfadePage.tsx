import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'
import iconLogo from '@assets/logos/zelo_icon_png.png'

const CLEAN_MODEL_URL = '/models/lincoln.glb'
const DIRTY_MODEL_URL = '/models/lincoln-dirty.glb'

type OpacityMaterial = THREE.Material & {
  opacity: number
  transparent: boolean
  depthWrite: boolean
  needsUpdate: boolean
}

export function DebugCrossfadePage() {
  const [dirtProgress, setDirtProgress] = useState(0)

  return (
    <div className="min-h-screen bg-brand-navy text-brand-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-8 lg:px-8">
        <div>
          <div className="eyebrow">DEBUG CROSSFADE</div>
          <h1 className="mt-4 text-3xl uppercase tracking-[0.14em]">Dirty → Clean GLB Blend</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-silver">
            Slider manual para validar 0%, 50% e 100% do crossfade entre os dois modelos.
          </p>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-brand-graphite/72 px-5 py-5">
          <label className="block text-[11px] uppercase tracking-[0.28em] text-brand-gold">
            Dirt Progress: {Math.round(dirtProgress * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={dirtProgress}
            onChange={(event) => setDirtProgress(Number(event.target.value))}
            className="mt-4 w-full"
          />
        </div>

        <div className="debug-canvas-shell">
          <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
            <color attach="background" args={['#0D1B2A']} />
            <Suspense fallback={<DebugLoading />}>
              <PerspectiveCamera makeDefault position={[0.6, 1.4, 8.4]} fov={28} />
              <ambientLight intensity={0.68} color="#dde6f2" />
              <directionalLight position={[4, 4, 4]} intensity={2.2} color="#f5f4ef" />
              <directionalLight position={[-5, 2, -4]} intensity={1.7} color="#D4AF37" />
              <spotLight position={[0.6, 5, 2]} angle={0.52} penumbra={0.85} intensity={26} color="#D4AF37" />
              <Environment preset="night" />
              <DebugCrossfadeModel dirtProgress={dirtProgress} />
              <OrbitControls enablePan={false} minDistance={5.5} maxDistance={12} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  )
}

function DebugCrossfadeModel({ dirtProgress }: { dirtProgress: number }) {
  const cleanGltf = useGLTF(CLEAN_MODEL_URL)
  const dirtyGltf = useGLTF(DIRTY_MODEL_URL)
  const cleanModel = usePreparedModel(cleanGltf.scene)
  const dirtyModel = usePreparedModel(dirtyGltf.scene)

  useEffect(() => {
    setGroupOpacity(dirtyModel, Math.max(0, 1 - dirtProgress), false)
    setGroupOpacity(cleanModel, Math.max(0, dirtProgress), true)
  }, [cleanModel, dirtProgress, dirtyModel])

  return (
    <>
      <group position={[1.4, -1.55, 0]} rotation={[0, -0.6, 0]} scale={1.45}>
        <primitive object={dirtyModel.scene} />
      </group>
      <group position={[1.4, -1.55, 0]} rotation={[0, -0.6, 0]} scale={1.45}>
        <primitive object={cleanModel.scene} />
      </group>
    </>
  )
}

function usePreparedModel(scene: THREE.Group) {
  return useMemo(() => {
    const clonedScene = scene.clone(true)
    const materials: OpacityMaterial[] = []

    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => {
          const clonedMaterial = material.clone() as OpacityMaterial
          clonedMaterial.transparent = true
          materials.push(clonedMaterial)
          return clonedMaterial
        })
        return
      }

      const clonedMaterial = child.material.clone() as OpacityMaterial
      clonedMaterial.transparent = true
      child.material = clonedMaterial
      materials.push(clonedMaterial)
    })

    return { scene: clonedScene, materials }
  }, [scene])
}

function setGroupOpacity(
  model: { materials: OpacityMaterial[] },
  opacity: number,
  keepDepthWrite: boolean,
) {
  model.materials.forEach((material) => {
    material.opacity = opacity
    material.depthWrite = keepDepthWrite
    material.needsUpdate = true
  })
}

function DebugLoading() {
  return (
    <Html center>
      <div className="border border-white/10 bg-brand-graphite/92 px-5 py-5 backdrop-blur-xl">
        <img src={iconLogo} alt="" className="h-14 w-14 animate-pulse object-contain" />
      </div>
    </Html>
  )
}

useGLTF.preload(CLEAN_MODEL_URL)
useGLTF.preload(DIRTY_MODEL_URL)
