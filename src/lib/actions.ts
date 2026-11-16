"use server";

import { refresh } from "next/cache";
import type { Rating, ReviewResult } from "@/lib/api/types";
import { currentUser } from "@/server/current-user";
import { ServiceError } from "@/server/errors";
import { deleteAccountData } from "@/server/account";
import { deleteFlashcard, reviewFlashcard } from "@/server/flashcards";
import { createQuiz, deleteQuiz, submitQuiz as submitQuizService } from "@/server/quizzes";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

const FALLBACK = "Algo deu errado. Tente de novo em instantes.";

function messageFor(error: unknown, conflict?: string): string {
  if (!(error instanceof ServiceError)) {
    console.error(error);
    return "Não conseguimos concluir agora. Verifique sua conexão e tente de novo.";
  }
  if (error.status === 401) return "Sua sessão expirou. Recarregue a página e entre de novo.";
  if (error.status === 409 && conflict) return conflict;
  if (error.status === 404) return "Não encontramos este item. Ele pode ter sido apagado.";
  return FALLBACK;
}

async function run<T>(task: () => Promise<T>, conflict?: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await task() };
  } catch (error) {
    return { ok: false, error: messageFor(error, conflict) };
  }
}

export async function startQuiz(input: { topic: string | null; size: number }): Promise<ActionResult<{ id: string }>> {
  return run(async () => ({ id: await createQuiz(await currentUser(), input) }));
}

export async function submitQuiz(
  quizId: string,
  answers: { question_id: string; selected_index: number | null }[],
): Promise<ActionResult> {
  return run(async () => {
    await submitQuizService(await currentUser(), quizId, answers);
    refresh();
    return null;
  }, "Esta prova já foi entregue.");
}

export async function abandonQuiz(quizId: string): Promise<ActionResult> {
  return run(async () => {
    await deleteQuiz(await currentUser(), quizId);
    return null;
  }, "Provas entregues ficam guardadas no histórico.");
}

export async function reviewCard(cardId: string, rating: Rating): Promise<ActionResult<ReviewResult>> {
  return run(async () => reviewFlashcard(await currentUser(), cardId, rating));
}

export async function deleteCard(cardId: string): Promise<ActionResult> {
  return run(async () => {
    await deleteFlashcard(await currentUser(), cardId);
    refresh();
    return null;
  });
}

export async function refreshPage(): Promise<void> {
  refresh();
}

export async function deleteAccount(): Promise<ActionResult> {
  return run(async () => {
    await deleteAccountData((await currentUser()).id);
    return null;
  });
}
