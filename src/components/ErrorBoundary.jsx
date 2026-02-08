import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined') {
      console.error('ErrorBoundary caught an error:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary