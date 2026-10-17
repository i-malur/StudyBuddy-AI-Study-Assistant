import React, { useRef } from 'react';

export default function StudyInputPanel({
  title,
  setTitle,
  content,
  setContent,
  attachedFile,
  setAttachedFile,
  activeMode,
  setActiveMode,
  onGenerate,
  isGenerating,
  onFocusTutor,
  onFileUpload,
  isUploading,
  uploadError
}) {
  const fileInputRef = useRef(null);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const MODES = [
    {
      id: 'summary',
      title: 'Resumo',
      desc: 'Síntese dos tópicos principais',
      icon: 'summarize',
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      desc: 'Perguntas e respostas de revisão',
      icon: 'style',
    },
    {
      id: 'quiz',
      title: 'Quiz',
      desc: 'Questões de múltipla escolha',
      icon: 'quiz',
    },
    {
      id: 'explain',
      title: 'Explicar',
      desc: 'Tire dúvidas didáticas',
      icon: 'psychology_alt',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Greeting & Context Banner */}
      <div className="bg-gradient-to-r from-accent-surface via-surface-card to-surface-muted border border-secondary/20 rounded-2xl p-5 shadow-soft flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 text-primary text-xs font-bold uppercase tracking-wider border border-secondary/30">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Painel de Produtividade</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-light text-emerald-success text-xs font-bold border border-emerald-border/60">
                <span className="material-symbols-outlined text-[13px]">volunteer_activism</span>
                <span>Plataforma 100% Gratuita e Aberta para Estudantes</span>
              </span>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-emerald-success border border-emerald-border/60 flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Motor IA Groq Ativo</span>
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-primary tracking-tight">O que vamos estudar hoje?</h2>
          <p className="text-sm text-on-surface-variant mt-0.5 max-w-xl">
            Transforme suas anotações em resumos claros, flashcards ativos ou quizzes com inteligência artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 border-t border-secondary/20">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-white/90 border border-outline-light/70 hover:border-secondary transition-all flex items-start gap-2.5 shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-surface text-primary flex items-center justify-center shrink-0 font-bold">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">1. Anexar PDFs ou Arquivos</h4>
              <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                Arraste ou selecione resumos e apostilas de aula
              </p>
            </div>
          </div>

          <div
            onClick={() => document.getElementById('study-content')?.focus()}
            className="p-3 rounded-xl bg-white/90 border border-outline-light/70 hover:border-secondary transition-all flex items-start gap-2.5 shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-muted text-primary flex items-center justify-center shrink-0 font-bold">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">2. Digitar ou Colar Anotações</h4>
              <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                Escreva livremente suas ideias, tópicos e dúvidas
              </p>
            </div>
          </div>

          <div
            onClick={onFocusTutor}
            className="p-3 rounded-xl bg-accent-surface/60 border border-secondary/40 hover:border-secondary transition-all flex items-start gap-2.5 shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 font-bold">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-primary">3. Perguntar Direto ao Tutor IA</h4>
              <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                Diálogo instantâneo ao lado sem precisar colar notas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Entrada e Configurações de Geração */}
      <div className="bg-surface-card rounded-2xl border border-outline-light/80 p-5 shadow-soft flex flex-col gap-4">
        {/* Título do Material */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5" htmlFor="study-title">
            <span className="material-symbols-outlined text-[16px] text-primary">bookmark</span>
            <span>Título do material (opcional)</span>
          </label>
          <input
            className="w-full bg-surface-muted border border-outline-light/70 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            id="study-title"
            placeholder="Ex: Fotossíntese e Respiração Celular"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Conteúdo de Estudo (PDF & Dropzone) */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-muted/60 border border-outline-light/70">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">upload_file</span>
              <span>Envio de Material Didático (PDF / Docs)</span>
            </label>
            <span className="text-[11px] font-bold text-emerald-success bg-emerald-light px-2 py-0.5 rounded-full border border-emerald-border/50 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>Leitor de PDF Ativo</span>
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf"
            className="hidden"
          />

          {/* Dropzone Container */}
          {!attachedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  onFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="relative rounded-xl border-2 border-dashed border-secondary/40 hover:border-primary bg-accent-surface/30 hover:bg-accent-surface/50 p-5 text-center flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group shadow-xs"
              id="pdf-dropzone"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-8 h-8 rounded-full border-3 border-accent-surface border-t-primary animate-spin"></div>
                  <span className="text-xs font-bold text-primary">Extraindo conteúdo do PDF...</span>
                </div>
              ) : (
                <>
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center shadow-xs border border-secondary/20 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[26px] text-primary">cloud_upload</span>
                    </div>
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded bg-primary text-white text-[9px] font-extrabold uppercase shadow-xs tracking-wider">
                      PDF
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      Arraste e solte seus PDFs ou anotações aqui
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Suporta arquivos PDF, DOCX, TXT até 25MB • 100% Gratuito
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-accent-surface text-primary border border-secondary/40 hover:border-secondary font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">folder_open</span>
                      <span>Selecionar arquivo do computador</span>
                    </button>
                    <span className="text-[11px] text-outline font-medium">ou cole texto abaixo</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-secondary/30 shadow-xs text-xs" id="attached-pdf-card">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-accent-surface text-primary flex items-center justify-center shrink-0 border border-secondary/20">
                  <span className="material-symbols-outlined text-[20px] text-primary">picture_as_pdf</span>
                </div>
                <div className="flex flex-col text-left truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-on-surface truncate text-xs">{attachedFile.name}</span>
                    <span className="text-[10px] font-bold text-emerald-success bg-emerald-light px-2 py-0.2 rounded-full border border-emerald-border/40 shrink-0 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span> Pronto para analisar
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    {attachedFile.size} • {attachedFile.pages} páginas detectadas
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 rounded-lg bg-surface-muted hover:bg-surface-subtle text-on-surface-variant hover:text-primary font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  title="Substituir arquivo"
                >
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                  <span>Trocar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedFile(null);
                    setContent('');
                  }}
                  className="p-1 rounded-lg text-outline hover:text-red-600 hover:bg-surface-muted transition-colors"
                  title="Remover arquivo"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-red-600 font-semibold mt-1">{uploadError}</p>
          )}
        </div>

        {/* Conteúdo para Análise (Textarea) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5" htmlFor="study-content">
              <span className="material-symbols-outlined text-[16px] text-primary">article</span>
              <span>Conteúdo para análise</span>
            </label>
            <span className="text-xs font-bold text-emerald-success bg-emerald-light px-2.5 py-0.5 rounded-full border border-emerald-border/50" id="word-count">
              {wordCount} {wordCount === 1 ? 'palavra detectada' : 'palavras detectadas'}
            </span>
          </div>

          <div className="relative bg-surface-muted rounded-xl border border-outline-light/70 p-3.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <textarea
              className="w-full bg-transparent text-sm font-normal text-on-surface placeholder:text-outline focus:outline-none resize-none leading-relaxed"
              id="study-content"
              placeholder="Cole aqui seu texto, resumo de aula ou transcrição de vídeo..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Rodapé da Textarea com Anexos & Ações Rápidas */}
            <div className="flex flex-wrap items-center justify-between pt-2.5 mt-2 border-t border-outline-light/60 text-xs">
              <div className="flex items-center gap-2">
                {attachedFile && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-surface text-primary border border-secondary/30 font-medium" id="file-chip">
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                    <span className="font-semibold text-xs truncate max-w-[200px]" id="file-name">
                      {attachedFile.name}
                    </span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="hover:text-red-600 ml-0.5 transition-colors"
                      id="remove-file-btn"
                      title="Remover anexo"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary bg-white hover:bg-accent-surface font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary/30 hover:border-secondary shadow-xs transition-colors"
                  title="Adicionar arquivo PDF ou imagem"
                >
                  <span className="material-symbols-outlined text-[17px] text-primary">upload_file</span>
                  <span>Anexar PDF de anotações</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {content.trim() && (
                  <button
                    type="button"
                    onClick={() => setContent('')}
                    className="text-outline hover:text-primary transition-colors flex items-center gap-1 font-semibold"
                    id="clear-text-btn"
                  >
                    <span className="material-symbols-outlined text-[14px]">backspace</span>
                    <span>Limpar texto</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seletor dos 4 Formatos Inteligentes */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Escolha o formato inteligente</span>
            <span className="text-xs text-on-surface-variant font-medium">Clique para selecionar e gerar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MODES.map((m) => {
              const isActive = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMode(m.id)}
                  className={`mode-card group p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'shadow-xs bg-accent-surface border-secondary'
                      : 'bg-surface-muted border-outline-light/80 hover:border-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-white text-primary group-hover:bg-primary group-hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-[16px] text-primary transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Ação Proeminente */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!content.trim() || isGenerating}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide shadow-md hover:shadow-hover active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
              content.trim() && !isGenerating
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-surface-muted text-outline border border-outline-light/80 cursor-not-allowed opacity-80'
            }`}
            id="generate-btn"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                <span>Gerando com Groq IA (GPT-OSS 20B)...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px] animate-pulse">auto_awesome</span>
                <span>Gerar com IA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
