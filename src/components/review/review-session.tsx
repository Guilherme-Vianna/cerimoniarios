"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ReferenceLink } from "@/components/ui/reference-link";
import { refreshPage, reviewCard } from "@/lib/actions";
import type { Flashcard, Rating } from "@/lib/api/types";
import { CARDS_PATH, QUIZ_PATH } from "@/lib/auth/constants";
import { formatInterval, plural } from "@/lib/format";

const RATINGS: { value: Rating; label: string; key: string; tone: string }[] = [
  { value: "again", label: "Errei", key: "1", tone: "border-danger/40 text-danger hover:bg-danger-soft" },
  { value: "hard", label: "Difícil", key: "2", tone: "border-gold/40 text-gold hover:bg-gold-soft" },
  { value: "good", label: "Bom", key: "3", tone: "border-success/40 text-success hover:bg-success-soft" },
  { value: "easy", label: "Fácil", key: "4", tone: "border-primary/30 text-primary hover:bg-primary-soft" },
];

const HARD_CARD_MISSES = 3;

type Outcome = { misses: number; done: boolean };
type Tone = "success" | "gold" | "danger";

const toneClasses: Record<Tone, string> = {
  success: "border-success/30 bg-success-soft text-success",
  gold: "border-gold/30 bg-gold-soft text-gold",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

function feedbackFor(hits: number, attempts: number): { tone: Tone; text: string } | null {
  if (attempts < 3) return null;
  const ratio = hits / attempts;
  if (ratio >= 0.8) return { tone: "success", text: "Mandando bem! Você está lembrando quase tudo." };
  if (ratio >= 0.5) return { tone: "gold", text: "No caminho certo. Leia as explicações com calma." };
  return {
    tone: "danger",
    text: "Errando bastante, e tudo bem: é assim que se aprende. Leia a explicação antes de seguir.",
  };
}

export function ReviewSession({ cards: initialCards }: { cards: Flashcard[] }) {
  const [cards] = useState(initialCards);
  const [queue, setQueue] = useState(cards);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [xp, setXp] = useState(0);
  const [xpPop, setXpPop] = useState<{ id: number; amount: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const answerRef = useRef<HTMLDivElement>(null);

  const total = cards.length;
  const card = queue[0];
  const finished = ended || !card;

  const counts = useMemo(() => {
    const values = Object.values(outcomes);
    return {
      firstTry: values.filter((item) => item.done && item.misses === 0).length,
      afterMiss: values.filter((item) => item.done && item.misses > 0).length,
      toRetry: values.filter((item) => !item.done && item.misses > 0).length,
    };
  }, [outcomes]);
  const done = counts.firstTry + counts.afterMiss;
  const feedback = feedbackFor(hits, attempts);

  useEffect(() => {
    if (finished && attempts > 0) void refreshPage();
  }, [finished, attempts]);

  const reveal = useCallback(() => {
    setRevealed(true);
    requestAnimationFrame(() => answerRef.current?.focus());
  }, []);

  const rate = useCallback(
    (rating: Rating) => {
      if (!card || pending) return;
      setError(null);
      startTransition(async () => {
        const result = await reviewCard(card.id, rating);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const missed = rating === "again";
        const misses = (outcomes[card.id]?.misses ?? 0) + (missed ? 1 : 0);
        setOutcomes((current) => ({ ...current, [card.id]: { misses, done: !missed } }));
        setAttempts((current) => current + 1);
        if (!missed) setHits((current) => current + 1);
        if (result.data.xp_earned > 0) {
          setXp((current) => current + result.data.xp_earned);
          setXpPop({ id: Date.now(), amount: result.data.xp_earned });
        }
        setNotice(
          missed
            ? misses >= HARD_CARD_MISSES
              ? "Este card está difícil. Releia a explicação com calma: ele volta mais uma vez no fim da fila."
              : "Sem problema! Este card volta no fim da fila para você tentar de novo."
            : null,
        );
        setQueue((current) => {
          const rest = current.slice(1);
          return missed ? [...rest, result.data.card] : rest;
        });
        setRevealed(false);
      });
    },
    [card, pending, outcomes],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (finished || !card || pending || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!revealed && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        reveal();
        return;
      }
      const rating = RATINGS.find((item) => item.key === event.key);
      if (revealed && rating) {
        event.preventDefault();
        rate(rating.value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, finished, pending, revealed, reveal, rate]);

  if (finished) {
    return <Summary cards={cards} outcomes={outcomes} counts={counts} xp={xp} attempts={attempts} total={total} />;
  }

  const misses = outcomes[card.id]?.misses ?? 0;
  const segment = (value: number) => `${(value / Math.max(total, 1)) * 100}%`;

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Progresso da revisão" className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4">
        <div className="relative flex items-baseline justify-between gap-3">
          <p className="font-semibold">
            {done} de {total} <span className="font-normal text-muted">{total === 1 ? "card concluído" : "cards concluídos"}</span>
          </p>
          <span className="text-sm text-muted tabular-nums">+{xp} XP</span>
          {xpPop && (
            <span
              key={xpPop.id}
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 right-0 animate-float-up rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-white"
            >
              +{xpPop.amount} XP
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Cards concluídos"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="flex h-2.5 overflow-hidden rounded-full bg-border"
        >
          <div className="h-full bg-success transition-[width] duration-500" style={{ width: segment(counts.firstTry) }} />
          <div className="h-full bg-gold transition-[width] duration-500" style={{ width: segment(counts.afterMiss) }} />
          <div className="h-full bg-danger/50 transition-[width] duration-500" style={{ width: segment(counts.toRetry) }} />
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <Legend color="bg-success" label="De primeira" value={counts.firstTry} />
          <Legend color="bg-gold" label="Depois de errar" value={counts.afterMiss} />
          <Legend color="bg-danger/50" label="Para repetir" value={counts.toRetry} />
        </ul>
        {feedback && (
          <p key={feedback.tone} className={`animate-fade-in rounded-2xl border px-3 py-2 text-sm font-medium ${toneClasses[feedback.tone]}`}>
            {feedback.text}
          </p>
        )}
      </section>

      {notice && (
        <p key={`${card.id}-${attempts}`} role="status" className="animate-fade-up rounded-2xl bg-canvas px-4 py-2 text-sm text-muted">
          {notice}
        </p>
      )}

      <article
        key={`${card.id}-${attempts}`}
        aria-live="polite"
        className="flex min-h-72 animate-card-in flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10"
      >
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-gold">{card.topic_label}</span>
          {misses > 0 && (
            <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-semibold text-danger">
              {misses === 1 ? "Repetindo" : `${misses}ª repetição`}
            </span>
          )}
        </div>
        <h2 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">{card.front}</h2>

        {revealed ? (
          <div
            ref={answerRef}
            tabIndex={-1}
            className="mt-8 flex animate-reveal flex-col gap-3 border-t border-border pt-6 outline-none"
          >
            <p className="text-xl font-semibold text-primary">{card.back}</p>
            {card.explanation && <p className="leading-relaxed text-muted">{card.explanation}</p>}
            <ReferenceLink reference={card.reference} url={card.reference_url} />
          </div>
        ) : (
          <div className="mt-auto pt-8">
            <Button onClick={reveal}>Mostrar resposta</Button>
            <p className="mt-3 hidden text-center text-xs text-muted sm:block">Tente lembrar antes. Atalho: espaço.</p>
          </div>
        )}
      </article>

      {error && <Alert tone="error">{error}</Alert>}

      {revealed && (
        <div className="flex animate-fade-up flex-col gap-3">
          <p className="text-sm text-muted">Como foi lembrar a resposta? (teclas 1 a 4)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RATINGS.map((item) => (
              <button
                key={item.value}
                type="button"
                disabled={pending}
                onClick={() => rate(item.value)}
                className={`flex cursor-pointer flex-col items-center rounded-2xl border bg-surface px-4 py-3 font-semibold transition-[background-color,transform] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 ${item.tone}`}
              >
                {item.label}
                <span className="text-xs font-normal text-muted">
                  {item.value === "again" ? "volta no fim da fila" : `próxima em ${formatInterval(card.next_intervals[item.value])}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {attempts > 0 && (
        <button
          type="button"
          onClick={() => setEnded(true)}
          className="cursor-pointer self-center rounded-full px-4 py-2 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Encerrar por hoje
        </button>
      )}
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className={`size-2 rounded-full ${color}`} />
      {label}: <strong className="font-semibold text-ink tabular-nums">{value}</strong>
    </li>
  );
}

function Summary({
  cards,
  outcomes,
  counts,
  xp,
  attempts,
  total,
}: {
  cards: Flashcard[];
  outcomes: Record<string, Outcome>;
  counts: { firstTry: number; afterMiss: number; toRetry: number };
  xp: number;
  attempts: number;
  total: number;
}) {
  if (attempts === 0) {
    return (
      <div className="flex animate-fade-up flex-col items-start gap-4 rounded-3xl border border-border bg-surface p-8">
        <h2 className="font-serif text-3xl font-bold">Tudo em dia!</h2>
        <p className="text-lg text-muted">
          Nenhum flashcard para revisar agora. Faça uma prova para descobrir o que ainda falta aprender.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <LinkButton href={QUIZ_PATH}>Fazer uma prova</LinkButton>
          <LinkButton href={CARDS_PATH} variant="secondary">
            Ver meus flashcards
          </LinkButton>
        </div>
      </div>
    );
  }

  const reviewed = counts.firstTry + counts.afterMiss + counts.toRetry;
  const ratio = reviewed ? counts.firstTry / reviewed : 0;
  const missed = cards
    .filter((card) => (outcomes[card.id]?.misses ?? 0) > 0)
    .sort((a, b) => (outcomes[b.id]?.misses ?? 0) - (outcomes[a.id]?.misses ?? 0))
    .slice(0, 5);
  const verdict =
    ratio >= 0.8
      ? "Excelente! Você domina estes cards."
      : ratio >= 0.5
        ? "Bom trabalho. Os que você errou vão voltar mais vezes até fixar."
        : "Dia de muito aprendizado. Revise de novo amanhã: a repetição é o que faz fixar.";

  return (
    <div className="flex flex-col gap-5">
      <section className="flex animate-fade-up flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-8 text-center">
        <ScoreRing ratio={ratio} />
        <div>
          <h2 className="font-serif text-3xl font-bold">
            {counts.toRetry > 0 ? "Revisão encerrada" : "Revisão concluída!"}
          </h2>
          <p className="mt-2 text-muted">{verdict}</p>
        </div>
        <dl className="grid w-full grid-cols-3 gap-2 text-center">
          <SummaryStat label="De primeira" value={counts.firstTry} className="text-success" />
          <SummaryStat label="Depois de errar" value={counts.afterMiss} className="text-gold" />
          <SummaryStat label="XP ganho" value={`+${xp}`} className="text-primary" />
        </dl>
        {counts.toRetry > 0 && (
          <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-muted">
            {plural(counts.toRetry, "card ficou", "cards ficaram")} para repetir. Eles voltam na sua próxima revisão, em
            cerca de 10 minutos.
          </p>
        )}
        {reviewed < total && counts.toRetry === 0 && (
          <p className="text-sm text-muted">
            {plural(total - reviewed, "card continua", "cards continuam")} na fila para depois.
          </p>
        )}
      </section>

      {missed.length > 0 && (
        <section aria-labelledby="missed-title" className="flex animate-fade-up flex-col gap-3 [animation-delay:120ms]">
          <h3 id="missed-title" className="text-sm font-medium text-muted">
            Para reforçar
          </h3>
          <ul className="flex flex-col gap-2">
            {missed.map((card) => (
              <li key={card.id} className="rounded-2xl border border-border bg-surface px-4 py-3">
                <p className="font-medium">{card.front}</p>
                <p className="mt-1 text-sm text-primary">{card.back}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href={QUIZ_PATH}>Fazer uma prova</LinkButton>
        <LinkButton href={CARDS_PATH} variant="secondary">
          Ver meus flashcards
        </LinkButton>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, className }: { label: string; value: number | string; className: string }) {
  return (
    <div className="rounded-2xl bg-canvas px-2 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold tabular-nums ${className}`}>{value}</dd>
    </div>
  );
}

function ScoreRing({ ratio }: { ratio: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const color = ratio >= 0.8 ? "var(--color-success)" : ratio >= 0.5 ? "var(--color-gold)" : "var(--color-danger)";
  return (
    <div className="relative size-32 animate-pop">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{Math.round(ratio * 100)}%</span>
        <span className="text-xs text-muted">de primeira</span>
      </div>
    </div>
  );
}
