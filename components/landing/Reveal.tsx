"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal-on-scroll untuk seksi marketing. Satu IntersectionObserver per blok,
 * dimatikan setelah terlihat. Hanya transform + opacity + blur; `prefers-reduced-motion`
 * sudah dinetralkan global di globals.css.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[transform,opacity,filter] duration-700 ease-out will-change-transform",
        shown ? "translate-y-0 opacity-100 blur-none" : "translate-y-6 opacity-0 blur-[6px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
