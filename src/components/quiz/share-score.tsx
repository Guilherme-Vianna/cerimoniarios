"use client";

import { Button } from "@/components/ui/button";
import { trackShare } from "@/lib/analytics";
import { APP_NAME } from "@/lib/pwa";

export function shareMessage(score: number, total: number, url: string) {
  const result = score === total ? `Gabaritei a prova (${score} de ${total})` : `Acertei ${score} de ${total} perguntas`;
  return `${result} sobre a liturgia da Missa no ${APP_NAME}! ⛪ Teste você também, é grátis: ${url}`;
}

export function ShareScore({ score, total }: { score: number; total: number }) {
  async function handleShare() {
    const url = window.location.origin;
    const text = shareMessage(score, total, url);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        trackShare("native");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    trackShare("whatsapp");
  }

  return (
    <Button variant="secondary" block={false} icon={<ShareIcon />} onClick={handleShare}>
      Compartilhar pontuação
    </Button>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}
