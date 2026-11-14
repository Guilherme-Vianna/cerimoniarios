"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { APP_NAME } from "@/lib/pwa";
import { useInstall, type InstallPlatform } from "@/lib/pwa-install";

export function InstallButton() {
  const { installed, canPromptNatively, platform, secure, promptInstall } = useInstall();
  const [helpOpen, setHelpOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (installed) return null;

  async function handleClick() {
    if (canPromptNatively) {
      setBusy(true);
      try {
        await promptInstall();
      } finally {
        setBusy(false);
      }
      return;
    }
    setHelpOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-medium text-white transition-[background-color,transform] hover:bg-primary-hover active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:bg-primary/60"
      >
        <DownloadIcon />
        Instalar
      </button>
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={`Instalar o ${APP_NAME}`}>
        <InstallSteps platform={platform} secure={secure} />
        <Button onClick={() => setHelpOpen(false)}>Entendi</Button>
      </Modal>
    </>
  );
}

function InstallSteps({ platform, secure }: { platform: InstallPlatform; secure: boolean }) {
  if (!secure) {
    return (
      <p className="text-muted">
        A instalação só funciona no endereço oficial com cadeado (https). Abra o site publicado neste aparelho e toque em
        Instalar de novo.
      </p>
    );
  }
  if (platform === "ios") {
    return (
      <ol className="flex flex-col gap-3 text-ink">
        <Step number={1}>
          Abra este site no <strong className="font-semibold">Safari</strong>.
        </Step>
        <Step number={2}>
          Toque em <ShareIcon /> <strong className="font-semibold">Compartilhar</strong>, na barra de baixo.
        </Step>
        <Step number={3}>
          Escolha <AddIcon /> <strong className="font-semibold">Adicionar à Tela de Início</strong> e confirme.
        </Step>
      </ol>
    );
  }
  if (platform === "android") {
    return (
      <ol className="flex flex-col gap-3 text-ink">
        <Step number={1}>
          Abra este site no <strong className="font-semibold">Chrome</strong>.
        </Step>
        <Step number={2}>
          Toque no menu <strong className="font-semibold">⋮</strong>, no canto de cima.
        </Step>
        <Step number={3}>
          Escolha <strong className="font-semibold">Instalar app</strong> (ou{" "}
          <strong className="font-semibold">Adicionar à tela inicial</strong>).
        </Step>
      </ol>
    );
  }
  return (
    <ol className="flex flex-col gap-3 text-ink">
      <Step number={1}>
        Use o <strong className="font-semibold">Chrome</strong> ou o <strong className="font-semibold">Edge</strong>.
      </Step>
      <Step number={2}>
        Clique no ícone de instalar na barra de endereço, ou no menu <strong className="font-semibold">⋮</strong> →{" "}
        <strong className="font-semibold">Instalar {APP_NAME}</strong>.
      </Step>
    </ol>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {number}
      </span>
      <span className="flex flex-wrap items-center gap-1 pt-0.5">{children}</span>
    </li>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline size-5 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
