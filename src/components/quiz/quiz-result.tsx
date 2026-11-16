import { GuestNotice } from "@/components/app/guest-notice";
import { DonationCard } from "@/components/support/donation-card";
import { LinkButton } from "@/components/ui/link-button";
import { ReferenceLink } from "@/components/ui/reference-link";
import type { Question, Quiz } from "@/lib/api/types";
import { QUIZ_PATH, REVIEW_PATH } from "@/lib/auth/constants";
import { plural } from "@/lib/format";
import { ShareScore } from "./share-score";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function verdict(score: number, total: number) {
  const ratio = total ? score / total : 0;
  if (ratio === 1) return "Perfeito! Você está pronto para o altar.";
  if (ratio >= 0.8) return "Muito bem! Revise os detalhes que faltaram.";
  if (ratio >= 0.5) return "Bom começo. Os flashcards vão ajudar a fixar o resto.";
  return "Sem problema: é errando que se aprende. Revise os flashcards e tente de novo.";
}

export function QuizResult({ quiz, guest = false }: { quiz: Quiz; guest?: boolean }) {
  const score = quiz.score ?? 0;
  const cards = quiz.cards_created ?? 0;
  const usedBank = quiz.questions.some((question) => question.source === "bank");

  return (
    <div className="flex flex-col gap-8">
      {guest && (
        <GuestNotice next={`${QUIZ_PATH}/${quiz.id}`}>
          Este resultado está guardado como visitante. Entre com Google ou e-mail para que o XP conte no ranking e os
          flashcards fiquem na sua conta.
        </GuestNotice>
      )}
      <section aria-labelledby="result-title" className="animate-fade-up rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium text-gold">
          {quiz.topic_label}
        </p>
        <h1 id="result-title" className="mt-2 animate-pop font-serif text-4xl font-bold tracking-tight [animation-delay:150ms]">
          Você acertou {score} de {quiz.total}
        </h1>
        <p className="mt-2 text-lg text-muted">{verdict(score, quiz.total)}</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <dt className="text-sm text-muted">XP ganho</dt>
            <dd className="text-2xl font-semibold text-gold">+{quiz.xp_earned ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Flashcards para revisar</dt>
            <dd className="text-2xl font-semibold">{cards}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {cards > 0 && <LinkButton href={REVIEW_PATH}>Revisar {plural(cards, "flashcard", "flashcards")}</LinkButton>}
          <LinkButton href={QUIZ_PATH} variant={cards > 0 ? "secondary" : "primary"}>
            Fazer outra prova
          </LinkButton>
          <ShareScore score={score} total={quiz.total} />
        </div>
        {usedBank && (
          <p className="mt-4 text-sm text-muted">
            Algumas perguntas vieram do nosso banco revisado porque a IA não respondeu a tempo.
          </p>
        )}
      </section>

      <DonationCard />

      <section aria-labelledby="review-title" className="flex flex-col gap-4">
        <h2 id="review-title" className="text-xl font-semibold">
          Correção
        </h2>
        <ol className="flex flex-col gap-3">
          {quiz.questions.map((question, index) => (
            <QuestionReview key={question.id} question={question} delay={Math.min(index, 10) * 40} />
          ))}
        </ol>
      </section>
    </div>
  );
}

function QuestionReview({ question, delay }: { question: Question; delay: number }) {
  const correct = question.is_correct === true;
  return (
    <li className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <details
        open={!correct}
        className={`group rounded-3xl border bg-surface ${correct ? "border-border" : "border-danger/30"}`}
      >
        <summary className="flex cursor-pointer list-none items-start gap-4 p-5 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
          <span
            className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}
          >
            {correct ? "Certa" : question.selected_index === null ? "Em branco" : "Errada"}
          </span>
          <span className="flex-1 font-medium">
            {question.position + 1}. {question.prompt}
          </span>
          <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="flex flex-col gap-3 px-5 pb-5">
          <ul className="flex flex-col gap-2">
            {question.options.map((option, index) => {
              const isAnswer = index === question.correct_index;
              const isChoice = index === question.selected_index;
              return (
                <li
                  key={index}
                  className={`flex items-start gap-3 rounded-2xl px-3 py-2 ${
                    isAnswer ? "bg-success-soft" : isChoice ? "bg-danger-soft" : ""
                  }`}
                >
                  <span className="font-semibold text-muted">{LETTERS[index]}</span>
                  <span className="flex-1">{option}</span>
                  {isAnswer && <span className="text-sm font-medium text-success">Resposta certa</span>}
                  {isChoice && !isAnswer && <span className="text-sm font-medium text-danger">Sua resposta</span>}
                </li>
              );
            })}
          </ul>
          {question.explanation && (
            <p className="rounded-2xl bg-gold-soft px-4 py-3 leading-relaxed">
              <strong className="font-semibold">Por quê: </strong>
              {question.explanation}
            </p>
          )}
          <ReferenceLink reference={question.reference} url={question.reference_url} />
        </div>
      </details>
    </li>
  );
}
