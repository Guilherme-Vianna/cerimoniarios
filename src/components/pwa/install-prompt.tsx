"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { APP_NAME, INSTALL_DISMISSED_KEY } from "@/lib/pwa";

/** Chromium-only event; not part of lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Navigator {
    /** iOS Safari: true when launched from the home screen. */
    standalone?: boolean;
  }
}

type Listener = () => void;

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set(next: T) {
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Captured at module load so the event isn't lost if it fires before hydration.
const deferredPrompt = createStore<BeforeInstallPromptEvent | null>(null);
const installed = createStore(false);

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt.set(event);
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt.set(null);
    installed.set(true);
  });
}

const STANDALONE_QUERY = "(display-mode: standalone)";

function subscribeStandalone(listener: Listener) {
  const query = window.matchMedia(STANDALONE_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function isStandalone() {
  return window.matchMedia(STANDALONE_QUERY).matches || navigator.standalone === true;
}

function isIOS() {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as "Macintosh"; touch support gives it away.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

const dismissed = createStore(false);

function readDismissed() {
  try {
    return window.localStorage.getItem(INSTALL_DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

function subscribeDismissed(listener: Listener) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === INSTALL_DISMISSED_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  const unsubscribe = dismissed.subscribe(listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    unsubscribe();
  };
}

function saveDismissed() {
  try {
    window.localStorage.setItem(INSTALL_DISMISSED_KEY, new Date().toISOString());
  } catch {
    // Private mode / storage disabled: still hide for this session.
  }
  dismissed.set(true);
}

const noopSubscribe = () => () => {};
const serverFalse = () => false;
const serverNull = () => null;

export function InstallPrompt() {
  const titleId = useId();
  const [busy, setBusy] = useState(false);

  const promptEvent = useSyncExternalStore(deferredPrompt.subscribe, deferredPrompt.get, serverNull);
  const wasInstalled = useSyncExternalStore(installed.subscribe, installed.get, serverFalse);
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalone, serverFalse);
  const ios = useSyncExternalStore(noopSubscribe, isIOS, serverFalse);
  const isDismissed = useSyncExternalStore(subscribeDismissed, () => dismissed.get() || readDismissed(), serverFalse);

  if (standalone || wasInstalled || isDismissed) return null;
  const mode = promptEvent ? "native" : ios ? "ios" : null;
  if (!mode) return null;

  async function install() {
    if (!promptEvent) return;
    setBusy(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "dismissed") saveDismissed();
    } finally {
      // A prompt event can only be used once.
      deferredPrompt.set(null);
      setBusy(false);
    }
  }

  return (
    <aside
      aria-labelledby={titleId}
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-3xl border border-border bg-surface p-4 shadow-lg shadow-ink/10 motion-safe:animate-[pwa-in_200ms_ease-out] md:inset-x-auto md:right-6 md:bottom-6 md:mx-0 md:w-96"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon, no optimization needed */}
        <img src="/icon-192.png" alt="" width={44} height={44} className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-semibold text-ink">
            Instale o {APP_NAME}
          </h2>
          {mode === "native" ? (
            <p className="mt-0.5 text-sm text-muted">Acesse direto da tela inicial, em tela cheia, como um app.</p>
          ) : (
            <ol className="mt-1 space-y-1 text-sm text-muted">
              <li className="flex flex-wrap items-center gap-1">
                1. Toque em <ShareIcon /> <strong className="font-medium text-ink">Compartilhar</strong>
              </li>
              <li className="flex flex-wrap items-center gap-1">
                2. Escolha <AddIcon /> <strong className="font-medium text-ink">Adicionar à Tela de Início</strong>
              </li>
            </ol>
          )}
        </div>
        <button
          type="button"
          onClick={saveDismissed}
          aria-label="Dispensar convite de instalação"
          className="-mt-1 -mr-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {mode === "native" && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={saveDismissed}
            className="h-10 cursor-pointer rounded-full px-4 text-sm font-medium text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={install}
            disabled={busy}
            className="h-10 cursor-pointer rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            Instalar
          </button>
        </div>
      )}
    </aside>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline size-5 text-[#007aff]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline size-5 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
