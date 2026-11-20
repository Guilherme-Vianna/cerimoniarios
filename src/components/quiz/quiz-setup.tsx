"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/cta";
import { startQuiz } from "@/lib/actions";
import type { Topic } from "@/lib/api/types";
import { QUIZ_PATH } from "@/lib/auth/constants";

const SIZES = [5, 10, 15, 20];
const MIXED = "";

export function QuizSetup({ topics, initialTopic }: { topics: Topic[]; initialTopic: string | null }) {
  const router = useRouter();
  const validInitial = initialTopic && topics.some((item) => item.key === initialTopic) ? initialTopic : MIXED;
  const [topic, setTopic] = useState(validInitial);
  const [size, setSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const topicLabel = topics.find((item) => item.key === topic)?.label ?? "todos os temas";

  function begin() {
    setError(null);
    startTransition(async () => {
      const result = await startQuiz({ topic: topic || null, size });
      if (result.ok) router.push(`${QUIZ_PATH}/${result.data.id}`);
      else setError(result.error);
    });
  }

  return (
    <section aria-labelledby="start-title" className="flex min-w-0 animate-fade-up flex-col gap-5 rounded-3xl border-2 border-gold/40 bg-surface p-6 shadow-sm sm:p-8">
      <div>
        <h2 id="start-title" className="text-xl font-semibold">
          Nova prova
        </h2>
        <p className="mt-1 text-muted">
          {size} perguntas de {topicLabel}, do básico ao avançado.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Button variant="cta" loading={pending} loadingLabel="Preparando perguntas…" onClick={begin}>
        Começar prova agora
        <ArrowIcon />
      </Button>
      {!pending && (
        <p className="-mt-2 text-center text-sm text-muted">Grátis · cerca de {Math.max(2, Math.round(size / 3))} minutos · correção na hora</p>
      )}
      {pending && (
        <p role="status" className="-mt-2 text-center text-sm text-muted">
          A IA está escrevendo suas perguntas. Pode levar até 30 segundos.
        </p>
      )}

      <details open={validInitial !== MIXED} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-1 rounded-full py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
          Personalizar tema e tamanho
          <span aria-hidden="true" className="transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <fieldset disabled={pending} className="mt-4 flex min-w-0 flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tema</span>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="h-12 w-full min-w-0 truncate rounded-2xl border border-border bg-surface px-4 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value={MIXED}>Todos os temas</option>
              {topics.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1.5">
            <span id="size-label" className="text-sm font-medium">
              Perguntas
            </span>
            <div role="radiogroup" aria-labelledby="size-label" className="grid grid-cols-4 gap-2">
              {SIZES.map((value) => (
                <label
                  key={value}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-border font-medium has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary has-focus-visible:outline-2 has-focus-visible:outline-primary"
                >
                  <input
                    type="radio"
                    name="size"
                    value={value}
                    checked={size === value}
                    onChange={() => setSize(value)}
                    className="sr-only"
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
      </details>
    </section>
  );
}
