import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-300",
  secondary:
    "bg-white text-emerald-800 border border-emerald-200 hover:border-emerald-300 focus-visible:ring-emerald-200",
  ghost:
    "bg-transparent text-emerald-800 hover:bg-emerald-50 focus-visible:ring-emerald-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function buttonClassName({
  variant,
  size,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  className?: string;
}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}
