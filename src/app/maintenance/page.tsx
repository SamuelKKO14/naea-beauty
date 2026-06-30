import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site en cours de mise à jour — Naéa Beauty",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-cream px-6 text-center text-bordeaux-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Naéa Beauty" className="h-20 w-auto" />
      <p className="max-w-md text-lg font-light tracking-wide">
        Site en cours de mise à jour — de retour très bientôt.
      </p>
    </main>
  );
}
