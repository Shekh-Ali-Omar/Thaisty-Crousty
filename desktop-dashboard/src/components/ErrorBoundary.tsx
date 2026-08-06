import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FATAL RENDER ERROR:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center overflow-auto">
          <div className="max-w-4xl w-full glass p-10 rounded-[2.5rem] border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-red-500">⚠</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Renderer Process Crash</h1>
            <p className="text-red-400 font-bold mb-8">{this.state.error?.message || 'Unknown Error'}</p>
            
            <div className="bg-black/50 p-6 rounded-2xl text-left overflow-auto max-h-[40vh] mb-8 border border-white/5">
                <p className="text-[10px] font-black uppercase text-white/20 mb-3 tracking-widest">Stack Trace</p>
                <pre className="text-[11px] text-white/40 font-mono leading-relaxed whitespace-pre-wrap italic">
                    {this.state.error?.stack}
                    {"\n\nComponent Stack:\n"}
                    {this.state.errorInfo?.componentStack}
                </pre>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="flex-1 px-8 py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(255,140,0,0.2)]"
                >
                    Hard Reload
                </button>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="px-8 py-5 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                >
                    Clear Cache & Reload
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
