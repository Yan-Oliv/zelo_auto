import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Html, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import iconLogo from '@assets/logos/zelo_icon_png.png'

const MODEL_URL = '/models/lincoln.glb'

export function DebugModelPage() {
  return (
    <div className="min-h-screen bg-brand-navy text-brand-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-8 lg:px-8">
        <div>
          <div className="eyebrow">DEBUG MODEL</div>
          <h1 className="mt-4 text-3xl uppercase tracking-[0.14em]">Lincoln GLB isolado</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-silver">
            Esta rota monta apenas o canvas, o modelo e OrbitControls. Sem shader, sem partículas e sem lógica de scroll.
          </p>
        </div>

        <div className="debug-canvas-shell">
          <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
            <color attach="background" args={['#0D1B2A']} />
            <Suspense fallback={<DebugLoading />}>
              <PerspectiveCamera makeDefault position={[0.6, 1.4, 8.4]} fov={30} />
              <ambientLight intensity={0.7} color="#dde6f2" />
              <directionalLight position={[4, 4, 4]} intensity={2.2} color="#f5f4ef" />
              <directionalLight position={[-5, 2, -4]} intensity={1.7} color="#D4AF37" />
              <spotLight position={[0, 5, 2]} angle={0.52} penumbra={0.85} intensity={26} color="#D4AF37" />
              <Environment preset="night" />
              <DebugModel />
              <OrbitControls enablePan={false} minDistance={5.5} maxDistance={12} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  )
}

function DebugModel() {
  const gltf = useGLTF(MODEL_URL)

  return (
    <group position={[1.4, -1.55, 0]} rotation={[0, -0.6, 0]} scale={1.45}>
      <primitive object={gltf.scene.clone(true)} />
    </group>
  )
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

useGLTF.preload(MODEL_URL)
