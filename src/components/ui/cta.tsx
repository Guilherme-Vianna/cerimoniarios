/** Classes for the gold call-to-action used on the ad funnel: bigger, glowing and with a passing shine. */
export const CTA_CLASSES =
  "relative isolate h-14 overflow-hidden rounded-full bg-linear-to-r from-gold via-[#d4a23f] to-gold px-7 text-lg font-semibold text-white shadow-lg animate-cta-glow hover:brightness-110 disabled:animate-none disabled:opacity-70";

export function CtaShine() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full">
      <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-linear-to-r from-transparent via-white/45 to-transparent" />
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
