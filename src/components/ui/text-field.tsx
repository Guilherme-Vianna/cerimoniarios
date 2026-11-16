import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function TextField({ label, className = "", ...props }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className="h-12 rounded-2xl border border-border bg-surface px-4 text-base text-ink placeholder:text-muted/70 hover:border-border-strong focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary/30 disabled:bg-canvas disabled:text-muted"
        {...props}
      />
    </div>
  );
}
