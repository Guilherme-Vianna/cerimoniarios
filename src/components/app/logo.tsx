export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
        <path d="M16 6v20M10 12h12" stroke="#f3d48f" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-2xl font-bold tracking-tight text-ink">Cerimoniários</span>
    </span>
  );
}
