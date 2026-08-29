'use client';

import { Component, type ReactNode } from 'react';
import { t } from '@/lib/i18n';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    /* v8 ignore next 3 */
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-surface-desk border border-rule-mist max-w-md p-6 rounded-lg shadow-sm w-full">
            <h2 className="font-bold mb-2 text-foreground text-xl">
              {t('common.somethingWentWrong')}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {this.state.error?.message || t('common.unexpectedError')}
            </p>
            <div className="flex gap-3">
              <Button onClick={this.handleReset}>{t('common.tryAgain')}</Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (globalThis.window !== undefined) {
                    globalThis.location.assign('/');
                  }
                }}
              >
                {t('common.goHome')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
