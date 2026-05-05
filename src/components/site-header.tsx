"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#hero", label: "Accueil" },
  { href: "#prestations", label: "Prestations" },
  { href: "#galerie", label: "Galerie" },
  { href: "#reserver", label: "Réserver" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleNavClick() {
    setOpen(false);
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-bordeaux-100/40 bg-cream/95 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="#hero" className="flex items-center gap-3" onClick={handleNavClick}>
          <Image
            src="/logo.png"
            alt="Naéa Beauty"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-or-500/30"
            priority
          />
          <span
            className={`font-display text-xl tracking-wide transition-colors ${
              scrolled ? "text-bordeaux-800" : "text-or-100"
            }`}
          >
            Naéa Beauty
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-bordeaux-900/80 hover:text-bordeaux-700"
                  : "text-or-100/80 hover:text-or-100"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#reserver"
            className="rounded-full bg-bordeaux-800 px-5 py-2.5 text-sm font-medium text-or-100 transition-all hover:bg-bordeaux-900 hover:shadow-lg hover:shadow-bordeaux-800/20"
          >
            Réserver
          </a>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className={`rounded-full p-2 lg:hidden ${
            scrolled ? "text-bordeaux-900" : "text-or-100"
          }`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-bordeaux-100/40 bg-cream lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-bordeaux-900 hover:bg-bordeaux-50"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#reserver"
              onClick={handleNavClick}
              className="mt-2 rounded-full bg-bordeaux-800 px-5 py-3 text-center text-base font-medium text-or-100"
            >
              Réserver
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
