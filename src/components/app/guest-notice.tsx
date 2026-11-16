import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { LOGIN_PATH, NEXT_PARAM } from "@/lib/auth/constants";

export function loginHref(next?: string) {
  return next ? `${LOGIN_PATH}?${NEXT_PARAM}=${encodeURIComponent(next)}` : LOGIN_PATH;
}

export function GuestNotice({ next, children }: { next?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-gold/30 bg-gold-soft p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-ink">{children}</p>
      <LinkButton href={loginHref(next)} className="shrink-0">
        Entrar e salvar
      </LinkButton>
    </section>
  );
}
