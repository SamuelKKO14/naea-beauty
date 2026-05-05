"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/prestations", label: "Prestations" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-bordeaux-100/40 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Naéa Beauty"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-or-500/30"
            priority
          />
          <span className="font-display text-xl tracking-wide text-bordeaux-800">
            Naéa Beauty
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-bordeaux-900/80 transition-colors hover:text-bordeaux-700"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-bordeaux-800 px-5 py-2.5 text-sm font-medium text-or-100 transition-all hover:bg-bordeaux-900 hover:shadow-lg hover:shadow-bordeaux-800/20"
          >
            Réserver
          </Link>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 text-bordeaux-900 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-bordeaux-100/40 bg-cream lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-bordeaux-900 hover:bg-bordeaux-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-bordeaux-800 px-5 py-3 text-center text-base font-medium text-or-100"
            >
              Réserver
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
