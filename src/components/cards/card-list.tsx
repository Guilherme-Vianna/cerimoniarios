"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReferenceLink } from "@/components/ui/reference-link";
import { deleteCard } from "@/lib/actions";
import type { Flashcard } from "@/lib/api/types";
import { formatDate, plural } from "@/lib/format";

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function CardList({ cards, now }: { cards: Flashcard[]; now: string }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const nowTime = new Date(now).getTime();

  const topics = useMemo(() => {
    const map = new Map<string, string>();
    for (const card of cards) map.set(card.topic, card.topic_label);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [cards]);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return cards.filter(
      (card) =>
        (!topic || card.topic === topic) &&
        (!needle || normalize(`${card.front} ${card.back} ${card.explanation ?? ""}`).includes(needle)),
    );
  }, [cards, query, topic]);

  const hasFilters = Boolean(query || topic);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium">Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: casula, turíbulo, Glória"
            className="h-12 rounded-2xl border border-border bg-surface px-4 outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:w-64">
          <span className="text-sm font-medium">Tema</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="h-12 w-full min-w-0 rounded-2xl border border-border bg-surface px-4 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <option value="">Todos os temas</option>
            {topics.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className="text-sm text-muted">
        {plural(visible.length, "flashcard", "flashcards")}
        {hasFilters && (
          <>
            {" · "}
            <Button
              variant="link"
              className="text-sm"
              onClick={() => {
                setQuery("");
                setTopic("");
              }}
            >
              Limpar filtros
            </Button>
          </>
        )}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted">
          Nenhum flashcard com esses filtros.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((card, index) => {
            const due = new Date(card.due_at).getTime() <= nowTime;
            return (
              <li
                key={card.id}
                style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
                className="flex animate-fade-up flex-col gap-3 rounded-3xl border border-border bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-gold">{card.topic_label}</span>
                  <span className={due ? "font-medium text-primary" : "text-muted"}>
                    {due ? "Revisar agora" : `Próxima: ${formatDate(card.due_at)}`}
                  </span>
                </div>
                <p className="font-semibold">{card.front}</p>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary">Ver resposta</summary>
                  <div className="animate-fade-in">
                  <p className="mt-2 font-medium">{card.back}</p>
                  {card.explanation && <p className="mt-1 text-sm leading-relaxed text-muted">{card.explanation}</p>}
                  <div className="mt-2">
                    <ReferenceLink reference={card.reference} url={card.reference_url} />
                  </div>
                  </div>
                </details>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm text-muted">
                  <span>
                    {card.lapses > 0 ? `Errou ${plural(card.lapses, "vez", "vezes")}` : "Sem erros na revisão"}
                  </span>
                  <ConfirmDialog
                    title="Apagar este flashcard?"
                    description="Ele sai das suas revisões. Se você errar a mesma pergunta numa prova, ele volta."
                    confirmLabel="Apagar"
                    pendingLabel="Apagando…"
                    onConfirm={() => deleteCard(card.id)}
                    trigger={(open) => (
                      <Button variant="link" className="text-sm text-muted hover:text-danger" onClick={open}>
                        Apagar
                      </Button>
                    )}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
