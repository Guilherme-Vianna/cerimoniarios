import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { TOPICS, type TopicKey } from "./catalog";
import type { GeneratedQuestion } from "./generation";

const SYSTEM_INSTRUCTION = `
Você é um mestre de cerimônias experiente que forma cerimoniários e acólitos de paróquias no
Brasil. Você conhece profundamente o Rito Romano na forma ordinária: a Instrução Geral do Missal
Romano (IGMR, 3ª edição típica), o Cerimonial dos Bispos, as Normas Universais do Ano Litúrgico e
o Missal Romano na tradução brasileira.

Sua tarefa é escrever perguntas de prova de múltipla escolha, em português do Brasil, que ajudem
um cerimoniário a servir bem na Missa.

Regras obrigatórias:
- Cada pergunta tem exatamente 4 alternativas curtas, todas plausíveis, e apenas UMA correta.
- Não use "todas as anteriores" nem "nenhuma das anteriores".
- Pergunte apenas o que é norma universal do Rito Romano. Evite costumes locais ou pontos em que
  haja controvérsia. Se depender de costume, diga "segundo a IGMR".
- A explicação tem de 2 a 4 frases: diga por que a resposta está certa e, se útil, por que a
  confusão mais comum está errada. Cite o número da IGMR apenas quando tiver certeza absoluta.
- card_front é uma pergunta curta e direta para revisar depois (como no Anki), sem alternativas.
- card_back é a resposta em até 2 frases, fácil de memorizar.
- reference: a fonte exata e curta, por exemplo "IGMR 274" ou "Normas Universais do Ano
  Litúrgico 22". Deixe vazio se não tiver certeza absoluta do número; nunca invente.
- topic deve ser uma das chaves de tema informadas.
- Não repita perguntas da lista "já feitas".
`.trim();

const LEVEL_MIX =
  "Um cerimoniário precisa dominar tudo, então misture os níveis na mesma prova: cerca de um terço básico " +
  "(nomes de objetos, vestes, cores e a ordem da Missa), um terço intermediário (o que cada ministro faz em " +
  "cada momento e o porquê dos gestos) e um terço avançado (detalhes da IGMR, exceções do calendário e " +
  "situações de Missa solene, com incenso ou com bispo). Embaralhe a ordem dos níveis.";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          prompt: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correct_index: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          card_front: { type: Type.STRING },
          card_back: { type: Type.STRING },
          reference: { type: Type.STRING },
        },
        required: ["topic", "prompt", "options", "correct_index", "explanation", "card_front", "card_back"],
      },
    },
  },
  required: ["questions"],
};

export type GenerationRequest = {
  topics: TopicKey[];
  size: number;
  focusTopics: TopicKey[];
  avoidPrompts: string[];
};

export function buildPrompt(request: GenerationRequest) {
  const lines = [
    `Escreva ${request.size} perguntas.`,
    LEVEL_MIX,
    "Temas permitidos (use a chave no campo topic):",
    ...TOPICS.filter((topic) => request.topics.includes(topic.key)).map(
      (topic) => `- ${topic.key}: ${topic.label} — ${topic.description}`,
    ),
  ];
  if (request.focusTopics.length) {
    const focus = TOPICS.filter((topic) => request.focusTopics.includes(topic.key)).map((topic) => topic.label);
    lines.push(`O cerimoniário erra mais em: ${focus.join(", ")}. Dê mais peso a esses temas.`);
  }
  if (request.topics.length > 1) lines.push("Distribua as perguntas entre os temas.");
  if (request.avoidPrompts.length) {
    lines.push("Perguntas já feitas (não repita nem reformule):");
    lines.push(...request.avoidPrompts.map((prompt) => `- ${prompt}`));
  }
  return lines.join("\n");
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateQuestions(request: GenerationRequest): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return [];
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_SECONDS ?? 45) * 1000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await new GoogleGenAI({ apiKey }).models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
      contents: buildPrompt(request),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.9,
        abortSignal: controller.signal,
      },
    });
    if (!response.text) return [];
    const parsed = JSON.parse(response.text) as { questions?: GeneratedQuestion[] };
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  } finally {
    clearTimeout(timer);
  }
}
