import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: 48, gap: 16,
          color: 'var(--color-text-secondary)',
        }}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <h2 style={{ color: 'var(--color-text-primary)', margin: 0 }}>Algo salió mal</h2>
          <p style={{ margin: 0, fontSize: 14, textAlign: 'center' }}>
            {this.state.error?.message ?? 'Error inesperado en este componente.'}
          </p>
          <button
            style={{
              background: 'var(--color-primary, #3b82f6)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '10px 20px',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
