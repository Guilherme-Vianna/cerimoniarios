"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-10">
      <h1 className="font-serif text-3xl font-bold">Não conseguimos carregar esta página</h1>
      <p className="text-muted">
        O servidor não respondeu. Confira sua conexão com a internet e tente de novo. Se continuar, avise o
        coordenador dos cerimoniários.
      </p>
      <Button block={false} onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
