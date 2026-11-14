export function ReferenceLink({ reference, url }: { reference: string | null; url: string | null }) {
  if (!reference) return null;
  const label = `Fonte: ${reference}`;
  if (!url) return <p className="text-xs font-medium text-muted">{label}</p>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted underline-offset-4 hover:text-primary hover:underline"
    >
      {label}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
