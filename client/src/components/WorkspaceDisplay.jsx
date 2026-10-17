import React, { useState, useEffect } from 'react';

export default function WorkspaceDisplay({
  currentResult,
  activeMode,
  setActiveMode,
  isGenerating,
  onReset,
  onCreateOtherCards
}) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCurrentQuizIndex(0);
  }, [currentResult]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copiado para a área de transferência!');
  };

  const handleCardMastered = (cardId) => {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleQuizAnswer = (qId, optIdx, correctIdx, explanation) => {
    if (quizAnswers[qId] !== undefined) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [qId]: {
        selected: optIdx,
        isCorrect: optIdx === correctIdx,
        correctIdx,
        explanation,
      },
    }));
  };

  // Mode badge label
  const modeLabels = {
    summary: 'Modo: Resumo Didático',
    flashcards: 'Modo: Flashcards Ativos',
    quiz: 'Modo: Quiz Avaliativo',
    explain: 'Modo: Explicação Guiada',
  };

  const modeIcons = {
    summary: 'summarize',
    flashcards: 'style',
    quiz: 'quiz',
    explain: 'psychology_alt',
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-outline-light/80 p-5 shadow-soft flex flex-col gap-4">
      {/* Top Bar de Resultados com Abas e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-light/70">
        {/* Abas Rápidas */}
        <div className="flex items-center p-1 bg-surface-muted rounded-xl gap-1 overflow-x-auto">
          {['summary', 'flashcards', 'quiz', 'explain'].map((mode) => {
            const isActive = activeMode === mode;
            const labels = { summary: 'Resumo', flashcards: 'Flashcards', quiz: 'Quiz', explain: 'Explicar' };

            return (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`tab-btn px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'font-bold bg-primary text-white shadow-xs'
                    : 'font-semibold text-on-surface-variant hover:text-primary'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* Botões Utilitários */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-surface text-primary text-xs font-bold border border-secondary/20" id="active-mode-badge">
            <span className="material-symbols-outlined text-[15px]">{modeIcons[activeMode] || 'style'}</span>
            <span id="badge-text">{modeLabels[activeMode]}</span>
          </div>

          <button
            onClick={() => {
              if (currentResult?.summary) copyText(currentResult.summary);
              else if (currentResult?.explanation) copyText(currentResult.explanation);
              else showToast('Conteúdo copiado!');
            }}
            className="p-2 rounded-xl bg-surface-muted hover:bg-surface-subtle text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            id="copy-btn"
            title="Copiar conteúdo"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-surface-muted hover:bg-surface-subtle text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            id="reset-workspace-btn"
            title="Atualizar / Reiniciar"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Banner In-App */}
      {toastMessage && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-light border border-emerald-border text-emerald-success text-xs font-bold animate-fadeIn" id="feedback-banner">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span id="feedback-message">{toastMessage}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-success/70">OK</span>
        </div>
      )}

      {/* ÁREA DINÂMICA DE VISUALIZAÇÃO */}
      <div className="w-full" id="workspace-content">
        {/* VIEW: LOADING */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 text-center" id="view-loading">
            <div className="w-10 h-10 rounded-full border-4 border-accent-surface border-t-primary animate-spin mb-3"></div>
            <span className="text-sm font-bold text-primary">Processando com Groq IA (GPT-OSS 20B)...</span>
            <span className="text-xs text-on-surface-variant mt-0.5">Destilando conceitos-chave para você</span>
          </div>
        )}

        {/* VIEW: EMPTY */}
        {!isGenerating && !currentResult && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4" id="view-empty">
            <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-outline mb-2">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <h4 className="text-sm font-bold text-on-surface">Área pronta para nova geração</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mt-1">
              Clique em "Gerar com IA" para montar novos materiais a partir do texto ou arquivo anexado.
            </p>
          </div>
        )}

        {/* VIEW: FLASHCARDS INTERATIVO */}
        {!isGenerating && currentResult?.mode === 'flashcards' && currentResult.flashcards?.length > 0 && (
          <div className="flex flex-col gap-4 animate-fadeIn" id="view-flashcards">
            {(() => {
              const cards = currentResult.flashcards;
              const card = cards[currentCardIndex] || cards[0];
              const totalCards = cards.length;
              const isMastered = masteredCards.has(card.id || currentCardIndex);
              // Barra de progresso com cálculo preciso começando do passo correto
              const progressPct = Math.round(((currentCardIndex + 1) / totalCards) * 100);

              return (
                <>
                  {/* Topo do Card: Informações e Barra de Progresso Reorganizada */}
                  <div className="flex flex-col gap-2 pb-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-white font-bold text-xs shadow-xs" id="flashcard-counter">
                          Card {currentCardIndex + 1} de {totalCards}
                        </span>
                        <span className="text-xs font-semibold text-primary bg-accent-surface px-2.5 py-1 rounded-full border border-secondary/30" id="flashcard-tag">
                          {card.tag || 'Geral'}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-success bg-emerald-light px-2.5 py-1 rounded-full border border-emerald-border/40 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span> Nível Médio
                        </span>
                      </div>
                      
                      {/* Botão de Criação de Outros Cartões em Destaque */}
                      <button
                        type="button"
                        onClick={() => setShowSubjectModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-accent-surface hover:bg-secondary/20 text-primary border border-secondary/40 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        id="create-other-cards-btn"
                        title="Criar cartões de matérias como História, Matemática e mais"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
                        <span>Criar outros cartões</span>
                      </button>
                    </div>

                    {/* Barra de Progresso Superior Clara e Bem Posicionada */}
                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-outline-light/70 shadow-inner">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Element */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-5 rounded-2xl border-2 shadow-soft flex flex-col gap-4 cursor-pointer transition-all hover:shadow-hover bg-surface-card border-outline-light/80 select-none min-h-[220px] justify-between"
                    id="flashcard-element"
                  >
                    <div className="flex items-center justify-between border-b border-outline-light/60 pb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-outline">
                        <span className="material-symbols-outlined text-[16px] text-primary">help_outline</span>
                        <span id="flashcard-side-label">{isFlipped ? 'Resposta' : 'Pergunta'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-accent-surface px-2 py-0.5 rounded-full border border-secondary/20">
                        <span className="material-symbols-outlined text-[13px]">auto_awesome</span> Gerado por IA
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base md:text-lg font-bold text-on-surface leading-snug" id="flashcard-text">
                        {card.front}
                      </h3>
                    </div>

                    {isFlipped && (
                      <div className="p-4 rounded-xl bg-accent-surface/70 border border-secondary/30 flex flex-col gap-2 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">psychology</span> RESPOSTA DO TUTOR IA
                          </span>
                          <span className="text-[11px] font-bold text-emerald-success bg-emerald-light px-2 py-0.5 rounded border border-emerald-border/50 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified</span> Explicação Completa
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-on-surface-variant font-medium">
                          {card.back}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-outline-light/50 text-xs">
                      <span className="text-[11px] text-outline font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">rotate_right</span> Clique em qualquer lugar para virar
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(!isFlipped);
                        }}
                        className="px-3 py-1 rounded-lg bg-surface-muted hover:bg-surface-subtle text-primary font-semibold flex items-center gap-1 transition-colors"
                        id="reveal-btn"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span id="reveal-btn-text">{isFlipped ? 'Ocultar Resposta' : 'Revelar Resposta'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Botoes de Navegacao */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
                      }}
                      className="py-2.5 px-4 rounded-xl bg-surface-muted hover:bg-surface-subtle text-on-surface font-semibold text-xs flex items-center gap-1.5 border border-outline-light/70 transition-colors cursor-pointer"
                      id="prev-card-btn"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span> Anterior
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleCardMastered(card.id || currentCardIndex);
                          showToast('Marcado para revisão futura!');
                        }}
                        className="py-2.5 px-3.5 rounded-xl bg-surface-muted hover:bg-accent-surface text-on-surface-variant hover:text-primary font-semibold text-xs flex items-center gap-1.5 border border-outline-light/70 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-outline">history</span> Preciso revisar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCardMastered(card.id || currentCardIndex);
                          showToast('Cartão dominado com sucesso!');
                        }}
                        className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-success text-white ring-2 ring-emerald-light'
                            : 'bg-emerald-success text-white hover:opacity-90 active:scale-95'
                        }`}
                        id="mastered-card-btn"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Dominado ✓
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
                      }}
                      className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      id="next-card-btn"
                    >
                      <span>Próximo Card</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>

                  {/* Barra de Progresso e Ações Finais Reorganizada */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-muted/60 rounded-xl border border-outline-light/60 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-on-surface">
                        Total dominados: {masteredCards.size}/{totalCards} ({totalCards > 0 ? Math.round((masteredCards.size / totalCards) * 100) : 0}%)
                      </span>
                      <div className="w-28 bg-white rounded-full h-2 overflow-hidden border border-outline-light/60">
                        <div
                          className="bg-emerald-success h-2 rounded-full transition-all duration-300"
                          style={{ width: `${totalCards > 0 ? (masteredCards.size / totalCards) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSubjectModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-1 font-bold text-xs cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">add_box</span>
                        <span>Criar outros cartões</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex(Math.floor(Math.random() * totalCards));
                          showToast('Baralho embaralhado!');
                        }}
                        className="px-2.5 py-1 rounded-lg text-outline hover:text-primary hover:bg-white transition-colors flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">shuffle</span> Embaralhar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentCardIndex(0);
                          setIsFlipped(false);
                          setMasteredCards(new Set());
                          showToast('Deck reiniciado!');
                        }}
                        className="px-2.5 py-1 rounded-lg text-outline hover:text-primary hover:bg-white transition-colors flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">restart_alt</span> Reiniciar deck
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* VIEW: QUIZ */}
        {!isGenerating && currentResult?.mode === 'quiz' && currentResult.questions?.length > 0 && (
          <div className="flex flex-col gap-4 animate-fadeIn" id="view-quiz">
            {(() => {
              const questions = currentResult.questions;
              const q = questions[currentQuizIndex] || questions[0];
              const totalQ = questions.length;
              const answerState = quizAnswers[q.id || currentQuizIndex];
              const hasAnswered = answerState !== undefined;
              const correctCount = Object.values(quizAnswers).filter((a) => a.isCorrect).length;

              return (
                <>
                  {/* Barra de Progresso Superior Clara do Quiz */}
                  <div className="flex flex-col gap-2 pb-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent-surface text-primary font-bold border border-secondary/20">
                          Questão {currentQuizIndex + 1} de {totalQ}
                        </span>
                        <span className="text-xs font-semibold text-emerald-success bg-emerald-light px-2.5 py-1 rounded-full border border-emerald-border/40 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span> Pontuação: {correctCount}/{totalQ} acertos
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium hidden sm:inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">psychology</span> Nível: Intermediário • IA
                      </span>
                    </div>
                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-outline-light/70 shadow-inner">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((currentQuizIndex + 1) / totalQ) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-muted rounded-2xl border border-outline-light/70 shadow-xs">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[15px]">help_center</span> Pergunta de Fixação
                    </span>
                    <p className="text-sm md:text-base font-bold text-on-surface leading-snug">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5" id="quiz-options">
                    {q.options.map((opt, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex);
                      let optionClass = 'bg-surface-muted border border-outline-light/70 hover:border-secondary';

                      if (hasAnswered) {
                        if (optIndex === q.correctIndex) {
                          optionClass = 'bg-emerald-light border-2 border-emerald-border text-emerald-success font-bold shadow-xs';
                        } else if (optIndex === answerState.selected) {
                          optionClass = 'bg-red-50 border-2 border-red-300 text-red-800 font-bold';
                        } else {
                          optionClass = 'bg-surface-muted border border-outline-light/50 opacity-60';
                        }
                      }

                      return (
                        <div
                          key={optIndex}
                          onClick={() => handleQuizAnswer(q.id || currentQuizIndex, optIndex, q.correctIndex, q.explanation)}
                          className={`quiz-option cursor-pointer p-3.5 rounded-xl flex items-center justify-between transition-all ${optionClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white text-on-surface text-xs font-bold flex items-center justify-center shrink-0 border border-outline-light/80 shadow-xs">
                              {letter}
                            </div>
                            <span className="text-xs font-medium text-on-surface">{opt}</span>
                          </div>
                          {hasAnswered && optIndex === q.correctIndex && (
                            <span className="material-symbols-outlined text-[20px] text-emerald-success">check_circle</span>
                          )}
                          {hasAnswered && optIndex === answerState.selected && optIndex !== q.correctIndex && (
                            <span className="material-symbols-outlined text-[20px] text-red-600">cancel</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {hasAnswered && (
                    <div className="p-4 rounded-xl bg-accent-surface/70 border border-secondary/30 flex flex-col gap-1.5 text-xs text-on-surface animate-fadeIn" id="quiz-explanation">
                      <div className="flex items-center gap-2 font-bold text-emerald-success">
                        <span className="material-symbols-outlined text-[18px]">task_alt</span>
                        <span>{answerState.isCorrect ? 'Resposta Correta! Explicação da IA:' : 'Explicação da IA:'}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed pl-6">
                        {q.explanation || 'Alternativa correta: ' + String.fromCharCode(65 + q.correctIndex)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-outline-light/60">
                    <button
                      type="button"
                      onClick={() => setCurrentQuizIndex((prev) => (prev > 0 ? prev - 1 : totalQ - 1))}
                      className="py-2.5 px-4 rounded-xl bg-surface-muted hover:bg-surface-subtle text-on-surface font-semibold text-xs flex items-center justify-center gap-1 border border-outline-light/70 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span> Questão Anterior
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentQuizIndex((prev) => (prev < totalQ - 1 ? prev + 1 : 0))}
                      className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Próxima Questão</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* VIEW: RESUMO */}
        {!isGenerating && currentResult?.mode === 'summary' && (
          <div className="flex flex-col gap-4 animate-fadeIn" id="view-summary">
            <div className="p-5 bg-surface-muted/60 rounded-2xl border border-outline-light/70 text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {currentResult.summary}
            </div>
          </div>
        )}

        {/* VIEW: EXPLICAR */}
        {!isGenerating && currentResult?.mode === 'explain' && (
          <div className="flex flex-col gap-4 animate-fadeIn" id="view-explain">
            <div className="p-4 bg-accent-surface/70 rounded-xl border border-secondary/30 text-xs">
              <h4 className="font-bold text-primary mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>Explicação Guiada por IA</span>
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                {currentResult.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal / Diálogo: Criar outros cartões por matéria */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-outline-light/80 shadow-2xl p-5 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline-light/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-surface text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">style</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Criar outros cartões</h3>
                  <p className="text-[11px] text-on-surface-variant">Escolha a matéria para gerar um novo conjunto</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'historia', name: 'História', icon: 'account_balance', desc: 'Era Vargas, República e mais', color: 'text-amber-700 bg-amber-50' },
                { key: 'matematica', name: 'Matemática', icon: 'calculate', desc: 'Funções, Bhaskara, Geometria', color: 'text-blue-700 bg-blue-50' },
                { key: 'geografia', name: 'Geografia', icon: 'public', desc: 'Biomas, Clima, Relevo do Brasil', color: 'text-emerald-700 bg-emerald-50' },
                { key: 'quimica', name: 'Química', icon: 'science', desc: 'Tabela Periódica e Ligações', color: 'text-purple-700 bg-purple-50' }
              ].map((subj) => (
                <button
                  key={subj.key}
                  type="button"
                  onClick={() => {
                    setShowSubjectModal(false);
                    if (onCreateOtherCards) {
                      onCreateOtherCards(subj.key);
                      showToast(`Novos cartões de ${subj.name} gerados com sucesso!`);
                    }
                  }}
                  className="p-3 rounded-xl border border-outline-light/80 hover:border-secondary hover:shadow-soft text-left flex flex-col gap-1.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg ${subj.color} flex items-center justify-center font-bold`}>
                      <span className="material-symbols-outlined text-[18px]">{subj.icon}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                      arrow_forward
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{subj.name}</h4>
                    <p className="text-[10px] text-on-surface-variant leading-tight">{subj.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-outline-light/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-outline">Quer outra matéria? Digite no painel de anotações</span>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-surface-subtle font-semibold text-on-surface text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
