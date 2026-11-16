import "server-only";
import type { Account } from "@/lib/api/types";
import type { SessionUser } from "@/lib/auth/session";
import { TOPICS } from "./catalog";
import { db } from "./db";
import { streakDays, weekStart } from "./time";

export type UserRow = {
  id: string;
  firebase_uid: string;
  email: string | null;
  name: string | null;
  photo_url: string | null;
  is_guest: boolean;
};

const STREAK_LOOKBACK_DAYS = 400;

export async function ensureUser(identity: SessionUser): Promise<UserRow> {
  const sql = db();
  const [existing] = await sql<UserRow[]>`
    select id, firebase_uid, email, name, photo_url, is_guest from users where firebase_uid = ${identity.uid}
  `;
  if (!existing) {
    await sql`
      insert into users (id, firebase_uid, email, name, photo_url, is_guest, created_at, updated_at)
      values (${crypto.randomUUID()}, ${identity.uid}, ${identity.email}, ${identity.name}, ${identity.picture},
        ${identity.isGuest}, now(), now())
      on conflict (firebase_uid) do nothing
    `;
    const [created] = await sql<UserRow[]>`
      select id, firebase_uid, email, name, photo_url, is_guest from users where firebase_uid = ${identity.uid}
    `;
    return created;
  }
  const changed =
    (identity.email && identity.email !== existing.email) ||
    (identity.name && identity.name !== existing.name) ||
    (identity.picture && identity.picture !== existing.photo_url);
  if (!changed) return existing;
  const [updated] = await sql<UserRow[]>`
    update users set
      email = coalesce(${identity.email}, email),
      name = coalesce(${identity.name}, name),
      photo_url = coalesce(${identity.picture}, photo_url),
      updated_at = now()
    where id = ${existing.id}
    returning id, firebase_uid, email, name, photo_url, is_guest
  `;
  return updated;
}

/**
 * Moves everything a guest (Firebase anonymous user) did into the account it just signed in to, so a quiz taken
 * before logging in counts. Flashcards whose front the account already has are dropped to avoid duplicates.
 */
export async function claimGuestData(target: UserRow, guestUid: string) {
  if (target.is_guest || guestUid === target.firebase_uid) return;
  await db().begin(async (tx) => {
    const [guest] = await tx<{ id: string }[]>`
      select id from users where firebase_uid = ${guestUid} and is_guest for update
    `;
    if (!guest) return;
    await tx`
      delete from flashcards g
      where g.user_id = ${guest.id}
        and exists (select 1 from flashcards f where f.user_id = ${target.id} and f.front = g.front)
    `;
    await tx`update flashcards set user_id = ${target.id} where user_id = ${guest.id}`;
    await tx`update quizzes set user_id = ${target.id}, updated_at = now() where user_id = ${guest.id}`;
    await tx`update xp_events set user_id = ${target.id} where user_id = ${guest.id}`;
    await tx`delete from users where id = ${guest.id}`;
  });
}

export async function deleteAccountData(userId: string) {
  await db()`delete from users where id = ${userId}`;
}

export async function topicStats(userId: string) {
  return db()<{ topic: string; answered: number; correct: number }[]>`
    select qq.topic, count(*)::int as answered, count(*) filter (where qq.is_correct)::int as correct
    from quiz_questions qq
    join quizzes q on q.id = qq.quiz_id
    where q.user_id = ${userId} and q.status = 'completed'
    group by qq.topic
  `;
}

export async function xpTotal(userId: string, since: Date | null) {
  const [row] = await db()<{ total: number }[]>`
    select coalesce(sum(amount), 0)::int as total from xp_events
    where user_id = ${userId} ${since ? db()`and created_at >= ${since}` : db()``}
  `;
  return row.total;
}

export async function rankOf(userId: string, since: Date | null) {
  const sql = db();
  const filter = since ? sql`where x.created_at >= ${since}` : sql``;
  const [row] = await sql<{ rank: number | null }[]>`
    with totals as (
      select x.user_id, sum(x.amount) as xp
      from xp_events x join users u on u.id = x.user_id and not u.is_guest
      ${filter}
      group by x.user_id
    )
    select case when exists (select 1 from totals where user_id = ${userId})
      then (select count(*) from totals where xp > (select xp from totals where user_id = ${userId}))::int + 1
    end as rank
  `;
  return row.rank;
}

function ratio(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 10000) / 10000 : null;
}

export async function readAccount(user: UserRow): Promise<Account> {
  const sql = db();
  const now = new Date();
  const since = weekStart(now);
  const lookback = new Date(now.getTime() - STREAK_LOOKBACK_DAYS * 86_400_000);
  const [stats, xpAll, xpWeek, weekRank, activity, cards, completed] = await Promise.all([
    topicStats(user.id),
    xpTotal(user.id, null),
    xpTotal(user.id, since),
    rankOf(user.id, since),
    sql<{ created_at: Date }[]>`select created_at from xp_events where user_id = ${user.id} and created_at >= ${lookback}`,
    sql<{ total: number; due: number }[]>`
      select count(*)::int as total, count(*) filter (where due_at <= now())::int as due
      from flashcards where user_id = ${user.id}
    `,
    sql<{ total: number }[]>`select count(*)::int as total from quizzes where user_id = ${user.id} and status = 'completed'`,
  ]);
  const byTopic = new Map(stats.map((row) => [row.topic, row]));
  const answered = stats.reduce((sum, row) => sum + row.answered, 0);
  const correct = stats.reduce((sum, row) => sum + row.correct, 0);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photo_url: user.photo_url,
    is_guest: user.is_guest,
    stats: {
      xp_total: xpAll,
      xp_week: xpWeek,
      week_rank: weekRank,
      streak_days: streakDays(
        activity.map((row) => row.created_at),
        now,
      ),
      due_cards: cards[0].due,
      total_cards: cards[0].total,
      quizzes_completed: completed[0].total,
      questions_answered: answered,
      accuracy: ratio(correct, answered),
      topics: TOPICS.map((topic) => {
        const row = byTopic.get(topic.key);
        return {
          topic: topic.key,
          label: topic.label,
          answered: row?.answered ?? 0,
          correct: row?.correct ?? 0,
          accuracy: ratio(row?.correct ?? 0, row?.answered ?? 0) ?? 0,
        };
      }),
    },
  };
}
