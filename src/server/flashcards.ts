import "server-only";
import type { Flashcard, Rating, ReviewResult } from "@/lib/api/types";
import type { UserRow } from "./account";
import { referenceUrl, topicLabel } from "./catalog";
import { db } from "./db";
import { ServiceError } from "./errors";
import { preview, RATINGS, schedule } from "./srs";

const LIST_LIMIT = 500;
const REVIEW_XP: Record<Rating, number> = { again: 1, hard: 2, good: 3, easy: 3 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CardRow = {
  id: string;
  topic: string;
  front: string;
  back: string;
  explanation: string | null;
  reference: string | null;
  ease: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  due_at: Date;
  last_reviewed_at: Date | null;
  created_at: Date;
};

const CARD_COLUMNS = [
  "id",
  "topic",
  "front",
  "back",
  "explanation",
  "reference",
  "ease",
  "interval_days",
  "repetitions",
  "lapses",
  "due_at",
  "last_reviewed_at",
  "created_at",
];

function toFlashcard(card: CardRow): Flashcard {
  return {
    id: card.id,
    topic: card.topic,
    topic_label: topicLabel(card.topic),
    front: card.front,
    back: card.back,
    explanation: card.explanation,
    reference: card.reference,
    reference_url: referenceUrl(card.reference),
    interval_days: card.interval_days,
    repetitions: card.repetitions,
    lapses: card.lapses,
    due_at: card.due_at.toISOString(),
    last_reviewed_at: card.last_reviewed_at?.toISOString() ?? null,
    created_at: card.created_at.toISOString(),
    next_intervals: preview(card),
  };
}

export async function listFlashcards(user: UserRow, options: { due?: boolean } = {}): Promise<Flashcard[]> {
  const sql = db();
  const rows = await sql<CardRow[]>`
    select ${sql(CARD_COLUMNS)} from flashcards
    where user_id = ${user.id} ${options.due ? sql`and due_at <= now()` : sql``}
    order by due_at, created_at limit ${LIST_LIMIT}
  `;
  return rows.map(toFlashcard);
}

export async function reviewFlashcard(user: UserRow, cardId: string, rating: Rating): Promise<ReviewResult> {
  if (!RATINGS.includes(rating)) throw new ServiceError(422, "Invalid rating");
  if (!UUID.test(cardId)) throw new ServiceError(404, "Flashcard not found");
  const sql = db();
  return sql.begin(async (tx) => {
    const [card] = await tx<(CardRow & { was_due: boolean })[]>`
      select ${tx(CARD_COLUMNS)}, due_at <= now() as was_due
      from flashcards where id = ${cardId} and user_id = ${user.id} for update
    `;
    if (!card) throw new ServiceError(404, "Flashcard not found");
    const next = schedule(card, rating);
    const [updated] = await tx<CardRow[]>`
      update flashcards set ease = ${next.state.ease}, interval_days = ${next.state.interval_days},
        repetitions = ${next.state.repetitions}, lapses = ${next.state.lapses},
        due_at = now() + make_interval(mins => ${next.delayMinutes}), last_reviewed_at = now(), updated_at = now()
      where id = ${cardId}
      returning ${tx(CARD_COLUMNS)}
    `;
    const xp = card.was_due ? REVIEW_XP[rating] : 0;
    if (xp > 0) {
      await tx`
        insert into xp_events (id, user_id, amount, reason, created_at)
        values (${crypto.randomUUID()}, ${user.id}, ${xp}, 'review', now())
      `;
    }
    const [{ remaining }] = await tx<{ remaining: number }[]>`
      select count(*)::int as remaining from flashcards where user_id = ${user.id} and due_at <= now()
    `;
    return { card: toFlashcard(updated), xp_earned: xp, remaining_due: remaining };
  });
}

export async function deleteFlashcard(user: UserRow, cardId: string) {
  if (!UUID.test(cardId)) throw new ServiceError(404, "Flashcard not found");
  const rows = await db()`delete from flashcards where id = ${cardId} and user_id = ${user.id} returning id`;
  if (!rows.length) throw new ServiceError(404, "Flashcard not found");
}
