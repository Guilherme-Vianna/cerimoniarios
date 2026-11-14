import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { apiFetch, ApiError } from "./client";
import type { Account, Flashcard, Leaderboard, Quiz, QuizSummary, Topic } from "./types";

export const SESSION_EXPIRED_PATH = "/api/session/expired";

async function load<T>(path: string): Promise<T> {
  try {
    return await apiFetch<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(SESSION_EXPIRED_PATH);
    throw error;
  }
}

export const loadAccount = cache(() => load<Account>("/me"));

export const loadTopics = cache(() => load<Topic[]>("/topics"));

export function loadQuizzes() {
  return load<QuizSummary[]>("/quizzes");
}

export async function loadQuiz(id: string): Promise<Quiz | null> {
  try {
    return await load<Quiz>(`/quizzes/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
}

export function loadFlashcards(options: { due?: boolean } = {}) {
  return load<Flashcard[]>(`/flashcards${options.due ? "?due=true" : ""}`);
}

export function loadLeaderboard(period: "week" | "all") {
  return load<Leaderboard>(`/leaderboard?period=${period}`);
}
