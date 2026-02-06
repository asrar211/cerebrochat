import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600",
        className
      )}
      aria-hidden
    />
  );
}
