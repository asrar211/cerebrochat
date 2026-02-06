import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-semibold text-emerald-950"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-950 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
          className
        )}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-xs text-emerald-700/70">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
