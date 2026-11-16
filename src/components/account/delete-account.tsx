"use client";

import {
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteAccount } from "@/lib/actions";
import { ACCOUNT_DELETED_PARAM, LOGIN_PATH } from "@/lib/auth/constants";
import { destroyServerSession } from "@/lib/auth/client-session";
import { authErrorMessage } from "@/lib/auth/errors";
import { createGoogleProvider, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { isNativeApp, nativeGoogleIdToken, nativeSignOut } from "@/lib/native-app";

const LOCAL_DATA_PREFIX = "cerimoniarios:";

async function reauthenticate(user: User) {
  if (isNativeApp()) {
    await reauthenticateWithCredential(user, GoogleAuthProvider.credential(await nativeGoogleIdToken()));
  } else {
    await reauthenticateWithPopup(user, createGoogleProvider());
  }
}

function clearLocalData() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(LOCAL_DATA_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable (private mode); there is nothing to clear then.
  }
}

async function confirmDeletion(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isFirebaseConfigured()) return { ok: false, error: "O login não está configurado neste ambiente." };
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return { ok: false, error: "Sua sessão expirou. Saia, entre de novo e tente outra vez." };

  try {
    await reauthenticate(user);
  } catch (error) {
    return { ok: false, error: authErrorMessage(error) ?? "Exclusão cancelada. Sua conta continua ativa." };
  }

  const result = await deleteAccount();
  if (!result.ok) return result;

  // The data is already gone; removing the Firebase login record is best effort.
  await deleteUser(user).catch(() => signOut(auth).catch(() => undefined));
  await nativeSignOut();
  await destroyServerSession().catch(() => undefined);
  clearLocalData();
  // A full reload drops every client cache of the deleted account and wins over SessionRefresher's redirect.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${LOGIN_PATH}?${ACCOUNT_DELETED_PARAM}=excluida`);
  return { ok: true };
}

export function DeleteAccount() {
  return (
    <ConfirmDialog
      title="Excluir sua conta?"
      description={
        <>
          Isso apaga para sempre suas provas, flashcards e XP, e tira você do ranking. Não dá para desfazer. Para
          confirmar, escolha sua conta Google na próxima tela.
        </>
      }
      confirmLabel="Excluir minha conta"
      pendingLabel="Excluindo…"
      onConfirm={confirmDeletion}
      trigger={(open) => (
        <Button variant="danger" block={false} onClick={open}>
          Excluir minha conta
        </Button>
      )}
    />
  );
}
