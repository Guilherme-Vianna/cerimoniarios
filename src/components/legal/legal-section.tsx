import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/legal";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function ContactLink() {
  if (!CONTACT_EMAIL) return <>pelo e-mail do desenvolvedor que aparece na página do Cerimoniários na Google Play</>;
  return (
    <>
      pelo e-mail <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </>
  );
}
