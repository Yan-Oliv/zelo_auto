import { DebugCrossfadePage } from '@features/debug/pages/DebugCrossfadePage'
import { DebugModelPage } from '@features/debug/pages/DebugModelPage'
import { LandingPage } from '@features/landing/LandingPage'

function App() {
  const pathname = window.location.pathname

  if (pathname === '/debug-model') {
    return <DebugModelPage />
  }

  if (pathname === '/debug-crossfade') {
    return <DebugCrossfadePage />
  }

  return <LandingPage />
}

export default App
