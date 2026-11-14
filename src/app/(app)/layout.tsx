import { AppHeader } from "@/components/app/app-header";
import { SessionRefresher } from "@/components/auth/session-refresher";

export default function AuthenticatedLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <SessionRefresher />
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-28 sm:px-6 sm:pt-10 md:pb-10 lg:px-8">{children}</main>
    </div>
  );
}
