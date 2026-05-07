"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Users,
  Sparkles,
  MessageSquareQuote,
  Settings,
  Wallet,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Réservations", icon: CalendarCheck },
  { href: "/admin/disponibilites", label: "Disponibilités", icon: Clock },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/prestations", label: "Prestations", icon: Sparkles },
  { href: "/admin/temoignages", label: "Témoignages", icon: MessageSquareQuote },
  { href: "/admin/finance", label: "Finance", icon: Wallet },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-bordeaux-950/90 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Naéa Beauty"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-display text-lg text-or-300">Naéa Beauty</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded p-1 text-white/40 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-white/20 text-or-300 shadow-sm shadow-white/5"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Retour au site */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="block text-center text-xs text-white/40 hover:text-white/70"
          >
            ← Retour au site
          </Link>
        </div>
      </aside>
    </>
  );
}
