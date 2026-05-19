"use client";

import { motion } from "framer-motion";

const BADGES = [
  { emoji: "⭐", label: "5/5 sur Google" },
  { emoji: "✨", label: "Soins minutieux" },
  { emoji: "📍", label: "Nantes" },
  { emoji: "🏠", label: "À domicile ou chez moi" },
];

export function TrustBadges() {
  return (
    <motion.ul
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.15, duration: 0.6 }}
      className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3"
      aria-label="Points clés"
    >
      {BADGES.map((b) => (
        <li
          key={b.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-or-100 backdrop-blur-md"
        >
          <span aria-hidden>{b.emoji}</span>
          <span>{b.label}</span>
        </li>
      ))}
    </motion.ul>
  );
}
