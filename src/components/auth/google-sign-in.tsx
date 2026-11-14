"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HOME_PATH, NEXT_PARAM } from "@/lib/auth/constants";
import { createServerSession } from "@/lib/auth/client-session";
import { authErrorMessage } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/next-path";
import { createGoogleProvider, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { GoogleIcon } from "./google-icon";

type Status = "restoring" | "idle" | "google" | "redirecting";

function destinationAfterLogin() {
  return safeNextPath(new URLSearchParams(window.location.search).get(NEXT_PARAM)) ?? HOME_PATH;
}

export function GoogleSignIn({ expired }: { expired: boolean }) {
  const router = useRouter();
  const configured = isFirebaseConfigured();
  const [status, setStatus] = useState<Status>(configured ? "restoring" : "idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        setStatus("idle");
        return;
      }
      try {
        await finish(user);
      } catch {
        await signOut(auth);
        setStatus("idle");
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  async function finish(user: User) {
    await createServerSession(user, true);
    setStatus("redirecting");
    router.replace(destinationAfterLogin());
  }

  async function handleGoogle() {
    setError(null);
    setStatus("google");
    try {
      const { user } = await signInWithPopup(getFirebaseAuth(), createGoogleProvider());
      await finish(user);
    } catch (caught) {
      setError(authErrorMessage(caught));
      setStatus("idle");
    }
  }

  if (!configured) {
    return (
      <Alert tone="error">
        O login ainda não está configurado. Preencha as variáveis <code>NEXT_PUBLIC_FIREBASE_*</code> no arquivo{" "}
        <code>.env.local</code> e reinicie o servidor.
      </Alert>
    );
  }

  if (status === "restoring" || status === "redirecting") {
    return (
      <div role="status" className="flex items-center gap-3 text-muted">
        <Spinner />
        <span>{status === "restoring" ? "Verificando sua sessão…" : "Tudo certo! Abrindo sua área…"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {expired && !error && <Alert tone="info">Sua sessão expirou. Entre de novo para continuar de onde parou.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      <Button
        variant="secondary"
        block
        icon={<GoogleIcon />}
        loading={status === "google"}
        loadingLabel="Aguardando o Google…"
        onClick={handleGoogle}
      >
        Entrar com Google
      </Button>
      <p className="text-sm text-muted">Usamos sua conta Google só para identificar você e mostrar seu nome no ranking.</p>
    </div>
  );
}
