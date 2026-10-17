# StudyBuddy AI Study Assistant

O **StudyBuddy AI Study Assistant** e uma aplicacao desktop completa para estudos inteligentes, projetada a partir da interface oficial criada no Google Stitch.

## Arquitetura da Solucao

- **Frontend:** React 19 + JavaScript + Tailwind CSS v4 + Vite + Lucide Icons.
- **Backend:** Node.js (v24) + Express.js com suporte a upload de arquivos PDF (`multer` e `pdf-parse`).
- **Banco de Dados:** SQLite nativo de alta performance (`node:sqlite`) armazenando sessoes de estudo, baralhos de flashcards, questoes de quiz, historico de mensagens e configuracoes.
- **Inteligencia Artificial:** Integracao com a API da **Groq** utilizando o modelo `llama-3.3-70b-versatile` para geracao de conteudo didatico e conversacao com o Tutor IA.

---

## Recursos Implementados

1. **Painel de Entrada de Materiais:**
   - **Upload de PDFs:** Arraste e solte ou selecione arquivos PDF (artigos, apostilas, livros). Extrai texto, contagem de paginas e palavras automaticamente.
   - **Bloco de Anotacoes:** Digite ou cole notas com contagem dinamica de palavras e limpeza rapida.
   - **Atalho Direto:** Direcionamento instantaneo para o Tutor IA.

2. **Modos de Geracao com Groq IA:**
   - **Resumo Didatico:** Sintese com visao geral, topicos detalhados, conceitos-chave e conclusoes praticas. Botao para copiar texto.
   - **Flashcards Interativos:** Cartoes com animacao 3D ao clicar para virar, navegacao sequencial (anterior/proximo), contador e etiquetas por materia.
   - **Quiz Avaliativo:** Questoes de multipla escolha com alternativas A, B, C, D clicaveis, validacao imediata de acerto/erro e explicacao didatica da resposta correta.
   - **Explicacao Guiada:** Explicacao passo a passo usando analogias e metodo Feynman.

3. **Tutor IA StudyBuddy (Chatbot Integrado):**
   - Chatbot lateral responsivo com historico persistido no SQLite.
   - Contexto inteligente: O tutor tem acesso ao material de estudo ativo (PDF ou anotacao) para responder questoes com base no conteudo do aluno.
   - Botoes de sugestao rapida e opcao de limpar historico.

4. **Gerenciador de Chave Groq:**
   - Configuracao direta na interface por meio do modal de API Key ou pelo arquivo `.env` no servidor.
   - Chave salva com seguranca no banco de dados SQLite local.

---

## Como Executar o Projeto

### Pre-requisitos
- Node.js instalado (v20 ou superior, testado com v24)
- Chave de API gratuita da Groq (obtenha em: https://console.groq.com/keys)

### Passo a Passo

1. **Instalar dependencias:**
   ```bash
   npm run setup
   ```
   *Ou execute individualmente:*
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

2. **Configurar a chave da Groq:**
   - Crie o arquivo `server/.env` com a sua chave:
     ```env
     GROQ_API_KEY=gsk_sua_chave_aqui
     PORT=3001
     ```
   - Ou simplesmente inicie o sistema e insira a chave pelo botao **"Inserir Groq API Key"** na barra superior da aplicacao.

3. **Iniciar Frontend e Backend simultaneamente:**
   ```bash
   npm run dev
   ```

4. **Acessar no navegador:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`
