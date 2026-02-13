/**
 * ErrorBoundary Component - Catches React errors and displays fallback UI
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-forensics-bg flex items-center justify-center p-6">
          <motion.div
            className="max-w-2xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-forensics-bg-light border-2 border-red-500 rounded-lg p-8">
              <motion.div
                className="text-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span className="text-8xl">⚠️</span>
              </motion.div>

              <h1 className="text-3xl font-bold text-red-500 font-mono text-center mb-4">
                ERREUR SYSTÈME
              </h1>

              <p className="text-gray-300 font-mono text-center mb-6">
                Une erreur inattendue s'est produite dans l'application.
              </p>

              {this.state.error && (
                <div className="bg-red-500/10 border border-red-500 rounded p-4 mb-6">
                  <p className="text-red-400 font-mono text-sm break-words">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                </div>
              )}

              {import.meta.env.MODE === 'development' && this.state.errorInfo && (
                <details className="bg-forensics-bg border border-forensics-cyan-dark rounded p-4 mb-6">
                  <summary className="text-forensics-cyan font-mono text-sm cursor-pointer">
                    Stack Trace (Dev Only)
                  </summary>
                  <pre className="text-xs text-gray-400 font-mono mt-3 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-red-500 text-white font-mono font-bold py-3 rounded hover:bg-red-600 transition-colors"
                >
                  🔄 RECHARGER L'APPLICATION
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-700 text-white font-mono font-bold py-3 rounded hover:bg-gray-600 transition-colors"
                >
                  ← RETOUR
                </button>
              </div>

              <p className="text-gray-500 font-mono text-xs text-center mt-6">
                Si le problème persiste, veuillez contacter le support technique.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
