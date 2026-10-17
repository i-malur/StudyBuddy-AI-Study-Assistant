import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Helper to retrieve saved or env Groq API Key
function getGroqApiKey() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
    return process.env.GROQ_API_KEY.trim();
  }
  const row = db.prepare("SELECT value FROM app_settings WHERE key = 'groq_api_key'").get();
  return row ? row.value : null;
}

// Helper to retrieve active model
function getGroqModel() {
  if (process.env.GROQ_MODEL && process.env.GROQ_MODEL.trim() !== '') {
    return process.env.GROQ_MODEL.trim();
  }
  const row = db.prepare("SELECT value FROM app_settings WHERE key = 'groq_model'").get();
  return row ? row.value : 'openai/gpt-oss-20b';
}

function getGroqClient() {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// Multer memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB as per Stitch design
});

// Config endpoints
app.get('/api/config', (req, res) => {
  const apiKey = getGroqApiKey();
  const hasKey = Boolean(apiKey);
  const maskedKey = hasKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : '';
  res.json({
    hasApiKey: hasKey,
    maskedKey,
    defaultModel: getGroqModel(),
  });
});

app.post('/api/config', (req, res) => {
  const { apiKey, model } = req.body;
  if (apiKey && typeof apiKey === 'string') {
    db.prepare(`
      INSERT INTO app_settings (key, value) VALUES ('groq_api_key', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(apiKey.trim());
  }
  if (model && typeof model === 'string') {
    db.prepare(`
      INSERT INTO app_settings (key, value) VALUES ('groq_model', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(model.trim());
  }

  res.json({ success: true, message: 'Configurações salvas com sucesso' });
});

// Upload and parse PDF
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const data = await pdfParse(req.file.buffer);
    const cleanedText = data.text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

    res.json({
      fileName: req.file.originalname,
      pages: data.numpages,
      wordCount,
      text: cleanedText,
    });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    res.status(500).json({ error: 'Falha ao processar o arquivo PDF: ' + error.message });
  }
});

// Generate content (Summary, Flashcards, Quiz, Explain)
app.post('/api/generate', async (req, res) => {
  try {
    const { content, mode, title } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nenhum conteúdo fornecido para geração' });
    }

    const groq = getGroqClient();
    if (!groq) {
      return res.status(401).json({ error: 'Chave de API da Groq não configurada no servidor (.env).' });
    }

    const modelToUse = getGroqModel();
    const sessionTitle = title || 'Estudo de ' + new Date().toLocaleDateString('pt-BR');
    const sessionInsert = db.prepare(`
      INSERT INTO study_sessions (title, content, mode) VALUES (?, ?, ?)
    `).run(sessionTitle, content, mode);
    const sessionId = sessionInsert.lastInsertRowid;

    if (mode === 'summary') {
      const completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em síntese educacional e técnicas de estudo ativo.
Crie um resumo estruturado, claro e didático em português com base no material fornecido.
Estrutura esperada:
# [Título Principal do Estudo]
## Visão Geral & Conceitos Centrais
## Tópicos Principais Explicados
## Destaques & Palavras-Chave
## Conclusão & Aplicação Prática
Use formatação Markdown rica (negrito, listas, citações de destaque). Não use emojis.`
          },
          { role: 'user', content: content }
        ],
        temperature: 0.3,
      });

      const summaryText = completion.choices[0]?.message?.content || '';
      db.prepare('UPDATE study_sessions SET summary = ? WHERE id = ?').run(summaryText, sessionId);

      return res.json({ mode: 'summary', sessionId, summary: summaryText });
    }

    if (mode === 'flashcards') {
      const completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `Você é um gerador de flashcards para memorização espaçada (Anki style).
Com base no material fornecido, crie entre 5 a 10 flashcards de alta qualidade com perguntas diretas na frente e respostas claras no verso.
Responda EXCLUSIVAMENTE em formato JSON puro, sem marcação de código markdown ou texto extra, no seguinte formato:
[
  {
    "front": "Pergunta ou conceito a ser lembrado",
    "back": "Resposta didática, concisa e precisa",
    "tag": "Nome da matéria ou tópico (ex: Biologia, História)"
  }
]`
          },
          { role: 'user', content: content }
        ],
        temperature: 0.4,
      });

      const raw = completion.choices[0]?.message?.content || '[]';
      let cleanJson = raw.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json?\s*/, '').replace(/\s*```$/, '');
      }

      const cards = JSON.parse(cleanJson);
      const insertCard = db.prepare('INSERT INTO flashcards (session_id, front, back, tag) VALUES (?, ?, ?, ?)');
      const savedCards = [];

      for (const c of cards) {
        const result = insertCard.run(sessionId, c.front, c.back, c.tag || 'Geral');
        savedCards.push({
          id: result.lastInsertRowid,
          session_id: sessionId,
          front: c.front,
          back: c.back,
          tag: c.tag || 'Geral',
          mastered: 0,
        });
      }

      return res.json({ mode: 'flashcards', sessionId, flashcards: savedCards });
    }

    if (mode === 'quiz') {
      const completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `Você é um professor criando um quiz avaliativo com base no material de estudo.
Crie de 4 a 6 perguntas de múltipla escolha com 4 alternativas cada (apenas 1 correta).
Responda EXCLUSIVAMENTE em formato JSON puro, sem blocos markdown ou explicações fora do JSON:
[
  {
    "question": "Texto da questão?",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctIndex": 0,
    "explanation": "Explicação detalhada do porquê essa é a alternativa correta."
  }
]`
          },
          { role: 'user', content: content }
        ],
        temperature: 0.3,
      });

      const raw = completion.choices[0]?.message?.content || '[]';
      let cleanJson = raw.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json?\s*/, '').replace(/\s*```$/, '');
      }

      const questions = JSON.parse(cleanJson);
      const insertQ = db.prepare(`
        INSERT INTO quiz_questions (session_id, question, options_json, correct_index, explanation)
        VALUES (?, ?, ?, ?, ?)
      `);
      const savedQuestions = [];

      for (const q of questions) {
        const result = insertQ.run(
          sessionId,
          q.question,
          JSON.stringify(q.options),
          q.correctIndex,
          q.explanation || ''
        );
        savedQuestions.push({
          id: result.lastInsertRowid,
          session_id: sessionId,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || '',
          selectedIndex: null,
          isCorrect: null,
        });
      }

      return res.json({ mode: 'quiz', sessionId, questions: savedQuestions });
    }

    if (mode === 'explain') {
      const completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `Você é um professor particular amigável e especialista na técnica Feynman de aprendizado.
Explique o tema central do material de forma didática, intuitiva, com analogias do dia a dia e passo a passo claro para quem está aprendendo agora.
Use formatação Markdown elegante. Não use emojis.`
          },
          { role: 'user', content: content }
        ],
        temperature: 0.4,
      });

      const explanation = completion.choices[0]?.message?.content || '';
      return res.json({ mode: 'explain', sessionId, explanation });
    }

    res.status(400).json({ error: 'Modo inválido. Escolha entre: summary, flashcards, quiz, explain' });
  } catch (error) {
    console.error('Erro na geração:', error);
    res.status(500).json({ error: 'Erro ao gerar conteúdo: ' + error.message });
  }
});

// Chatbot Tutor Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mensagem vazia' });
    }

    const groq = getGroqClient();
    if (!groq) {
      return res.status(401).json({ error: 'Chave de API da Groq não configurada no servidor' });
    }

    const modelToUse = getGroqModel();
    const systemPrompt = `Você é o Tutor IA do StudyBuddy, um assistente educacional didático, paciente, inteligente e encorajador.
Seu objetivo é ajudar o estudante a aprender de verdade: tirando dúvidas, explicando conceitos difíceis com clareza, propondo perguntas reflexivas e simplificando termos complexos.
Responda sempre em português com formatação Markdown clara e legível.
Não use emojis em nenhuma circunstância.
${context ? '\nMaterial de Estudo de Referência Atual:\n"""' + context.slice(0, 8000) + '"""\n' : ''}`;

    const messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      model: modelToUse,
      messages,
      temperature: 0.6,
      max_tokens: 1500,
    });

    const reply = completion.choices[0]?.message?.content || 'Não consegui formular uma resposta no momento.';

    // Save to SQLite
    db.prepare('INSERT INTO chat_messages (role, content) VALUES (?, ?)').run('user', message);
    db.prepare('INSERT INTO chat_messages (role, content) VALUES (?, ?)').run('assistant', reply);

    res.json({ reply });
  } catch (error) {
    console.error('Erro no chatbot:', error);
    res.status(500).json({ error: 'Erro no Tutor IA: ' + error.message });
  }
});

// Chat history endpoints
app.get('/api/history', (req, res) => {
  const rows = db.prepare('SELECT id, role, content, created_at FROM chat_messages ORDER BY id ASC LIMIT 50').all();
  res.json({ history: rows });
});

app.delete('/api/history', (req, res) => {
  db.prepare('DELETE FROM chat_messages').run();
  res.json({ success: true, message: 'Histórico de chat limpo' });
});

// Flashcards endpoints
app.get('/api/flashcards', (req, res) => {
  const rows = db.prepare('SELECT * FROM flashcards ORDER BY id DESC').all();
  res.json({ flashcards: rows });
});

app.patch('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  const { mastered } = req.body;
  db.prepare('UPDATE flashcards SET mastered = ? WHERE id = ?').run(mastered ? 1 : 0, id);
  res.json({ success: true, id, mastered });
});

app.delete('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM flashcards WHERE id = ?').run(id);
  res.json({ success: true, id });
});

// Quizzes endpoints
app.get('/api/quizzes', (req, res) => {
  const rows = db.prepare('SELECT * FROM quiz_questions ORDER BY id ASC').all();
  const parsed = rows.map(r => ({
    ...r,
    options: JSON.parse(r.options_json),
  }));
  res.json({ questions: parsed });
});

app.post('/api/quizzes/answer', (req, res) => {
  const { questionId, selectedIndex } = req.body;
  const q = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(questionId);
  if (!q) {
    return res.status(404).json({ error: 'Questão não encontrada' });
  }

  const isCorrect = selectedIndex === q.correct_index ? 1 : 0;
  db.prepare('UPDATE quiz_questions SET selected_index = ?, is_correct = ? WHERE id = ?')
    .run(selectedIndex, isCorrect, questionId);

  res.json({
    questionId,
    selectedIndex,
    isCorrect: Boolean(isCorrect),
    correctIndex: q.correct_index,
    explanation: q.explanation,
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Servidor StudyBuddy rodando com sucesso na porta ${PORT}`);
  console.log(`Modelo Groq ativo: ${getGroqModel()}`);
});
