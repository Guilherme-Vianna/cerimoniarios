import type { Metadata } from "next";
import Link from "next/link";
import { QuizSetup } from "@/components/quiz/quiz-setup";
import { LinkButton } from "@/components/ui/link-button";
import { loadAccount, loadQuizzes, loadTopics } from "@/lib/api/data";
import { QUIZ_PATH } from "@/lib/auth/constants";
import { firstName, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Prova" };

export const maxDuration = 60;

export default async function QuizHomePage({ searchParams }: PageProps<"/prova">) {
  const [{ tema }, topics, account, quizzes] = await Promise.all([searchParams, loadTopics(), loadAccount(), loadQuizzes()]);
  const name = firstName(account.name);
  const inProgress = quizzes.find((quiz) => quiz.status === "in_progress");
  const completed = quizzes.filter((quiz) => quiz.status === "completed").slice(0, 3);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight">{name ? `Olá, ${name}!` : "Olá!"}</h1>
        <p className="mt-2 text-muted">Responda a prova e revise o que errar nos flashcards.</p>
      </div>

      {inProgress ? (
        <section className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-primary-soft p-6">
          <div>
            <h2 className="text-lg font-semibold">Você tem uma prova em andamento</h2>
            <p className="mt-1 text-muted">Suas respostas estão salvas. Termine e entregue para ver a correção.</p>
          </div>
          <LinkButton href={`${QUIZ_PATH}/${inProgress.id}`}>Continuar prova</LinkButton>
        </section>
      ) : (
        <QuizSetup topics={topics} initialTopic={typeof tema === "string" ? tema : null} />
      )}

      {completed.length > 0 && (
        <section aria-labelledby="history-title" className="flex flex-col gap-3">
          <h2 id="history-title" className="text-sm font-medium text-muted">
            Últimas provas
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
            {completed.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`${QUIZ_PATH}/${quiz.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-canvas focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{quiz.topic_label}</span>
                    <span className="text-sm text-muted">{formatDate(quiz.created_at)}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {quiz.score}/{quiz.total}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
