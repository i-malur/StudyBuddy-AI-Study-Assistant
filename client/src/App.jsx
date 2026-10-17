import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StudyInputPanel from './components/StudyInputPanel';
import WorkspaceDisplay from './components/WorkspaceDisplay';
import TutorChatbot from './components/TutorChatbot';

export default function App() {
  const [materialTitle, setMaterialTitle] = useState('Fotossíntese e Respiração Celular');
  const [content, setContent] = useState(
    'A fotossíntese é o processo biológico pelo qual organismos autotróficos convertem energia luminosa em química armazenada na glicose. Ocorre primordialmente nos cloroplastos com água e gás carbônico, liberando O2. Já a respiração celular ocorre nas mitocôndrias, oxidando a glicose para síntese contínua de ATP e sustentação das atividades vitais.'
  );
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [activeMode, setActiveMode] = useState('flashcards');
  const [currentResult, setCurrentResult] = useState({
    mode: 'flashcards',
    flashcards: [
      {
        id: 1,
        front: 'Qual a função primária da clorofila no processo fotossintético vegetal?',
        back: 'A clorofila é o pigmento responsável por absorver fótons de luz (especialmente azul e vermelho) e iniciar a transferência de elétrons na membrana dos tilacoides para converter energia luminosa em ATP e NADPH.',
        tag: 'Bioquímica Vegetal'
      },
      {
        id: 2,
        front: 'Onde ocorre a fase clara (fotoquímica) da fotossíntese?',
        back: 'Ocorre nas membranas dos tilacoides, dentro dos cloroplastos, onde a energia solar é capturada e a água é quebrada liberando oxigênio.',
        tag: 'Citologia'
      },
      {
        id: 3,
        front: 'Qual a principal diferença entre fotossíntese e respiração celular quanto à energia?',
        back: 'A fotossíntese armazena energia luminosa na forma de ligações químicas na glicose (processo endotérmico/anabólico), enquanto a respiração celular oxida a glicose liberando ATP (processo exotérmico/catabólico).',
        tag: 'Metabolismo Energético'
      }
    ]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao processar arquivo PDF');

      setAttachedFile({
        name: data.fileName,
        pages: data.pages,
        wordCount: data.wordCount,
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      });
      setContent(data.text);
      if (!materialTitle || materialTitle === 'Fotossíntese e Respiração Celular') {
        setMaterialTitle(data.fileName.replace(/\.pdf$/i, ''));
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mode: activeMode,
          title: materialTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na geração de estudos');

      setCurrentResult(data);
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setAttachedFile(null);
    setCurrentResult(null);
  };

  const handleFocusTutor = () => {
    document.getElementById('tutor-question-input')?.focus();
  };

  const handleGenerateOtherSubjectCards = (subjectKey) => {
    const subjectsData = {
      historia: {
        title: 'História do Brasil: Era Vargas e República',
        content: 'A Era Vargas (1930-1945) transformou a estrutura política, econômica e social do Brasil. Getúlio Vargas consolidou leis trabalhistas (CLT), impulsionou a industrialização de base (CSN, Vale do Rio Doce) e governou sob regimes constitucionais e ditatoriais (Estado Novo).',
        cards: [
          {
            id: 'h1',
            front: 'O que foi a Revolução de 1930 e qual seu impacto na política brasileira?',
            back: 'Foi o movimento armado que encerrou a República Velha (política do café com leite), impedindo a posse de Júlio Prestes e alçando Getúlio Vargas ao poder provisório.',
            tag: 'História do Brasil'
          },
          {
            id: 'h2',
            front: 'Quais foram as principais medidas trabalhistas criadas durante a Era Vargas?',
            back: 'Criação do Ministério do Trabalho, salário mínimo, jornada de 8 horas, carteira de trabalho e a promulgação da CLT em 1943.',
            tag: 'História do Brasil'
          },
          {
            id: 'h3',
            front: 'O que caracterizou o período do Estado Novo (1937-1945)?',
            back: 'Foi uma ditadura de inspiração fascista caracterizada pelo fechamento do Congresso, censura pelo DIP (Departamento de Imprensa e Propaganda) e forte nacionalismo econômico.',
            tag: 'História Contemporânea'
          },
          {
            id: 'h4',
            front: 'Qual a importância da Companhia Siderúrgica Nacional (CSN) fundada por Vargas?',
            back: 'Marcou o início da indústria de base pesada no Brasil, fruto de acordos estratégicos com os EUA durante a Segunda Guerra Mundial.',
            tag: 'História Econômica'
          }
        ]
      },
      matematica: {
        title: 'Matemática: Funções e Trigonometria',
        content: 'O estudo de funções do 1º e 2º grau e trigonometria no triângulo retângulo é essencial para o raciocínio quantitativo. Envolve conceitos como raízes de equações, vértice da parábola, seno, cosseno, tangente e teorema de Pitágoras.',
        cards: [
          {
            id: 'm1',
            front: 'Como se calcula as raízes de uma função quadrática ax² + bx + c = 0?',
            back: 'Pela fórmula de Bhaskara: x = (-b ± √Δ) / 2a, onde Δ = b² - 4ac. Se Δ > 0 há duas raízes reais distintas; se Δ = 0, raiz única; se Δ < 0, raízes complexas.',
            tag: 'Álgebra'
          },
          {
            id: 'm2',
            front: 'O que representa o vértice da parábola em uma função do 2º grau?',
            back: 'Representa o ponto de valor máximo (se a < 0) ou mínimo (se a > 0). Suas coordenadas são Xv = -b/(2a) e Yv = -Δ/(4a).',
            tag: 'Funções'
          },
          {
            id: 'm3',
            front: 'Quais as relações fundamentais de seno, cosseno e tangente no triângulo retângulo?',
            back: 'Seno = cateto oposto / hipotenusa; Cosseno = cateto adjacente / hipotenusa; Tangente = cateto oposto / cateto adjacente.',
            tag: 'Trigonometria'
          },
          {
            id: 'm4',
            front: 'O que afirma o Teorema de Pitágoras?',
            back: 'Em qualquer triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos: a² = b² + c².',
            tag: 'Geometria Plana'
          }
        ]
      },
      geografia: {
        title: 'Geografia: Climatologia e Biomas Brasileiros',
        content: 'O Brasil possui dimensão continental com 6 biomas principais (Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal e Pampa) e grande diversidade climática influenciada por massas de ar e latitude.',
        cards: [
          {
            id: 'g1',
            front: 'Por que o Cerrado é conhecido como o "berço das águas" do Brasil?',
            back: 'Porque abriga as nascentes das três maiores bacias hidrográficas da América do Sul (Amazônica, Tocantins-Araguaia e Platina) graças ao seu relevo e solo permeável.',
            tag: 'Geografia Física'
          },
          {
            id: 'g2',
            front: 'Qual bioma brasileiro é caracterizado por vegetação xerófila e clima semiárido?',
            back: 'A Caatinga, único bioma exclusivamente brasileiro, com solos rasos e plantas com adaptações para resistir à seca.',
            tag: 'Biomas'
          },
          {
            id: 'g3',
            front: 'O que caracteriza o fenômeno do El Niño no clima do Brasil?',
            back: 'O aquecimento anômalo do Oceano Pacífico provoca secas severas no Norte/Nordeste e chuvas volumosas com inundações na região Sul.',
            tag: 'Climatologia'
          }
        ]
      },
      quimica: {
        title: 'Química: Ligações Químicas e Tabela Periódica',
        content: 'As ligações químicas mantêm átomos unidos formando substâncias. Baseiam-se na regra do octeto, dividindo-se em ligações iônicas, covalentes e metálicas com propriedades térmicas e elétricas distintas.',
        cards: [
          {
            id: 'q1',
            front: 'Qual a diferença entre ligação iônica e ligação covalente?',
            back: 'A ligação iônica ocorre por transferência definitiva de elétrons entre metal e ametal. A ligação covalente ocorre pelo compartilhamento de pares de elétrons entre ametais.',
            tag: 'Química Geral'
          },
          {
            id: 'q2',
            front: 'O que define a eletronegatividade de um elemento?',
            back: 'É a capacidade de um átomo de atrair elétrons para si em uma ligação química. O flúor (F) é o elemento mais eletronegativo.',
            tag: 'Tabela Periódica'
          },
          {
            id: 'q3',
            front: 'Por que os metais são bons condutores de eletricidade e calor?',
            back: 'Pelo modelo do "mar de elétrons livres", no qual cátions metálicos ficam imersos em elétrons deslocalizados com alta mobilidade.',
            tag: 'Propriedades da Matéria'
          }
        ]
      }
    };

    const selected = subjectsData[subjectKey] || subjectsData.historia;
    setMaterialTitle(selected.title);
    setContent(selected.content);
    setActiveMode('flashcards');
    setCurrentResult({
      mode: 'flashcards',
      flashcards: selected.cards
    });
  };

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex flex-col selection:bg-accent-surface selection:text-primary antialiased">
      {/* 1. Header Widescreen Limpo & Elegante */}
      <Navbar materialTitle={materialTitle} onReset={handleReset} />

      {/* 2. Main Desktop Widescreen Layout (2-Column Grid) */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 lg:px-8 py-5">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Painel de Estudo & Entrada + Resultados (7 Cols) */}
          <section className="xl:col-span-7 flex flex-col gap-6">
            <StudyInputPanel
              title={materialTitle}
              setTitle={setMaterialTitle}
              content={content}
              setContent={setContent}
              attachedFile={attachedFile}
              setAttachedFile={setAttachedFile}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              onFocusTutor={handleFocusTutor}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              uploadError={uploadError}
            />

            <WorkspaceDisplay
              currentResult={currentResult}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              isGenerating={isGenerating}
              onReset={handleReset}
              onCreateOtherCards={handleGenerateOtherSubjectCards}
            />
          </section>

          {/* Coluna Direita: Tutor IA Interativo Dedicado (5 Cols) */}
          <TutorChatbot studyContext={content} onFocusInput={handleFocusTutor} />
        </div>
      </main>
    </div>
  );
}
