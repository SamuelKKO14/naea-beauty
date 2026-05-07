"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("splash_shown")) return;
    setShow(true);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("splash_shown", "true");
      document.body.style.overflow = "";
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "#1A0A10" }}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Logo */}
            <motion.img
              src="/logo.png"
              alt="Naéa Beauty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ height: 80, width: "auto" }}
            />

            {/* Bienvenue chez */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="text-sm"
              style={{ color: "#C9A84C", fontFamily: "var(--font-inter), Arial, sans-serif" }}
            >
              Bienvenue chez
            </motion.p>

            {/* Naéa Beauty */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              className="font-display text-3xl font-bold"
              style={{ color: "#F5E6D0", letterSpacing: "0.5px" }}
            >
              Naéa Beauty
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
