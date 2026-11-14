"use client";

import { useSyncExternalStore } from "react";

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

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as "Macintosh"; touch support gives it away.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export type InstallPlatform = "ios" | "android" | "desktop";

const noopSubscribe = () => () => {};
const serverFalse = () => false;
const serverTrue = () => true;
const serverNull = () => null;
const serverPlatform = (): InstallPlatform => "desktop";

export function useInstall() {
  const promptEvent = useSyncExternalStore(deferredPrompt.subscribe, deferredPrompt.get, serverNull);
  const wasInstalled = useSyncExternalStore(installed.subscribe, installed.get, serverFalse);
  // Hidden during SSR so the button never flashes for people already in the installed app.
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalone, serverTrue);
  const platform = useSyncExternalStore(noopSubscribe, detectPlatform, serverPlatform);
  const secure = useSyncExternalStore(noopSubscribe, () => window.isSecureContext, serverTrue);

  async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!promptEvent) return "unavailable";
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      return outcome;
    } finally {
      // A prompt event can only be used once.
      deferredPrompt.set(null);
    }
  }

  return {
    installed: standalone || wasInstalled,
    canPromptNatively: promptEvent !== null,
    platform,
    secure,
    promptInstall,
  };
}
