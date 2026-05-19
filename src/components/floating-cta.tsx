"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      // Si pas de hero (autres pages), afficher dès le scroll
      const onScroll = () => setShow(window.scrollY > 200);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#reserver"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-or-500 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/30 transition-colors hover:bg-or-400 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:rounded-full sm:px-6 sm:py-3.5"
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2"
          >
            <Calendar size={18} />
            Réserver
          </motion.span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
