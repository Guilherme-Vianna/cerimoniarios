import type { Metadata } from "next";
import { CardList } from "@/components/cards/card-list";
import { LinkButton } from "@/components/ui/link-button";
import { loadFlashcards } from "@/lib/api/data";
import { QUIZ_PATH, REVIEW_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage() {
  const cards = await loadFlashcards();
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const dueCount = cards.filter((card) => new Date(card.due_at) <= nowDate).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">Seus flashcards</h1>
          <p className="mt-2 text-lg text-muted">Tudo o que você errou nas provas, com a explicação.</p>
        </div>
        {dueCount > 0 && <LinkButton href={REVIEW_PATH}>Revisar {dueCount} agora</LinkButton>}
      </div>
      {cards.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-surface p-8">
          <p className="text-lg font-semibold">Você ainda não tem flashcards</p>
          <p className="text-muted">Eles são criados automaticamente a partir das perguntas que você erra nas provas.</p>
          <LinkButton href={QUIZ_PATH}>Fazer uma prova</LinkButton>
        </div>
      ) : (
        <CardList cards={cards} now={now} />
      )}
    </div>
  );
}
