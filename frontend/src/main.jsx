import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EventFlow AI ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-xl font-bold">
              ⚡
            </div>
            <h1 className="text-xl font-black font-heading text-white tracking-tight">
              EventFlow AI Telemetry Recovery
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected runtime error occurred during digital twin rendering. Click below to clear state and reload cleanly.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-32 border border-slate-800">
                {String(this.state.error?.message || this.state.error)}
              </div>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Reset & Reload Baseline Digital Twin
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
