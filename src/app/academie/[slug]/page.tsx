import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  FormationSalesPage,
  type FormationData,
  type ModuleData,
} from "@/components/academie/formation-sales-page";
import { createAdminClient } from "@/lib/supabase-admin";

// Lecture par requête (service role) — on veut voir une formation en brouillon
// sans cache.
export const dynamic = "force-dynamic";

// Colonnes publiques uniquement. On ne lit JAMAIS lecons.contenu_url /
// contenu_texte (et on ne touche pas à la table lecons ici).
const FORMATION_COLS =
  "id, slug, titre, sous_titre, description, prix_cents, prix_lancement_cents, niveau, duree_minutes, statut";

async function getFormation(slug: string) {
  const supabase = createAdminClient();
  const { data: formation, error } = await supabase
    .from("formations")
    .select(FORMATION_COLS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !formation) return null;

  // On ne sélectionne PAS `description` : les pages n'affichent que les titres
  // de modules (on ne dévoile pas le contenu de la formation).
  const { data: modules } = await supabase
    .from("modules")
    .select("id, titre, ordre")
    .eq("formation_id", formation.id)
    .order("ordre", { ascending: true });

  return { formation, modules: (modules ?? []) as ModuleData[] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFormation(slug).catch(() => null);
  if (!data) return { title: "Formation introuvable · Naéa Académie" };
  return {
    title: `${data.formation.titre} · Naéa Académie`,
    description: data.formation.sous_titre ?? undefined,
  };
}

export default async function AcademieFormationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getFormation(slug);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <FormationSalesPage
          formation={data.formation as FormationData}
          modules={data.modules}
        />
      </main>
      <SiteFooter />
    </>
  );
}
