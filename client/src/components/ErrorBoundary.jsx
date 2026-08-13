import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ApplyIQ crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-4">
        <div className="max-w-md rounded-xl border border-white/10 bg-navy-light/40 p-8 text-center">
          <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">
            ApplyIQ hit an unexpected error. Reloading usually fixes it — if it keeps happening, let us know what
            you were doing.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-electric px-4 py-2 text-sm font-semibold text-navy hover:bg-electric-light"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
