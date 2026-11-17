"use client";

import { useRef } from "react";

/**
 * Wraps a card in a soft radial glow that follows the pointer. The position is
 * written straight to a CSS custom property, so moving the mouse never triggers
 * a React render.
 */
export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  return (
    <div
      ref={wrapRef}
      className={`spotlight ${className}`.trim()}
      onPointerMove={(e) => {
        const wrap = wrapRef.current;
        const glow = glowRef.current;
        if (!wrap || !glow || e.pointerType === "touch") return;
        const rect = wrap.getBoundingClientRect();
        glow.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        glow.style.setProperty("--my", `${e.clientY - rect.top}px`);
        glow.style.opacity = "1";
      }}
      onPointerLeave={() => {
        const glow = glowRef.current;
        if (glow) glow.style.opacity = "0";
      }}
    >
      <span ref={glowRef} aria-hidden="true" className="spotlight-glow" />
      {children}
    </div>
  );
}
