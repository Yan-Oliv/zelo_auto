import { lazy, Suspense } from 'react'
import { LandingPage } from '@features/landing/LandingPage'
import { ErrorPage } from '@shared/errors/ErrorPage'

const DebugCrossfadePage = lazy(async () => {
  const [module, motion] = await Promise.all([import('@features/debug/pages/DebugCrossfadePage'), import('framer-motion')])
  return { default: () => <motion.LazyMotion features={motion.domAnimation} strict><module.DebugCrossfadePage /></motion.LazyMotion> }
})

const DebugModelPage = lazy(async () => {
  const [module, motion] = await Promise.all([import('@features/debug/pages/DebugModelPage'), import('framer-motion')])
  return { default: () => <motion.LazyMotion features={motion.domAnimation} strict><module.DebugModelPage /></motion.LazyMotion> }
})

function App() {
  // Only these known routes accept one trailing slash. Unknown URLs never render the landing.
  const pathname = window.location.pathname.replace(/\/$/, '') || '/'

  if (pathname === '/debug-model') {
    return (
      <Suspense fallback={null}>
        <DebugModelPage />
      </Suspense>
    )
  }

  if (pathname === '/debug-crossfade') {
    return (
      <Suspense fallback={null}>
        <DebugCrossfadePage />
      </Suspense>
    )
  }

  return pathname === '/' ? <LandingPage /> : <ErrorPage code={404} />
}

export default App
