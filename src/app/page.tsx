import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Alert } from "@/components/ui/alert";
import { ArrowIcon } from "@/components/ui/cta";
import { LinkButton } from "@/components/ui/link-button";
import { ACCOUNT_DELETED_PARAM, PRIVACY_PATH, QUIZ_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Entrar",
};

const START_LABEL = "Fazer a prova grátis agora";

const perks = ["100% grátis", "Sem cadastro", "Correção na hora"];

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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-28 sm:px-8 sm:pb-6">
      <header>
        <Logo />
      </header>

      <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-20">
        <section aria-labelledby="login-title" className="w-full max-w-md animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold text-gold">
            <span aria-hidden="true">⛪</span> Para coroinhas, acólitos e cerimoniários
          </p>
          <h1 id="login-title" className="mt-4 font-serif text-5xl font-bold tracking-tight text-ink">
            Você sabe mesmo servir no altar?
          </h1>
          <p className="mt-4 text-lg text-muted">
            Descubra em poucos minutos com uma prova sobre a liturgia da Missa. Cada erro vira um flashcard para você
            nunca mais esquecer.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {deleted && <Alert tone="success">Sua conta foi excluída. Obrigado por ter estudado com a gente.</Alert>}
            <LinkButton href={QUIZ_PATH} variant="cta" className="w-full">
              {START_LABEL}
              <ArrowIcon />
            </LinkButton>
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-ink">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5">
                  <CheckIcon />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            <p className="text-center text-sm font-medium text-muted">Já estuda com a gente? Entre para salvar seu XP</p>
            <AuthPanel expired={params.sessao === "expirada"} guestOption={false} />
          </div>
        </section>

        <div className="flex flex-col gap-4">
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
          <LinkButton href={QUIZ_PATH} variant="cta" className="hidden animate-fade-up [animation-delay:500ms] sm:flex">
            Começar minha prova
            <ArrowIcon />
          </LinkButton>
        </div>
      </main>

      <footer className="border-t border-border pt-6 text-sm text-muted">
        <Link href={PRIVACY_PATH} className="font-medium hover:text-ink hover:underline">
          Política de privacidade
        </Link>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <LinkButton href={QUIZ_PATH} variant="cta" className="w-full">
          {START_LABEL}
          <ArrowIcon />
        </LinkButton>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-success" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
