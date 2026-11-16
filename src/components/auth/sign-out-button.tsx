"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOGIN_PATH } from "@/lib/auth/constants";
import { destroyServerSession } from "@/lib/auth/client-session";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { nativeSignOut } from "@/lib/native-app";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    if (isFirebaseConfigured()) await signOut(getFirebaseAuth());
    await nativeSignOut();
    await destroyServerSession();
    router.replace(LOGIN_PATH);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm font-medium text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait"
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
