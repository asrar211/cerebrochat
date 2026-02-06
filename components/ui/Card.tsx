import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
