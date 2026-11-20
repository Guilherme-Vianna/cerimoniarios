import Link from "next/link";
import type { ComponentProps } from "react";
import { CTA_CLASSES, CtaShine } from "./cta";

const variants = {
  primary: "h-12 bg-primary px-6 font-medium text-white hover:bg-primary-hover",
  cta: CTA_CLASSES,
  secondary: "h-12 px-6 font-medium border border-border bg-surface text-ink hover:border-border-strong hover:bg-canvas",
};

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return (
    <Link
      className={`group inline-flex items-center justify-center gap-2 rounded-full transition-[color,background-color,border-color,transform] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variants[variant]} ${className}`}
      {...props}
    >
      {variant === "cta" && <CtaShine />}
      {children}
    </Link>
  );
}
