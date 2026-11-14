"use server";

import { refresh } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { Quiz, Rating, ReviewResult } from "@/lib/api/types";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

const FALLBACK = "Algo deu errado. Tente de novo em instantes.";

function messageFor(error: unknown, conflict?: string): string {
  if (!(error instanceof ApiError)) return FALLBACK;
  if (error.status === 401) return "Sua sessão expirou. Recarregue a página e entre de novo.";
  if (error.status === 409 && conflict) return conflict;
  if (error.status === 404) return "Não encontramos este item. Ele pode ter sido apagado.";
  if (error.status >= 500) {
    return "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.";
  }
  return FALLBACK;
}

async function run<T>(task: () => Promise<T>, conflict?: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await task() };
  } catch (error) {
    return { ok: false, error: messageFor(error, conflict) };
  }
}

export async function startQuiz(input: {
  topic: string | null;
  size: number;
}): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const quiz = await apiFetch<Quiz>("/quizzes", { method: "POST", json: input });
    return { id: quiz.id };
  });
}

export async function submitQuiz(
  quizId: string,
  answers: { question_id: string; selected_index: number | null }[],
): Promise<ActionResult> {
  return run(async () => {
    await apiFetch<Quiz>(`/quizzes/${encodeURIComponent(quizId)}/submit`, {
      method: "POST",
      json: { answers },
    });
    refresh();
    return null;
  }, "Esta prova já foi entregue.");
}

export async function abandonQuiz(quizId: string): Promise<ActionResult> {
  return run(async () => {
    await apiFetch(`/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" });
    return null;
  }, "Provas entregues ficam guardadas no histórico.");
}

export async function reviewCard(cardId: string, rating: Rating): Promise<ActionResult<ReviewResult>> {
  return run(() =>
    apiFetch<ReviewResult>(`/flashcards/${encodeURIComponent(cardId)}/review`, {
      method: "POST",
      json: { rating },
    }),
  );
}

export async function deleteCard(cardId: string): Promise<ActionResult> {
  return run(async () => {
    await apiFetch(`/flashcards/${encodeURIComponent(cardId)}`, { method: "DELETE" });
    refresh();
    return null;
  });
}

export async function refreshPage(): Promise<void> {
  refresh();
}
