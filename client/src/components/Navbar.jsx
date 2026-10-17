import React from 'react';

export default function Navbar({ materialTitle, onReset }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-light/50 px-6 lg:px-10 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-xl text-primary tracking-tight leading-none">StudyBuddy</h1>
              <span className="material-symbols-outlined text-secondary text-[16px]">auto_awesome</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">Seu aprendizado, mais inteligente.</p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-surface text-primary border border-secondary/20 ml-2">
          <span className="material-symbols-outlined text-[15px] text-primary">auto_awesome</span>
          <span className="text-xs font-bold tracking-wide uppercase">Assistente Ativo</span>
        </div>
      </div>

      {/* Header Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-lg border border-outline-light/60 text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-emerald-success animate-ping"></span>
          <span className="font-semibold text-on-surface">Material em foco:</span>
          <span className="truncate max-w-[200px] text-primary font-medium" id="header-mat-label">
            {materialTitle || 'Fotossíntese e Respiração...'}
          </span>
        </div>

        <button
          onClick={onReset}
          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-accent-surface transition-colors"
          title="Reiniciar Área de Estudo"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-outline-light/80">
          <div className="w-9 h-9 rounded-full bg-emerald-success text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-emerald-light">
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-on-surface leading-tight">Estudante Livre</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-light text-emerald-success border border-emerald-border/60">
                100% Free
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Sem planos pagos • Acesso Ilimitado
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
