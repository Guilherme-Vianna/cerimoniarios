"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { trackDonateClick } from "@/lib/analytics";
import { DONATION_URL, isDonationConfigured, PIX_KEY, PIX_RECIPIENT } from "@/lib/donation";
import { isNativeApp } from "@/lib/native-app";

const noSubscription = () => () => {};

/** Shown right after a quiz result, when the person has just seen the app's value. */
export function DonationCard() {
  // Google Play does not allow outside payments in the Android app; it has its own Play Billing support screen.
  const nativeApp = useSyncExternalStore(noSubscription, isNativeApp, () => false);
  const [copied, setCopied] = useState(false);

  if (nativeApp || !isDonationConfigured()) return null;

  async function copyPixKey() {
    if (!PIX_KEY) return;
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    trackDonateClick("pix_copy");
  }

  return (
    <section
      aria-labelledby="donation-title"
      className="flex animate-fade-up flex-col gap-4 rounded-3xl border border-primary/20 bg-primary-soft p-6 [animation-delay:300ms]"
    >
      <div>
        <h2 id="donation-title" className="font-serif text-2xl font-bold tracking-tight">
          Ajude a manter o app no ar
        </h2>
        <p className="mt-2 text-ink">
          Este projeto é gratuito para ajudar cerimoniários a servirem melhor no altar. Apoie com qualquer valor pelo Pix
          para mantermos os servidores funcionando.
        </p>
      </div>

      {PIX_KEY && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="min-w-0">
            <p className="text-sm text-muted">Chave Pix</p>
            <p className="break-all font-mono text-ink">{PIX_KEY}</p>
            {PIX_RECIPIENT && <p className="mt-1 text-sm text-muted">Em nome de {PIX_RECIPIENT}</p>}
          </div>
          <Button onClick={copyPixKey}>{copied ? "Chave copiada!" : "Copiar chave Pix"}</Button>
          {copied && (
            <p role="status" className="text-sm text-muted">
              Abra o app do seu banco, escolha Pix → Copia e cola ou Chave, e doe o valor que quiser. Obrigado!
            </p>
          )}
        </div>
      )}

      {DONATION_URL && (
        <a
          href={DONATION_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackDonateClick("link")}
          className="self-start font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Prefere cartão? Doe por aqui ↗
        </a>
      )}
    </section>
  );
}
