import "server-only";
import type { Leaderboard, LeaderboardEntry } from "@/lib/api/types";
import type { UserRow } from "./account";
import { rankOf, xpTotal } from "./account";
import { db } from "./db";
import { weekStart } from "./time";

const LEADERBOARD_SIZE = 50;

function displayName(name: string | null, email: string | null) {
  return name || email?.split("@")[0] || "Cerimoniário";
}

export async function readLeaderboard(user: UserRow, period: "week" | "all"): Promise<Leaderboard> {
  const sql = db();
  const since = period === "week" ? weekStart(new Date()) : null;
  const rows = await sql<{ id: string; name: string | null; email: string | null; photo_url: string | null; xp: number }[]>`
    with totals as (
      select user_id, sum(amount)::int as xp from xp_events
      ${since ? sql`where created_at >= ${since}` : sql``}
      group by user_id
    )
    select u.id, u.name, u.email, u.photo_url, t.xp
    from totals t join users u on u.id = t.user_id
    order by t.xp desc, u.created_at
    limit ${LEADERBOARD_SIZE}
  `;
  const entries: LeaderboardEntry[] = [];
  rows.forEach((row, index) => {
    const previous = entries.at(-1);
    entries.push({
      rank: previous && previous.xp === row.xp ? previous.rank : index + 1,
      user_id: row.id,
      name: displayName(row.name, row.email),
      photo_url: row.photo_url,
      xp: row.xp,
      is_me: row.id === user.id,
    });
  });
  let me = entries.find((entry) => entry.is_me) ?? null;
  if (!me) {
    const rank = await rankOf(user.id, since);
    if (rank !== null) {
      me = {
        rank,
        user_id: user.id,
        name: displayName(user.name, user.email),
        photo_url: user.photo_url,
        xp: await xpTotal(user.id, since),
        is_me: true,
      };
    }
  }
  return { period, entries, me };
}
