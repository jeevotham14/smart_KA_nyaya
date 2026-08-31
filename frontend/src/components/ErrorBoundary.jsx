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
        <div style={{ padding: '20px', background: '#fee', border: '1px solid #fcc', color: '#c00', borderRadius: '8px', margin: '10px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details (Please screenshot this)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
