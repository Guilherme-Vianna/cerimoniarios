import { isTopic, type TopicKey } from "./catalog";

export type GeneratedQuestion = {
  topic: string;
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
  card_front: string;
  card_back: string;
  reference: string | null;
};

const OPTION_COUNT = 4;

export function normalize(text: string) {
  return text.toLowerCase().split(/\s+/).filter(Boolean).join(" ");
}

export function sanitize(generated: GeneratedQuestion[], topics: TopicKey[], seen: Set<string>): GeneratedQuestion[] {
  const accepted: GeneratedQuestion[] = [];
  for (const question of generated) {
    const options = (question.options ?? []).map((option) => String(option).trim());
    const prompt = String(question.prompt ?? "").trim();
    const explanation = String(question.explanation ?? "").trim();
    const key = normalize(prompt);
    if (
      !prompt ||
      seen.has(key) ||
      options.length !== OPTION_COUNT ||
      options.some((option) => !option) ||
      new Set(options.map(normalize)).size !== OPTION_COUNT ||
      !Number.isInteger(question.correct_index) ||
      question.correct_index < 0 ||
      question.correct_index >= OPTION_COUNT ||
      !explanation
    ) {
      continue;
    }
    let topic: string | null = isTopic(question.topic) && topics.includes(question.topic) ? question.topic : null;
    if (topic === null && topics.length === 1) topic = topics[0];
    if (topic === null) continue;
    seen.add(key);
    accepted.push({
      topic,
      prompt,
      options,
      correct_index: question.correct_index,
      explanation,
      card_front: String(question.card_front ?? "").trim() || prompt,
      card_back: String(question.card_back ?? "").trim() || options[question.correct_index],
      reference: String(question.reference ?? "").trim().slice(0, 120) || null,
    });
  }
  return accepted;
}

export function shuffled(question: GeneratedQuestion): { options: string[]; correctIndex: number } {
  const order = question.options.map((_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { options: order.map((index) => question.options[index]), correctIndex: order.indexOf(question.correct_index) };
}
