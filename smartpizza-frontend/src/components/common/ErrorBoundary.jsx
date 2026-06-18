import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '3rem', minHeight: 400, textAlign: 'center'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <AlertTriangle size={36} style={{ color: '#dc3545' }} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Something went wrong
          </h4>
          <p style={{ color: 'var(--sp-text-muted)', marginBottom: '2rem', maxWidth: 400, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-pizza" style={{ gap: '0.5rem' }}>
            <RefreshCw size={16} /> Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
