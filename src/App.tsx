import { lazy, Suspense } from 'react'
import { LandingPage } from '@features/landing/LandingPage'

const DebugCrossfadePage = lazy(async () => {
  const module = await import('@features/debug/pages/DebugCrossfadePage')
  return { default: module.DebugCrossfadePage }
})

const DebugModelPage = lazy(async () => {
  const module = await import('@features/debug/pages/DebugModelPage')
  return { default: module.DebugModelPage }
})

function App() {
  const pathname = window.location.pathname

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

  return <LandingPage />
}

export default App
