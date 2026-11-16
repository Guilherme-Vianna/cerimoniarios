"use client";

import { signInAnonymously } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { trackGuestStart } from "@/lib/analytics";
import { NEXT_PARAM, QUIZ_PATH } from "@/lib/auth/constants";
import { createServerSession } from "@/lib/auth/client-session";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

let starting: Promise<boolean> | null = null;

/**
 * Reuses whoever is already signed in on this browser (a returning guest or a member whose cookie expired);
 * otherwise creates a guest. Shared promise so a double effect run never creates two guests.
 */
function startSession(): Promise<boolean> {
  starting ??= (async () => {
    if (!isFirebaseConfigured()) return false;
    try {
      const auth = getFirebaseAuth();
      await auth.authStateReady();
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      await createServerSession(user, true);
      if (user.isAnonymous) trackGuestStart();
      return true;
    } catch {
      starting = null;
      return false;
    }
  })();
  return starting;
}

export function GuestStart() {
  const router = useRouter();

  useEffect(() => {
    // The query string (gclid, utm_*, tema) goes along to the quiz page.
    const quiz = `${QUIZ_PATH}${window.location.search}`;
    let active = true;
    startSession().then((ok) => {
      if (active) router.replace(ok ? quiz : `/?${NEXT_PARAM}=${encodeURIComponent(quiz)}`);
    });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div role="status" className="flex w-full max-w-xl flex-col gap-4">
      <span className="sr-only">Preparando sua prova…</span>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
  );
}
