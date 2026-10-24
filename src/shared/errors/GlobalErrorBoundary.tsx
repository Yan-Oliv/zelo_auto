import { Component, Fragment } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorPage } from './ErrorPage'

type Props = { children: ReactNode }
type State = { failed: boolean; attempt: number }

/** Last resort for render/provider/lazy failures. Async APIs keep their local fallbacks. */
export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, attempt: 0 }

  static getDerivedStateFromError(): Partial<State> { return { failed: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('[Zelo] React render failure', error, info)
    else console.error('[Zelo] APP_RENDER_FAILED')
  }

  private retry = () => {
    this.setState(({ attempt }) => ({ failed: false, attempt: attempt + 1 }))
  }

  render() {
    return this.state.failed
      ? <ErrorPage code={500} onRetry={this.retry} />
      : <Fragment key={this.state.attempt}>{this.props.children}</Fragment>
  }
}
