import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  isChunkError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

function isChunkLoadError(error: Error): boolean {
  return (
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.message?.includes('error loading dynamically imported module')
  );
}

const CHUNK_RELOAD_KEY = 'chunk_reload_attempted';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isChunkError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, isChunkError: isChunkLoadError(error), error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('Uncaught error:', error, errorInfo);

    if (isChunkLoadError(error)) {
      // Reload automático uma vez para buscar os novos chunks após deploy
      const alreadyAttempted = sessionStorage.getItem(CHUNK_RELOAD_KEY);

      if (!alreadyAttempted) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
      }
    }
  }

  handleManualReload = () => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    window.location.reload();
  };

  render() {
    const { children = null } = this.props;
    const { error, errorInfo, hasError, isChunkError } = this.state;

    if (hasError) {
      if (isChunkError) {
        return (
          <div className="bg-white p-6 flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-semibold">Nova versão disponível</h1>
            <p className="text-base text-gray-600 text-center max-w-md">O sistema foi atualizado. Por favor, atualize a página para continuar.</p>
            <button
              type="button"
              onClick={this.handleManualReload}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Atualizar página
            </button>
          </div>
        );
      }

      return (
        <div className="bg-white p-6">
          <h1 className="text-2xl font-semibold">Something went wrong.</h1>
          <p className="text-base whitespace-pre-wrap">
            {error && error.toString()}
            <br />
            {errorInfo && errorInfo.componentStack}
          </p>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
