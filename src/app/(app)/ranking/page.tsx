import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/app/avatar";
import { LinkButton } from "@/components/ui/link-button";
import { loadAccount, loadLeaderboard } from "@/lib/api/data";
import type { LeaderboardEntry } from "@/lib/api/types";
import { QUIZ_PATH, RANKING_PATH } from "@/lib/auth/constants";
import { percent, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Ranking" };

const PERIODS = [
  { value: "week", label: "Esta semana" },
  { value: "all", label: "Geral" },
] as const;

const MEDALS = ["bg-gold text-white", "bg-border-strong text-white", "bg-[#a0673a] text-white"];

export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const { periodo } = await searchParams;
  const period = periodo === "geral" ? "all" : "week";
  const [board, account] = await Promise.all([loadLeaderboard(period), loadAccount()]);
  const { stats } = account;
  const meOutside = board.me && !board.entries.some((entry) => entry.is_me) ? board.me : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight">Ranking</h1>
        <p className="mt-2 text-lg text-muted">
          {period === "week" ? "XP desde segunda-feira." : "Todo o XP desde o primeiro dia."}
        </p>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border rounded-3xl border border-border bg-surface py-4 text-center">
        <div>
          <dt className="text-xs text-muted">XP na semana</dt>
          <dd className="mt-1 text-2xl font-semibold">{stats.xp_week}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Sequência</dt>
          <dd className="mt-1 text-2xl font-semibold">{plural(stats.streak_days, "dia", "dias")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Acertos</dt>
          <dd className="mt-1 text-2xl font-semibold">{percent(stats.accuracy)}</dd>
        </div>
      </dl>

      <nav aria-label="Período" className="flex gap-2">
        {PERIODS.map((item) => {
          const active = item.value === period;
          return (
            <Link
              key={item.value}
              href={item.value === "week" ? RANKING_PATH : `${RANKING_PATH}?periodo=geral`}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary ${
                active ? "bg-primary text-white" : "border border-border bg-surface text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {board.entries.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-surface p-8">
          <p className="text-lg font-semibold">Ninguém pontuou ainda {period === "week" ? "nesta semana" : ""}</p>
          <p className="text-muted">Faça uma prova e seja o primeiro da lista.</p>
          <LinkButton href={QUIZ_PATH}>Fazer uma prova</LinkButton>
        </div>
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
          {board.entries.map((entry, index) => (
            <Row key={entry.user_id} entry={entry} delay={Math.min(index, 12) * 40} />
          ))}
          {meOutside && (
            <>
              <li aria-hidden="true" className="py-1 text-center text-muted">
                ⋯
              </li>
              <Row entry={meOutside} />
            </>
          )}
        </ol>
      )}

      {!board.me && board.entries.length > 0 && (
        <p className="text-muted">Você ainda não tem XP neste período. Faça uma prova ou revise flashcards para aparecer aqui.</p>
      )}

      <p className="text-sm text-muted">
        10 XP por acerto na prova (+20 se acertar todas) e 1 a 3 XP por flashcard revisado no dia certo.
      </p>
    </div>
  );
}

function Row({ entry, delay = 0 }: { entry: LeaderboardEntry; delay?: number }) {
  return (
    <li
      aria-current={entry.is_me ? "true" : undefined}
      style={{ animationDelay: `${delay}ms` }}
      className={`flex animate-fade-up items-center gap-4 px-5 py-4 ${entry.is_me ? "bg-primary-soft" : ""}`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          MEDALS[entry.rank - 1] ?? "bg-canvas text-muted"
        }`}
      >
        {entry.rank}º
      </span>
      <Avatar name={entry.name} photoUrl={entry.photo_url} />
      <span className="min-w-0 flex-1 truncate font-medium">
        {entry.name}
        {entry.is_me && <span className="ml-2 text-sm font-normal text-primary">(você)</span>}
      </span>
      <span className="font-semibold tabular-nums">{entry.xp} XP</span>
    </li>
  );
}
