"use client";

import { useEffect } from "react";
import { SERVICE_WORKER_PATH } from "@/lib/pwa";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // In dev, a SW would cache stale chunks and fight HMR; drop any leftover one.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(() => {});
      return;
    }
    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: "/", updateViaCache: "none" })
      .catch((error: unknown) => console.error("Falha ao registrar o service worker", error));
  }, []);

  return null;
}
