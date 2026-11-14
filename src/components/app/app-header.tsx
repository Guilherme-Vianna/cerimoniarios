import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { loadAccount } from "@/lib/api/data";
import { CARDS_PATH, HELP_PATH, HOME_PATH, QUIZ_PATH, RANKING_PATH, REVIEW_PATH } from "@/lib/auth/constants";
import { InstallButton } from "@/components/pwa/install-button";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { BottomNav, MainNav, type NavItem } from "./main-nav";
import { NavIcon } from "./nav-icon";

export async function AppHeader() {
  const account = await loadAccount().catch(() => null);
  const items: NavItem[] = [
    { href: QUIZ_PATH, label: "Prova", icon: "quiz" },
    { href: CARDS_PATH, label: "Flashcards", icon: "cards", badge: account?.stats.due_cards, also: [REVIEW_PATH] },
    { href: RANKING_PATH, label: "Ranking", icon: "ranking" },
  ];
  const name = account?.name || account?.email || "Sua conta";

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href={HOME_PATH}
            aria-label="Cerimoniários, ir para o início"
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Logo />
          </Link>
          <MainNav items={items} />
          <div className="flex items-center gap-1">
            <Link
              href={HELP_PATH}
              aria-label="Ajuda: como funciona"
              title="Como funciona"
              className="hidden size-10 items-center justify-center rounded-full text-muted sm:flex hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
            >
              <NavIcon name="help" className="size-[22px]" />
            </Link>
            {account ? (
              <AccountMenu name={name} email={account.email} photoUrl={account.photo_url} />
            ) : (
              <SignOutButton />
            )}
            <span className="pl-1">
              <InstallButton />
            </span>
          </div>
        </div>
      </header>
      <BottomNav items={items} />
    </>
  );
}
