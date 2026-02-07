import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ChatErrorBoundary]", error, errorInfo)
    // 자동 복구: 에러 발생 시 re-mount하여 FAB 다시 표시
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
