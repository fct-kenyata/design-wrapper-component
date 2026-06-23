import React from 'react';
import { TriangleAlert, RotateCcw, RefreshCw, ChevronRight } from 'lucide-react';

/**
 * ErrorBoundary — catches runtime render errors and shows a recovery screen.
 * Redesigned onto the shadcn token system to match Error404Page: a centered
 * Card on `bg-background`, theme-aware (light + dark), with a destructive accent
 * and token-styled buttons (kept dependency-light so the boundary stays robust
 * even when other components are implicated in the error).
 *
 * Props: { children, fallback?: ReactNode | (({error, errorInfo, onReset, onReload}) => ReactNode) }
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showStack: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => window.location.reload();
  handleReset = () => this.setState({ hasError: false, error: null, errorInfo: null, showStack: false });
  toggleStack = () => this.setState((s) => ({ showStack: !s.showStack }));

  render() {
    const { hasError, error, errorInfo, showStack } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback({ error, errorInfo, onReset: this.handleReset, onReload: this.handleReload })
        : fallback;
    }

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 320px at 18% 12%, color-mix(in oklab, var(--destructive) 8%, transparent), transparent 60%), radial-gradient(600px 320px at 85% 88%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 60%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-8" />
          </div>

          <span className="mb-3 inline-block rounded-full border border-border bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
            Runtime Error
          </span>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Something went wrong</h1>

          <p className="mx-auto mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            An unexpected error occurred. Your data is safe and other services are running normally.
          </p>

          {error && (
            <div className="mb-4 overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-left">
              <code className="block break-words font-mono text-xs leading-relaxed text-destructive">
                {error.toString()}
              </code>
            </div>
          )}

          {errorInfo?.componentStack && (
            <div className="mb-5 text-left">
              <button
                type="button"
                onClick={this.toggleStack}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronRight className={`size-3.5 transition-transform ${showStack ? 'rotate-90' : ''}`} />
                {showStack ? 'Hide' : 'Show'} component stack
              </button>
              {showStack && (
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/50 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {errorInfo.componentStack.trim()}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RotateCcw className="size-4" />
              Try Again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className="size-4" />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
