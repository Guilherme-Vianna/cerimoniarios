"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { HELP_PATH } from "@/lib/auth/constants";
import { Avatar } from "./avatar";

export function AccountMenu({ name, email, photoUrl }: { name: string; email: string | null; photoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Conta de ${name}`}
        onClick={() => setOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-2 rounded-full p-0.5 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Avatar name={name} photoUrl={photoUrl} size="size-8" />
        <span className="hidden max-w-36 truncate text-sm font-medium xl:inline">{name}</span>
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-30 mt-2 w-64 animate-fade-up rounded-2xl border border-border bg-surface p-2 shadow-lg shadow-ink/10"
        >
          <div className="px-3 py-2">
            <p className="truncate font-medium">{name}</p>
            {email && <p className="truncate text-sm text-muted">{email}</p>}
          </div>
          <div className="mt-1 border-t border-border pt-1">
            <Link
              href={HELP_PATH}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
            >
              Como funciona
            </Link>
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
