import type { TopicKey } from "./catalog";
import type { GeneratedQuestion } from "./generation";
import { QUESTION_BANK } from "./question-bank-data";

export type Seed = {
  topic: TopicKey;
  prompt: string;
  options: string[];
  explanation: string;
  front: string;
  back: string;
  reference: string | null;
};

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function bankQuestions(topics: TopicKey[], exclude: Set<string>, size: number): GeneratedQuestion[] {
  if (size <= 0) return [];
  const candidates = QUESTION_BANK.filter((seed) => topics.includes(seed.topic) && !exclude.has(seed.prompt));
  return shuffle(candidates)
    .slice(0, size)
    .map((seed) => ({
      topic: seed.topic,
      prompt: seed.prompt,
      options: [...seed.options],
      correct_index: 0,
      explanation: seed.explanation,
      card_front: seed.front,
      card_back: seed.back,
      reference: seed.reference,
    }));
}
