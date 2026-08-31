import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCw, Home, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCopyError = () => {
    if (this.state.error) {
      const details = `${this.state.error.name}: ${this.state.error.message}\n\nStack:\n${this.state.error.stack || ''}`;
      navigator.clipboard.writeText(details);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#e9eef5] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 transition-colors">
          <div className="relative w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-red-200 dark:border-red-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp">
            
            {/* Header with Icon */}
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 shrink-0">
                <AlertOctagon className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 font-mono">
                  Erro de Execução • 500
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  Ocorreu uma falha no sistema
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              O sistema encontrou um erro inesperado ao carregar esta página. Seus dados cadastrados permanecem salvos em segurança.
            </p>

            {/* Error Message Box */}
            {this.state.error && (
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 dark:bg-slate-950 border border-slate-800 text-xs font-mono overflow-hidden space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-800">
                  <span>Detalhes técnicos:</span>
                  <button
                    onClick={this.handleCopyError}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-sans cursor-pointer transition-colors"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar erro</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto text-red-400 break-words custom-scrollbar">
                  {this.state.error.toString()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 rounded-xl py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <RotateCw className="w-4 h-4 stroke-[2.5]" />
                <span>Recarregar Sistema</span>
              </Button>

              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:flex-1 font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-amber-500" />
                <span>Voltar ao Início</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
