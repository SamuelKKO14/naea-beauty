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
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "#1A0A10" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="font-display text-2xl sm:text-4xl md:text-5xl whitespace-nowrap text-center px-4"
            style={{ color: "#F5E6D0" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Bienvenue chez Naéa Beauty
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
