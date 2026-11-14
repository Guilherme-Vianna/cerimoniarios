"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { QuizRunnerSkeleton } from "@/components/app/page-skeletons";
import { abandonQuiz, submitQuiz } from "@/lib/actions";
import type { Quiz } from "@/lib/api/types";
import { QUIZ_PATH } from "@/lib/auth/constants";
import { plural } from "@/lib/format";

type Answers = Record<string, number>;

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function storageKey(quizId: string) {
  return `cerimoniarios:quiz:${quizId}`;
}

function readSaved(quizId: string): { answers: Answers; index: number } | null {
  try {
    const raw = window.localStorage.getItem(storageKey(quizId));
    return raw ? (JSON.parse(raw) as { answers: Answers; index: number }) : null;
  } catch {
    return null;
  }
}

function writeSaved(quizId: string, value: { answers: Answers; index: number } | null) {
  try {
    if (value) window.localStorage.setItem(storageKey(quizId), JSON.stringify(value));
    else window.localStorage.removeItem(storageKey(quizId));
  } catch {}
}

const noopSubscribe = () => () => {};

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) return <QuizRunnerSkeleton />;
  return <Runner quiz={quiz} saved={readSaved(quiz.id)} />;
}

function Runner({ quiz, saved }: { quiz: Quiz; saved: { answers: Answers; index: number } | null }) {
  const router = useRouter();
  const questions = quiz.questions;
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? {});
  const [index, setIndex] = useState(Math.min(saved?.index ?? 0, questions.length - 1));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    writeSaved(quiz.id, { answers, index });
  }, [quiz.id, answers, index]);

  const question = questions[index];
  const answeredCount = questions.filter((item) => answers[item.id] !== undefined).length;
  const unanswered = questions.length - answeredCount;
  const isLast = index === questions.length - 1;

  const choose = useCallback(
    (optionIndex: number) => {
      setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
    },
    [question.id],
  );

  const go = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(questions.length - 1, next))),
    [questions.length],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (confirmOpen || pending || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      const key = event.key.toUpperCase();
      const numeric = Number.parseInt(key, 10);
      const letter = LETTERS.indexOf(key);
      const option = numeric >= 1 ? numeric - 1 : letter;
      if (option >= 0 && option < question.options.length) {
        event.preventDefault();
        choose(option);
      } else if (event.key === "ArrowRight" || (event.key === "Enter" && target?.tagName !== "BUTTON")) {
        event.preventDefault();
        if (isLast) setConfirmOpen(true);
        else go(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, go, index, isLast, confirmOpen, pending, question.options.length]);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitQuiz(
        quiz.id,
        questions.map((item) => ({ question_id: item.id, selected_index: answers[item.id] ?? null })),
      );
      if (result.ok) {
        writeSaved(quiz.id, null);
        setConfirmOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  const selected = answers[question.id];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 text-sm text-muted">
          <span>
            Pergunta <strong className="text-ink">{index + 1}</strong> de {questions.length}
          </span>
          <span>{plural(answeredCount, "respondida", "respondidas")}</span>
        </div>
        <div
          role="progressbar"
          aria-label="Progresso da prova"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answeredCount}
          className="h-2 overflow-hidden rounded-full bg-border"
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <nav aria-label="Ir para pergunta" className="flex flex-wrap gap-2">
          {questions.map((item, itemIndex) => {
            const done = answers[item.id] !== undefined;
            const current = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(itemIndex)}
                aria-current={current ? "step" : undefined}
                aria-label={`Pergunta ${itemIndex + 1}${done ? ", respondida" : ", sem resposta"}`}
                className={`size-9 cursor-pointer rounded-full text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  current
                    ? "bg-primary text-white"
                    : done
                      ? "bg-primary-soft text-primary"
                      : "border border-border bg-surface text-muted hover:border-border-strong"
                }`}
              >
                {itemIndex + 1}
              </button>
            );
          })}
        </nav>
      </div>

      <section key={question.id} aria-labelledby="question-prompt" className="animate-card-in rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium text-gold">{question.topic_label}</p>
        <h2 id="question-prompt" className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">
          {question.prompt}
        </h2>
        <div role="radiogroup" aria-labelledby="question-prompt" className="mt-6 flex flex-col gap-3">
          {question.options.map((option, optionIndex) => {
            const checked = selected === optionIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => choose(optionIndex)}
                style={{ animationDelay: `${optionIndex * 50}ms` }}
                className={`flex animate-fade-up cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-[background-color,border-color,transform] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  checked ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong hover:bg-canvas"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    checked ? "animate-pop bg-primary text-white" : "bg-canvas text-muted"
                  }`}
                >
                  {LETTERS[optionIndex]}
                </span>
                <span className="pt-1">{option}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 hidden text-xs text-muted sm:block">
          Atalhos: teclas 1–4 escolhem a alternativa, ← e → navegam entre as perguntas.
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ConfirmDialog
          title="Desistir desta prova?"
          description="As respostas desta prova serão descartadas e ela não conta XP. Você pode começar outra quando quiser."
          confirmLabel="Desistir"
          pendingLabel="Descartando…"
          onConfirm={async () => {
            const result = await abandonQuiz(quiz.id);
            if (result.ok) {
              writeSaved(quiz.id, null);
              router.push(QUIZ_PATH);
            }
            return result;
          }}
          trigger={(open) => (
            <Button variant="link" className="self-center text-muted" onClick={open}>
              Desistir da prova
            </Button>
          )}
        />
        <div className="flex gap-3">
          <Button variant="secondary" block={false} className="flex-1 sm:flex-none" disabled={index === 0} onClick={() => go(index - 1)}>
            Anterior
          </Button>
          {isLast ? (
            <Button block={false} className="flex-1 sm:flex-none" onClick={() => setConfirmOpen(true)}>
              Entregar prova
            </Button>
          ) : (
            <Button block={false} className="flex-1 sm:flex-none" onClick={() => go(index + 1)}>
              Próxima
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        locked={pending}
        title="Entregar a prova?"
        description={
          unanswered > 0
            ? `Você deixou ${plural(unanswered, "pergunta", "perguntas")} sem resposta. Elas contam como erro e viram flashcards.`
            : "Depois de entregar não dá para mudar as respostas."
        }
      >
        {error && <Alert tone="error">{error}</Alert>}
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" autoFocus disabled={pending} onClick={() => setConfirmOpen(false)}>
            {unanswered > 0 ? "Voltar e responder" : "Revisar respostas"}
          </Button>
          <Button className="sm:w-auto" loading={pending} loadingLabel="Corrigindo…" onClick={handleSubmit}>
            {unanswered > 0 ? "Entregar assim mesmo" : "Entregar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
