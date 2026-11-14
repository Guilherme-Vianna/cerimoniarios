import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { readAccount } from "@/server/account";
import { TOPICS } from "@/server/catalog";
import { currentUser } from "@/server/current-user";
import { ServiceError } from "@/server/errors";
import { listFlashcards } from "@/server/flashcards";
import { readLeaderboard } from "@/server/leaderboard";
import { getQuiz, listQuizzes } from "@/server/quizzes";
import type { Topic } from "./types";

export const SESSION_EXPIRED_PATH = "/api/session/expired";

async function withUser<T>(task: (user: Awaited<ReturnType<typeof currentUser>>) => Promise<T>): Promise<T> {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    if (error instanceof ServiceError && error.status === 401) redirect(SESSION_EXPIRED_PATH);
    throw error;
  }
  return task(user);
}

export const loadAccount = cache(() => withUser(readAccount));

export async function loadTopics(): Promise<Topic[]> {
  return TOPICS.map(({ key, label, description }) => ({ key, label, description }));
}

export function loadQuizzes() {
  return withUser(listQuizzes);
}

export function loadQuiz(id: string) {
  return withUser((user) => getQuiz(user, id));
}

export function loadFlashcards(options: { due?: boolean } = {}) {
  return withUser((user) => listFlashcards(user, options));
}

export function loadLeaderboard(period: "week" | "all") {
  return withUser((user) => readLeaderboard(user, period));
}
