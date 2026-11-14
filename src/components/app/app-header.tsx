import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { loadAccount } from "@/lib/api/data";
import { CARDS_PATH, HELP_PATH, HOME_PATH, QUIZ_PATH, RANKING_PATH, REVIEW_PATH } from "@/lib/auth/constants";
import { Avatar } from "./avatar";
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
              className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
            >
              <NavIcon name="help" className="size-[22px]" />
            </Link>
            {account && (
              <span className="flex items-center gap-2 pl-1" title={account.email ?? undefined}>
                <Avatar name={name} photoUrl={account.photo_url} size="size-8" />
                <span className="hidden max-w-36 truncate text-sm font-medium xl:inline">{name}</span>
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <BottomNav items={items} />
    </>
  );
}
