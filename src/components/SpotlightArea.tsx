"use client";

import { useState, type MouseEvent, type ReactNode } from "react";

/**
 * Envolve conteúdo com a grelha de fundo da marca + um "spotlight" que
 * revela a grelha com mais intensidade à volta do cursor. Só liga a escuta
 * de movimento enquanto o rato está dentro da área (evita custo em páginas
 * onde nunca é usado).
 */
export function SpotlightArea({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {/* Grelha + realce a seguir o cursor: não fazem sentido em touch (sem
          hover) e só acrescentam peso visual num ecrã pequeno. */}
      <div className="hero-grid pointer-events-none absolute inset-0 hidden sm:block" />
      <div
        className="hero-grid-spot pointer-events-none absolute inset-0 hidden sm:block"
        style={{ opacity: active ? 1 : 0 }}
      />
      {children}
    </div>
  );
}
