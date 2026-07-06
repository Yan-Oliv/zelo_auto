import { DebugCrossfadePage } from '@features/debug/pages/DebugCrossfadePage'
import { DebugModelPage } from '@features/debug/pages/DebugModelPage'
import { LandingPage } from '@features/landing/LandingPage'
import { DevMotionToggle } from '@shared/components/DevMotionToggle'

function App() {
  const pathname = window.location.pathname

  if (pathname === '/debug-model') {
    return (
      <>
        <DebugModelPage />
        <DevMotionToggle />
      </>
    )
  }

  if (pathname === '/debug-crossfade') {
    return (
      <>
        <DebugCrossfadePage />
        <DevMotionToggle />
      </>
    )
  }

  return <LandingPage />
}

export default App
