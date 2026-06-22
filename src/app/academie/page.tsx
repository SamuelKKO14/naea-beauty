import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Lock, type LucideIcon, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createAdminClient } from "@/lib/supabase-admin";
import { formatEuros } from "@/lib/format";

// Lecture service-role, sans cache : on affiche aussi les formations en
// brouillon (vitrine pilotée depuis Supabase).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Naéa Académie · Nos formations",
  description:
    "Les formations en ligne Naéa : des prestations esthétiques rentables, maîtrisées de A à Z, à votre rythme et en toute conformité.",
};

type FormationCard = {
  slug: string;
  titre: string;
  sous_titre: string | null;
  prix_cents: number;
  prix_lancement_cents: number | null;
};

/** Icône d'illustration par formation (cohérence avec les pages de vente). */
function iconForSlug(slug: string): LucideIcon {
  if (slug.includes("cils")) return Eye;
  return Sparkles;
}

async function getFormations(): Promise<FormationCard[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("formations")
    .select("slug, titre, sous_titre, prix_cents, prix_lancement_cents, statut")
    .neq("statut", "archive")
    .order("created_at", { ascending: true });
  return (data ?? []) as FormationCard[];
}

export default async function AcademieBoutiquePage() {
  const formations = await getFormations();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        {/* HERO ---------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-bordeaux-950 text-white">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-or-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center lg:px-10 lg:py-24">
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-or-300/30 bg-bordeaux-950/50 px-5 py-2 text-xs uppercase tracking-[0.22em] text-or-300 backdrop-blur-sm">
              <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-or-300/20 to-transparent" />
              <Sparkles size={14} /> Naéa Académie
            </span>
            <h1 className="mt-8 font-display text-3xl leading-tight text-white md:text-5xl">
              Nos formations en ligne
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Apprenez des prestations esthétiques recherchées et rentables —
              maîtrisées de A à Z, à votre rythme, et en toute conformité.
            </p>
          </div>
        </section>

        {/* GRILLE FORMATIONS -------------------------------------------- */}
        <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 md:py-20">
          {formations.length === 0 ? (
            <p className="text-center text-sm text-bordeaux-900/60">
              Aucune formation disponible pour le moment.
            </p>
          ) : (
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
              {formations.map((f) => {
                const Icon = iconForSlug(f.slug);
                const hasPromo =
                  f.prix_lancement_cents != null &&
                  f.prix_lancement_cents < f.prix_cents;
                const prixAffiche = hasPromo
                  ? f.prix_lancement_cents!
                  : f.prix_cents;
                return (
                  <Link
                    key={f.slug}
                    href={`/academie/${f.slug}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-or-300/30 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-or-400/20"
                  >
                    {/* Visuel */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-bordeaux-950 to-bordeaux-900">
                      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-or-500/20 blur-2xl" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-or-100/15 text-or-300 ring-1 ring-or-300/30">
                          <Icon size={26} />
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-or-300/80">
                          Formation en ligne
                        </span>
                      </div>
                    </div>

                    {/* Corps */}
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-display text-xl leading-snug text-bordeaux-900">
                        {f.titre}
                      </h2>
                      {f.sous_titre ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-bordeaux-900/70">
                          {f.sous_titre}
                        </p>
                      ) : null}

                      <div className="mt-5 flex items-end gap-2">
                        {hasPromo ? (
                          <span className="font-display text-lg text-bordeaux-900/35 line-through">
                            {formatEuros(f.prix_cents)}
                          </span>
                        ) : null}
                        <span className="font-display text-3xl text-bordeaux-900">
                          {formatEuros(prixAffiche)}
                        </span>
                      </div>
                      {hasPromo ? (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-or-700">
                          Offre de lancement
                        </p>
                      ) : null}

                      <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-bordeaux-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-or-100 transition-colors group-hover:bg-bordeaux-900">
                        Découvrir
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <p className="mt-10 inline-flex w-full items-center justify-center gap-2 text-xs text-bordeaux-900/55">
            <Lock size={13} className="text-or-700" /> Paiement sécurisé · Accès à
            vie · Mises à jour incluses
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
