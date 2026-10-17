import React, { useState, useEffect, useRef } from 'react';

export default function TutorChatbot({ studyContext, onFocusInput }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Estou analisando seu material sobre seus estudos. Qual dúvida você gostaria de esclarecer agora? Pode me pedir explicações, resumos rápidos ou exemplos práticos!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history from SQLite on start
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          setMessages(data.history);
        }
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      }
    }
    loadHistory();
  }, []);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: studyContext || '',
          history: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na comunicação');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao consultar o modelo Groq: ' + err.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setMessages([
        {
          role: 'assistant',
          content: 'Histórico reiniciado. O que vamos estudar agora?',
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const quickPrompts = [
    'Explique o conceito de forma simples',
    'Qual a diferença entre os principais tópicos?',
    'Gere um mnemônico para memorizar',
  ];

  return (
    <aside className="xl:col-span-5 flex flex-col h-[calc(100vh-100px)] sticky top-[76px] bg-surface-card rounded-2xl border border-outline-light/80 shadow-soft overflow-hidden">
      {/* Cabeçalho do Chatbot Tutor IA */}
      <div className="p-4 bg-gradient-to-r from-accent-surface via-surface-card to-white border-b border-outline-light/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-success border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-primary leading-none">Tutor IA StudyBuddy</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-light text-emerald-success border border-emerald-border/40">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[13px] text-emerald-success">sync</span>
              <span>Contextualizado com seu material</span>
            </p>
          </div>
        </div>

        {/* Ações do Header do Chat */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg text-outline hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            id="clear-chat-btn"
            title="Limpar histórico do chat"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Sugestões Rápidas de Perguntas Clicáveis */}
      <div className="px-4 py-2 bg-emerald-light/60 border-b border-emerald-border/40 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-success font-medium">
          <span className="material-symbols-outlined text-[16px] text-emerald-success shrink-0">tips_and_updates</span>
          <span><strong>Quer ajuda agora?</strong> Faça uma pergunta direta sem precisar colar texto acima!</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white text-emerald-success font-bold text-[10px] border border-emerald-border/50 shrink-0">
          100% Grátis
        </span>
      </div>

      <div className="px-4 py-2.5 bg-surface-muted/60 border-b border-outline-light/60 flex items-center gap-1.5 overflow-x-auto shrink-0">
        <span className="text-[10px] uppercase font-bold text-outline shrink-0 mr-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">tips_and_updates</span> Sugestões:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="quick-prompt px-2.5 py-1 rounded-full bg-white hover:bg-accent-surface border border-outline-light/70 hover:border-secondary text-primary text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Área de Conversação com Rolagem Suave */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs" id="chat-messages-container">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          if (isUser) {
            return (
              <div key={index} className="flex items-start justify-end gap-2.5">
                <div className="max-w-[85%] bg-primary text-white rounded-2xl rounded-tr-sm p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-1 opacity-80 text-[10px]">
                    <span className="font-bold">Você</span>
                    <span>Agora</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <div className="flex-1 bg-surface-muted rounded-2xl rounded-tl-sm p-3.5 border border-outline-light/70 text-on-surface">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary flex items-center gap-1">
                    Tutor StudyBuddy
                    <span className="material-symbols-outlined text-[14px] text-emerald-success">verified</span>
                  </span>
                  <span className="text-[10px] text-outline font-medium">Agora</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <div className="flex-1 bg-surface-muted rounded-2xl rounded-tl-sm p-3.5 border border-outline-light/70 text-on-surface flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
              <span className="text-xs text-primary font-semibold">Tutor formulando resposta com Groq IA...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Rodapé do Chatbot: Input, Voz, Anexo & Envio */}
      <div className="p-3.5 bg-white border-t border-outline-light/80 shrink-0">
        <form
          className="flex flex-col gap-2"
          id="tutor-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="flex items-center bg-surface-muted rounded-xl px-3 py-1.5 border border-outline-light/80 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <input
              className="w-full bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none py-1.5"
              id="tutor-question-input"
              placeholder="Digite sua dúvida sobre o material..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                id="send-tutor-btn"
              >
                <span>Enviar</span>
                <span className="material-symbols-outlined text-[15px]">send</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-outline px-1">
            <span>Pressione <kbd className="px-1 py-0.5 rounded bg-surface-subtle font-mono text-[10px]">Enter</kbd> para enviar</span>
            <span className="text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">auto_awesome</span> Respostas instantâneas (GPT-OSS 20B)
            </span>
          </div>
        </form>
      </div>
    </aside>
  );
}
