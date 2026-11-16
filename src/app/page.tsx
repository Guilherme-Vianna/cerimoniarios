import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Alert } from "@/components/ui/alert";
import { ACCOUNT_DELETED_PARAM, PRIVACY_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Entrar",
};

const steps = [
  {
    title: "Faça a prova",
    text: "Perguntas sobre a Missa criadas por IA, do básico ao avançado.",
  },
  {
    title: "Revise o que errou",
    text: "Cada erro vira um flashcard com explicação. A revisão espaçada traz o card de volta na hora certa.",
  },
  {
    title: "Suba no ranking",
    text: "Acertos e revisões valem XP. Veja sua posição na semana entre os cerimoniários.",
  },
];

export default async function LoginPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const deleted = params[ACCOUNT_DELETED_PARAM] === "excluida";
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8">
      <header>
        <Logo />
      </header>

      <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-20">
        <section aria-labelledby="login-title" className="w-full max-w-md animate-fade-up">
          <h1 id="login-title" className="font-serif text-5xl font-bold tracking-tight text-ink">
            Sirva o altar com segurança
          </h1>
          <p className="mt-4 text-lg text-muted">
            Estude a liturgia da Missa no seu ritmo: provas, flashcards e um ranking entre cerimoniários.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            {deleted && <Alert tone="success">Sua conta foi excluída. Obrigado por ter estudado com a gente.</Alert>}
            <AuthPanel expired={params.sessao === "expirada"} />
          </div>
        </section>

        <ol className="grid gap-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              style={{ animationDelay: `${150 + index * 100}ms` }}
              className="flex animate-fade-up gap-4 rounded-3xl border border-border bg-surface p-6"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft font-semibold text-gold"
              >
                {index + 1}
              </span>
              <div>
                <h2 className="font-semibold text-ink">{step.title}</h2>
                <p className="mt-1 text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </main>

      <footer className="border-t border-border pt-6 text-sm text-muted">
        <Link href={PRIVACY_PATH} className="font-medium hover:text-ink hover:underline">
          Política de privacidade
        </Link>
      </footer>
    </div>
  );
}
