import React from 'react';
import { FileText, Layers, HelpCircle, BookOpen } from 'lucide-react';

const MODES = [
  {
    id: 'summary',
    label: 'Resumo',
    description: 'Síntese estruturada dos pontos mais importantes',
    icon: FileText,
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Cartões interativos para memorização espaçada',
    icon: Layers,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    description: 'Perguntas com gabarito e explicação didática',
    icon: HelpCircle,
  },
  {
    id: 'explain',
    label: 'Explicar',
    description: 'Explicação detalhada passo a passo por analogias',
    icon: BookOpen,
  },
];

export default function ModeSelector({ selectedMode, setSelectedMode, onGenerate, isGenerating }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Formato de Estudo Desejado
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Selecione como a Groq IA deve transformar seu material</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400"></span>
                )}
              </div>
              <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                {mode.label}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
