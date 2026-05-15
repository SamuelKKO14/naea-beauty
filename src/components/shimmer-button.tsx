"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* ── Bouton principal "Réserver" avec shimmer doré ─────── */
export function ShimmerButton({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const Comp = href ? motion.a : motion.button;
  return (
    <Comp
      href={href}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-or-500 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-shadow hover:shadow-xl hover:shadow-or-500/40 ${className}`}
    >
      {/* Shimmer sweep */}
      <span className="pointer-events-none absolute inset-0 animate-shimmer-gold bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {/* Glow on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-or-300/0 transition-colors group-hover:bg-or-300/20" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Comp>
  );
}

/* ── Bouton secondaire avec bordure gradient animée ────── */
export function BorderAnimateButton({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[2px] transition-transform hover:scale-[1.04] active:scale-[0.97] ${className}`}
    >
      {/* Rotating gradient border */}
      <span className="absolute inset-0 animate-border-rotate rounded-full bg-[conic-gradient(from_0deg,_#C9A84C,_#7A1F3D,_#D4AF37,_#5C1A2A,_#FFF8F0,_#C9A84C)]" />
      {/* Inner background */}
      <span className="relative flex items-center justify-center gap-2 rounded-full bg-cream px-8 py-4 text-xs font-semibold uppercase tracking-wider text-bordeaux-900 backdrop-blur-sm transition-colors group-hover:bg-cream/90">
        {children}
      </span>
    </a>
  );
}
