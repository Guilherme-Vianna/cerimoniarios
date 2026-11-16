"use client";

import {
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trackGuestStart, trackLogin, trackSignUp, type SignInMethod } from "@/lib/analytics";
import { HOME_PATH, NEXT_PARAM, QUIZ_PATH } from "@/lib/auth/constants";
import { createServerSession } from "@/lib/auth/client-session";
import { authErrorMessage } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/next-path";
import { createGoogleProvider, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { isNativeApp, nativeGoogleIdToken } from "@/lib/native-app";
import { EmailAuthForm } from "./email-auth-form";
import { GoogleIcon } from "./google-icon";

type Status = "restoring" | "idle" | "google" | "email" | "guest" | "redirecting";

function destinationAfterLogin() {
  return safeNextPath(new URLSearchParams(window.location.search).get(NEXT_PARAM)) ?? HOME_PATH;
}

export function AuthPanel({ expired }: { expired: boolean }) {
  const router = useRouter();
  const configured = isFirebaseConfigured();
  const [status, setStatus] = useState<Status>(configured ? "restoring" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user || user.isAnonymous) {
        setIsGuest(Boolean(user));
        setStatus("idle");
        return;
      }
      try {
        await createServerSession(user, true);
        setStatus("redirecting");
        router.replace(destinationAfterLogin());
      } catch {
        await signOut(auth);
        setStatus("idle");
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  function fail(caught: unknown) {
    setError(authErrorMessage(caught));
    setStatus("idle");
  }

  /** Signs in for real; a guest's quizzes, flashcards and XP move to the account on the server. */
  async function signInAndFinish(method: SignInMethod, signIn: () => Promise<UserCredential>) {
    const auth = getFirebaseAuth();
    const guest = auth.currentUser?.isAnonymous ? auth.currentUser : null;
    const guestToken = guest ? await guest.getIdToken() : undefined;
    const credential = await signIn();
    await createServerSession(credential.user, true, guestToken);
    if (getAdditionalUserInfo(credential)?.isNewUser) trackSignUp(method, Boolean(guest));
    else trackLogin(method);
    setStatus("redirecting");
    router.replace(destinationAfterLogin());
  }

  async function handleGoogle() {
    setError(null);
    setStatus("google");
    try {
      await signInAndFinish("google", async () => {
        const auth = getFirebaseAuth();
        if (isNativeApp()) {
          return signInWithCredential(auth, GoogleAuthProvider.credential(await nativeGoogleIdToken()));
        }
        return signInWithPopup(auth, createGoogleProvider());
      });
    } catch (caught) {
      fail(caught);
    }
  }

  async function handleEmail(signIn: () => Promise<UserCredential>) {
    setError(null);
    setStatus("email");
    await signInAndFinish("email", signIn);
  }

  async function handleGuest() {
    setError(null);
    setStatus("guest");
    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser?.isAnonymous ? auth.currentUser : (await signInAnonymously(auth)).user;
      await createServerSession(user, true);
      trackGuestStart();
      setStatus("redirecting");
      router.replace(QUIZ_PATH);
    } catch (caught) {
      fail(caught);
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
      <div role="status" className="flex flex-col gap-4">
        <span className="sr-only">
          {status === "restoring" ? "Verificando sua sessão…" : "Tudo certo! Abrindo sua área…"}
        </span>
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  const busy = status !== "idle";

  return (
    <div className="flex flex-col gap-4">
      {expired && !error && <Alert tone="info">Sua sessão expirou. Entre de novo para continuar de onde parou.</Alert>}
      {isGuest && !error && (
        <Alert tone="info">
          Você está fazendo provas como visitante. Entre ou crie uma conta para salvar seus resultados, flashcards e XP.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      <Button
        variant="secondary"
        block
        icon={<GoogleIcon />}
        loading={status === "google"}
        loadingLabel="Aguardando o Google…"
        disabled={busy}
        onClick={handleGoogle}
      >
        Entrar com Google
      </Button>

      <div className="flex items-center gap-3 text-sm text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <EmailAuthForm disabled={busy && status !== "email"} onSignIn={handleEmail} onError={fail} />

      <div className="mt-2 flex flex-col gap-2 rounded-3xl border border-dashed border-border-strong/60 p-4">
        <Button
          variant="secondary"
          block
          loading={status === "guest"}
          loadingLabel="Preparando a prova…"
          disabled={busy}
          onClick={handleGuest}
        >
          {isGuest ? "Continuar como visitante" : "Fazer uma prova sem entrar"}
        </Button>
        <p className="text-center text-sm text-muted">
          O resultado fica guardado e passa para a sua conta quando você entrar.
        </p>
      </div>
    </div>
  );
}
