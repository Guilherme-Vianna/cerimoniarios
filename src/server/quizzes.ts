import "server-only";
import type { Question, Quiz, QuizSummary } from "@/lib/api/types";
import type { UserRow } from "./account";
import { topicStats } from "./account";
import { isTopic, referenceUrl, TOPIC_KEYS, topicLabel, type TopicKey } from "./catalog";
import { db } from "./db";
import { ServiceError } from "./errors";
import { generateQuestions } from "./gemini";
import { normalize, sanitize, shuffled, type GeneratedQuestion } from "./generation";
import { bankQuestions } from "./question-bank";
import { MIN_EASE } from "./srs";

export const MIN_QUIZ_SIZE = 5;
export const MAX_QUIZ_SIZE = 20;
const RECENT_PROMPTS = 60;
const AVOID_PROMPTS = 40;
const RECENT_QUIZZES = 20;
const WEAK_TOPIC_ACCURACY = 0.7;
const WEAK_TOPIC_MIN_ANSWERS = 3;
const XP_PER_CORRECT = 10;
const PERFECT_BONUS = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type QuizRow = {
  id: string;
  topic: string | null;
  status: "in_progress" | "completed";
  total: number;
  score: number | null;
  xp_earned: number | null;
  cards_created: number | null;
  created_at: Date;
  completed_at: Date | null;
};

type QuestionRow = {
  id: string;
  position: number;
  topic: string;
  source: "ai" | "bank";
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
  card_front: string;
  card_back: string;
  reference: string | null;
  selected_index: number | null;
  is_correct: boolean | null;
};

function toSummary(quiz: QuizRow): QuizSummary {
  return {
    id: quiz.id,
    topic: quiz.topic,
    topic_label: topicLabel(quiz.topic),
    status: quiz.status,
    total: quiz.total,
    score: quiz.score,
    xp_earned: quiz.xp_earned,
    cards_created: quiz.cards_created,
    created_at: quiz.created_at.toISOString(),
    completed_at: quiz.completed_at?.toISOString() ?? null,
  };
}

function toQuestion(question: QuestionRow, reveal: boolean): Question {
  return {
    id: question.id,
    position: question.position,
    topic: question.topic,
    topic_label: topicLabel(question.topic),
    source: question.source,
    prompt: question.prompt,
    options: question.options,
    selected_index: question.selected_index,
    correct_index: reveal ? question.correct_index : null,
    is_correct: reveal ? question.is_correct : null,
    explanation: reveal ? question.explanation : null,
    reference: reveal ? question.reference : null,
    reference_url: reveal ? referenceUrl(question.reference) : null,
  };
}

const QUIZ_COLUMNS = ["id", "topic", "status", "total", "score", "xp_earned", "cards_created", "created_at", "completed_at"];

export async function listQuizzes(user: UserRow): Promise<QuizSummary[]> {
  const sql = db();
  const rows = await sql<QuizRow[]>`
    select ${sql(QUIZ_COLUMNS)} from quizzes where user_id = ${user.id}
    order by created_at desc limit ${RECENT_QUIZZES}
  `;
  return rows.map(toSummary);
}

async function loadQuizRows(userId: string, quizId: string) {
  if (!UUID.test(quizId)) return null;
  const sql = db();
  const [quiz] = await sql<QuizRow[]>`
    select ${sql(QUIZ_COLUMNS)} from quizzes where id = ${quizId} and user_id = ${userId}
  `;
  if (!quiz) return null;
  const questions = await sql<QuestionRow[]>`
    select id, position, topic, source, prompt, options, correct_index, explanation, card_front, card_back,
      reference, selected_index, is_correct
    from quiz_questions where quiz_id = ${quizId} order by position
  `;
  return { quiz, questions };
}

export async function getQuiz(user: UserRow, quizId: string): Promise<Quiz | null> {
  const rows = await loadQuizRows(user.id, quizId);
  if (!rows) return null;
  const reveal = rows.quiz.status === "completed";
  return { ...toSummary(rows.quiz), questions: rows.questions.map((question) => toQuestion(question, reveal)) };
}

async function weakTopics(userId: string): Promise<TopicKey[]> {
  const stats = await topicStats(userId);
  return stats
    .filter((row) => isTopic(row.topic) && row.answered >= WEAK_TOPIC_MIN_ANSWERS)
    .map((row) => ({ topic: row.topic as TopicKey, accuracy: row.correct / row.answered }))
    .filter((row) => row.accuracy < WEAK_TOPIC_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((row) => row.topic);
}

export async function createQuiz(user: UserRow, input: { topic: string | null; size: number }) {
  if (input.topic !== null && !isTopic(input.topic)) throw new ServiceError(422, "Unknown topic");
  const size = Math.round(input.size);
  if (!Number.isFinite(size) || size < MIN_QUIZ_SIZE || size > MAX_QUIZ_SIZE) {
    throw new ServiceError(422, "Invalid quiz size");
  }
  const topics: TopicKey[] = input.topic ? [input.topic as TopicKey] : TOPIC_KEYS;
  const sql = db();
  const recent = (
    await sql<{ prompt: string }[]>`
      select qq.prompt from quiz_questions qq join quizzes q on q.id = qq.quiz_id
      where q.user_id = ${user.id} order by q.created_at desc, qq.position limit ${RECENT_PROMPTS}
    `
  ).map((row) => row.prompt);
  const seen = new Set(recent.map(normalize));

  let picked: { question: GeneratedQuestion; source: "ai" | "bank" }[] = [];
  try {
    const generated = await generateQuestions({
      topics,
      size,
      focusTopics: input.topic ? [] : await weakTopics(user.id),
      avoidPrompts: recent.slice(0, AVOID_PROMPTS),
    });
    picked = sanitize(generated, topics, seen)
      .slice(0, size)
      .map((question) => ({ question, source: "ai" }));
  } catch (error) {
    console.error("Question generation failed; falling back to the question bank", error);
  }

  const missing = size - picked.length;
  if (missing > 0) {
    const exclude = new Set(picked.map((item) => item.question.prompt));
    const fresh = bankQuestions(topics, new Set([...exclude, ...recent]), missing);
    for (const question of fresh) exclude.add(question.prompt);
    const repeats = bankQuestions(topics, exclude, missing - fresh.length);
    picked.push(...[...fresh, ...repeats].map((question) => ({ question, source: "bank" as const })));
  }
  if (!picked.length) throw new ServiceError(422, "No questions available for this topic");

  const quizId = crypto.randomUUID();
  await sql.begin(async (tx) => {
    await tx`
      insert into quizzes (id, user_id, topic, status, total, created_at, updated_at)
      values (${quizId}, ${user.id}, ${input.topic}, 'in_progress', ${picked.length}, now(), now())
    `;
    const rows = picked.map(({ question, source }, position) => {
      const { options, correctIndex } = shuffled(question);
      return {
        id: crypto.randomUUID(),
        quiz_id: quizId,
        position,
        topic: question.topic,
        source,
        prompt: question.prompt,
        options: tx.json(options),
        correct_index: correctIndex,
        explanation: question.explanation,
        card_front: question.card_front,
        card_back: question.card_back,
        reference: question.reference,
      };
    });
    await tx`insert into quiz_questions ${tx(rows)}`;
  });
  return quizId;
}

export async function submitQuiz(
  user: UserRow,
  quizId: string,
  answers: { question_id: string; selected_index: number | null }[],
) {
  if (!UUID.test(quizId)) throw new ServiceError(404, "Quiz not found");
  const sql = db();
  await sql.begin(async (tx) => {
    const [quiz] = await tx<QuizRow[]>`
      select ${tx(QUIZ_COLUMNS)} from quizzes where id = ${quizId} and user_id = ${user.id} for update
    `;
    if (!quiz) throw new ServiceError(404, "Quiz not found");
    if (quiz.status === "completed") throw new ServiceError(409, "Quiz already submitted");
    const questions = await tx<QuestionRow[]>`
      select id, position, topic, source, prompt, options, correct_index, explanation, card_front, card_back,
        reference, selected_index, is_correct
      from quiz_questions where quiz_id = ${quizId} order by position
    `;
    const chosen = new Map(answers.map((answer) => [answer.question_id, answer.selected_index]));
    const known = new Set(questions.map((question) => question.id));
    if ([...chosen.keys()].some((id) => !known.has(id))) {
      throw new ServiceError(422, "Answer references a question outside this quiz");
    }

    const wrong: QuestionRow[] = [];
    for (const question of questions) {
      const selected = chosen.get(question.id) ?? null;
      if (selected !== null && (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length)) {
        throw new ServiceError(422, "Selected option does not exist");
      }
      const isCorrect = selected === question.correct_index;
      if (!isCorrect) wrong.push(question);
      await tx`update quiz_questions set selected_index = ${selected}, is_correct = ${isCorrect} where id = ${question.id}`;
    }

    const fronts = [...new Set(wrong.map((question) => question.card_front))];
    const existing = fronts.length
      ? await tx<{ id: string; front: string; ease: number; lapses: number }[]>`
          select id, front, ease, lapses from flashcards where user_id = ${user.id} and front in ${tx(fronts)}
        `
      : [];
    const byFront = new Map(existing.map((card) => [card.front, card]));
    const handled = new Set<string>();
    for (const question of wrong) {
      if (handled.has(question.card_front)) continue;
      handled.add(question.card_front);
      const card = byFront.get(question.card_front);
      if (card) {
        await tx`
          update flashcards set due_at = now(), repetitions = 0, interval_days = 0, lapses = ${card.lapses + 1},
            ease = ${Math.max(MIN_EASE, Math.round((card.ease - 0.2) * 100) / 100)}, updated_at = now()
          where id = ${card.id}
        `;
      } else {
        await tx`
          insert into flashcards (id, user_id, question_id, topic, front, back, explanation, reference, ease,
            interval_days, repetitions, lapses, due_at, created_at, updated_at)
          values (${crypto.randomUUID()}, ${user.id}, ${question.id}, ${question.topic}, ${question.card_front},
            ${question.card_back}, ${question.explanation}, ${question.reference}, 2.5, 0, 0, 0, now(), now(), now())
        `;
      }
    }

    const score = quiz.total - wrong.length;
    const xp = score * XP_PER_CORRECT + (score === quiz.total ? PERFECT_BONUS : 0);
    if (xp > 0) {
      await tx`
        insert into xp_events (id, user_id, amount, reason, created_at)
        values (${crypto.randomUUID()}, ${user.id}, ${xp}, 'quiz', now())
      `;
    }
    await tx`
      update quizzes set status = 'completed', score = ${score}, xp_earned = ${xp}, cards_created = ${wrong.length},
        completed_at = now(), updated_at = now()
      where id = ${quizId}
    `;
  });
}

export async function deleteQuiz(user: UserRow, quizId: string) {
  if (!UUID.test(quizId)) throw new ServiceError(404, "Quiz not found");
  const sql = db();
  const [quiz] = await sql<{ status: string }[]>`select status from quizzes where id = ${quizId} and user_id = ${user.id}`;
  if (!quiz) throw new ServiceError(404, "Quiz not found");
  if (quiz.status === "completed") throw new ServiceError(409, "Completed quizzes are kept in the history");
  await sql`delete from quizzes where id = ${quizId}`;
}
