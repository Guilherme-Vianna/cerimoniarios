import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccount } from "@/components/account/delete-account";
import { Avatar } from "@/components/app/avatar";
import { loadAccount } from "@/lib/api/data";
import { PRIVACY_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const account = await loadAccount();
  const name = account.name || account.email || "Sua conta";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <h1 className="font-serif text-4xl font-bold tracking-tight">Minha conta</h1>

      <section className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5">
        <Avatar name={name} photoUrl={account.photo_url} size="size-14" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{name}</p>
          {account.email && <p className="truncate text-muted">{account.email}</p>}
          <p className="mt-1 text-sm text-muted">Conta Google · {account.stats.xp_total} XP no total</p>
        </div>
      </section>

      <section aria-labelledby="privacy-title" className="flex flex-col gap-2">
        <h2 id="privacy-title" className="text-xl font-semibold">
          Privacidade
        </h2>
        <p className="text-muted">
          Seu nome, sua foto e seu XP aparecem no ranking. Veja como cuidamos dos seus dados na{" "}
          <Link href={PRIVACY_PATH} className="font-medium text-primary underline-offset-4 hover:underline">
            política de privacidade
          </Link>
          .
        </p>
      </section>

      <section
        aria-labelledby="delete-title"
        className="flex flex-col items-start gap-3 rounded-3xl border border-danger/30 bg-danger-soft p-5"
      >
        <h2 id="delete-title" className="text-xl font-semibold text-danger">
          Excluir conta
        </h2>
        <p className="text-ink">
          Apaga para sempre seu cadastro, suas provas, seus flashcards e seu XP. Não dá para desfazer.
        </p>
        <DeleteAccount />
      </section>
    </div>
  );
}
