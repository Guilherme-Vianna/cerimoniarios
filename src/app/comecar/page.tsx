import type { Metadata } from "next";
import { Logo } from "@/components/app/logo";
import { GuestStart } from "./guest-start";

export const metadata: Metadata = { title: "Prova", robots: { index: false } };

export default function GuestStartPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-6 sm:px-8">
      <header>
        <Logo />
      </header>
      <main className="flex justify-center">
        <GuestStart />
      </main>
    </div>
  );
}
