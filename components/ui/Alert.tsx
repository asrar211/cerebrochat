import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "error" | "info";

const variantStyles: Record<AlertVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function Alert({
  className,
  variant = "error",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3 py-2 text-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
