"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("naea_welcome")
    ) {
      sessionStorage.removeItem("naea_welcome");
      setShowWelcome(true);

      supabase.auth.getUser().then(({ data: { user } }) => {
        const name =
          user?.user_metadata?.prenom ||
          user?.user_metadata?.full_name ||
          "";
        if (name) setUserName(name);
      });

      setTimeout(() => setShowWelcome(false), 2800);
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  // Login page: render without admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bordeaux-950 via-bordeaux-900 to-bordeaux-950">
      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bordeaux-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="font-display text-3xl text-or-300 md:text-5xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {userName
                ? `Bienvenue, ${userName}`
                : "Bienvenue chez Naéa Beauty"}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Glass header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-bordeaux-950/90 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Naéa Beauty"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
              <h1 className="text-sm font-semibold text-white/80">
                Naéa Beauty{" "}
                <span className="font-normal text-white/40">— Admin</span>
              </h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
