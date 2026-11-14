import type { Metadata } from "next";
import { ReviewSession } from "@/components/review/review-session";
import { loadFlashcards } from "@/lib/api/data";

export const metadata: Metadata = { title: "Revisar" };

export default async function ReviewPage() {
  const cards = await loadFlashcards({ due: true });
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight">Revisar flashcards</h1>
        <p className="mt-2 text-lg text-muted">
          Tente lembrar a resposta antes de virar o card. Seja sincero na nota: é ela que decide quando o card volta.
        </p>
      </div>
      <ReviewSession cards={cards} />
    </div>
  );
}
