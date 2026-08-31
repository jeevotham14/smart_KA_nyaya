import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, () => this.setState({ hasError: false, error: null, errorInfo: null }))
          : this.props.fallback;
      }
      const title = this.props.fallbackTitle || 'Something went wrong.';
      return (
        <div style={{ padding: '24px', background: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', borderRadius: '12px', margin: '20px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h2>
          <p style={{ fontSize: '14px', color: '#742a2a', marginBottom: '16px' }}>
            An unexpected error occurred during rendering. You can reload the page or return to the portal.
          </p>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', background: '#c53030', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              Reload Page
            </button>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              style={{ padding: '8px 16px', background: '#2d3748', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              Clear Session & Return Home
            </button>
          </div>
          <details open style={{ whiteSpace: 'pre-wrap', marginTop: '10px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#2d3748' }}>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer', color: '#c53030', marginBottom: '8px' }}>
              Error Details:
            </summary>
            {this.state.error && (
              <div style={{ fontWeight: 'bold', color: '#e53e3e', marginBottom: '8px' }}>
                {this.state.error.toString()}
              </div>
            )}
            {this.state.errorInfo && (
              <div style={{ color: '#718096', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.4' }}>
                {this.state.errorInfo.componentStack}
              </div>
            )}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
