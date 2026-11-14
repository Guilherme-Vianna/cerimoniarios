import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-border bg-surface text-ink hover:border-border-strong hover:bg-canvas",
};

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return (
    <Link
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-medium transition-[color,background-color,border-color,transform] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
