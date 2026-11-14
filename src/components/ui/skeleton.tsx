import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-border/70 ${className}`} />;
}

export function SkeletonPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col gap-6 ${className}`}>
      <span className="sr-only">Carregando…</span>
      {children}
    </div>
  );
}

export function SkeletonCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-surface p-6 ${className}`}>{children}</div>;
}
