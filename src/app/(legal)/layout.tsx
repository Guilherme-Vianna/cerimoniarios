import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { LOGIN_PATH } from "@/lib/auth/constants";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-8">
      <header>
        <Link
          href={LOGIN_PATH}
          aria-label="Cerimoniários, ir para o início"
          className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-8 py-10">{children}</main>
    </div>
  );
}
