import { useEffect, useRef } from "react";

export function useAutoScroll(deps: unknown[]) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, deps);

  return ref;
}
