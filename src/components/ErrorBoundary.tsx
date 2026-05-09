import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time exceptions inside the trial dashboard so a single
 * crashing component doesn't blank the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface the real error in the console for debugging
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="panel p-6">
            <div className="flex items-center gap-2 text-risk-critical">
              <AlertTriangle className="h-4 w-4" />
              <h2 className="text-base font-semibold">
                {this.props.fallbackTitle ?? "Something rendered wrong"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              The page hit an unrecoverable error while rendering. The full
              trace is in your browser console.
            </p>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-border bg-bg-elevated/60 p-3 text-[11px] text-slate-300 whitespace-pre-wrap break-words">
              {this.state.error.stack ?? this.state.error.message}
            </pre>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={this.reset}
                className="btn-secondary"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
