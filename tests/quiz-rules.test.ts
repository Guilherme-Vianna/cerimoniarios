import { describe, expect, it } from "vitest";
import { referenceUrl, TOPIC_KEYS } from "@/server/catalog";
import { sanitize, shuffled, type GeneratedQuestion } from "@/server/generation";
import { bankQuestions } from "@/server/question-bank";
import { QUESTION_BANK } from "@/server/question-bank-data";
import { streakDays, weekStart } from "@/server/time";

function make(overrides: Partial<GeneratedQuestion> = {}): GeneratedQuestion {
  return {
    topic: "vestes",
    prompt: "Qual veste é comum a todos os ministros?",
    options: ["Alva", "Casula", "Dalmática", "Pluvial"],
    correct_index: 0,
    explanation: "A alva é comum a todos.",
    card_front: "Veste comum?",
    card_back: "Alva.",
    reference: "IGMR 336",
    ...overrides,
  };
}

describe("sanitize", () => {
  it("drops invalid and duplicated questions", () => {
    const accepted = sanitize(
      [
        make(),
        make(),
        make({ prompt: "Outra", options: ["A", "B", "C"] }),
        make({ prompt: "Repetida", options: ["A", "a", "B", "C"] }),
        make({ prompt: "Índice", correct_index: 4 }),
        make({ prompt: "Tema", topic: "desconhecido" }),
      ],
      ["vestes", "gestos"],
      new Set(),
    );
    expect(accepted.map((question) => question.prompt)).toEqual([make().prompt]);
  });

  it("assigns the only topic and skips seen prompts", () => {
    const accepted = sanitize([make({ topic: "x" }), make({ prompt: "Nova" })], ["gestos"], new Set(["nova"]));
    expect(accepted).toHaveLength(1);
    expect(accepted[0].topic).toBe("gestos");
  });

  it("keeps the right answer after shuffling", () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const { options, correctIndex } = shuffled(make());
      expect(options[correctIndex]).toBe("Alva");
    }
  });
});

describe("question bank", () => {
  it("has unique prompts, four options and resolvable references", () => {
    const prompts = QUESTION_BANK.map((seed) => seed.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
    for (const seed of QUESTION_BANK) {
      expect(seed.options).toHaveLength(4);
      if (seed.reference) expect(referenceUrl(seed.reference)).not.toBeNull();
    }
  });

  it("covers every topic", () => {
    for (const topic of TOPIC_KEYS) {
      const questions = bankQuestions([topic], new Set(), 10);
      expect(questions.length).toBeGreaterThanOrEqual(4);
      expect(sanitize(questions, [topic], new Set())).toHaveLength(questions.length);
    }
  });
});

describe("time", () => {
  it("starts the week on Monday in São Paulo", () => {
    expect(weekStart(new Date("2026-11-13T12:00:00Z")).toISOString()).toBe("2026-11-09T03:00:00.000Z");
  });

  it("counts consecutive local days", () => {
    const now = new Date("2026-11-13T15:00:00Z");
    const activity = ["2026-11-12T15:00:00Z", "2026-11-11T15:00:00Z", "2026-11-09T15:00:00Z"].map(
      (value) => new Date(value),
    );
    expect(streakDays(activity, now)).toBe(2);
    expect(streakDays([...activity, now], now)).toBe(3);
  });
});
