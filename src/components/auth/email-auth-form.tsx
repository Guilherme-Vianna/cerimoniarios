"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Mode = "signin" | "signup" | "reset";

const MIN_PASSWORD = 6;

const titles: Record<Mode, { submit: string; pending: string }> = {
  signin: { submit: "Entrar com e-mail", pending: "Entrando…" },
  signup: { submit: "Criar conta", pending: "Criando sua conta…" },
  reset: { submit: "Enviar link", pending: "Enviando…" },
};

type EmailAuthFormProps = {
  disabled: boolean;
  /** Runs the Firebase sign-in and finishes the app session (moving guest data along). */
  onSignIn: (signIn: () => Promise<User>) => Promise<void>;
  onError: (error: unknown) => void;
};

export function EmailAuthForm({ disabled, onSignIn, onError }: EmailAuthFormProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function switchTo(next: Mode) {
    setMode(next);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setPending(true);
    const auth = getFirebaseAuth();
    const address = email.trim();
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, address);
        setNotice(`Se existir uma conta com ${address}, enviamos um link para criar uma nova senha. Confira também o spam.`);
        setMode("signin");
        return;
      }
      if (mode === "signup") {
        await onSignIn(async () => {
          const { user } = await createUserWithEmailAndPassword(auth, address, password);
          await updateProfile(user, { displayName: name.trim() });
          sendEmailVerification(user).catch(() => undefined);
          return user;
        });
        return;
      }
      await onSignIn(async () => (await signInWithEmailAndPassword(auth, address, password)).user);
    } catch (error) {
      onError(error);
    } finally {
      setPending(false);
    }
  }

  const busy = disabled || pending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {notice && <Alert tone="success">{notice}</Alert>}
      {mode === "reset" && (
        <p className="text-sm text-muted">Digite o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
      )}
      {mode === "signup" && (
        <TextField
          label="Seu nome"
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
      )}
      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete={mode === "signup" ? "email" : "username"}
        inputMode="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={busy}
      />
      {mode !== "reset" && (
        <TextField
          label="Senha"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
      )}
      {mode === "signup" && <p className="-mt-2 text-sm text-muted">Use pelo menos {MIN_PASSWORD} caracteres.</p>}

      <Button type="submit" loading={pending} loadingLabel={titles[mode].pending} disabled={disabled}>
        {titles[mode].submit}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        {mode === "signin" ? (
          <>
            <Button variant="link" onClick={() => switchTo("signup")} disabled={busy}>
              Criar conta com e-mail
            </Button>
            <Button variant="link" onClick={() => switchTo("reset")} disabled={busy}>
              Esqueci minha senha
            </Button>
          </>
        ) : (
          <Button variant="link" onClick={() => switchTo("signin")} disabled={busy}>
            Já tenho conta: entrar
          </Button>
        )}
      </div>
    </form>
  );
}
