import type { Metadata } from "next";
import { QuizResult } from "@/components/quiz/quiz-result";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { LinkButton } from "@/components/ui/link-button";
import { loadQuiz } from "@/lib/api/data";
import { QUIZ_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Prova" };

export default async function QuizPage({ params }: PageProps<"/prova/[id]">) {
  const { id } = await params;
  const quiz = await loadQuiz(id);

  if (!quiz) {
    return (
      <div className="flex max-w-lg flex-col items-start gap-4 py-10">
        <h1 className="font-serif text-3xl font-bold">Prova não encontrada</h1>
        <p className="text-muted">Ela pode ter sido descartada. Que tal começar uma nova?</p>
        <LinkButton href={QUIZ_PATH}>Nova prova</LinkButton>
      </div>
    );
  }

  if (quiz.status === "completed") return <QuizResult quiz={quiz} />;
  return <QuizRunner key={quiz.id} quiz={quiz} />;
}
