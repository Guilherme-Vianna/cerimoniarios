import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-muted">
      <Spinner />
      <span>Carregando…</span>
    </div>
  );
}
