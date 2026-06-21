"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  Check,
  ClipboardList,
  Droplets,
  FlaskConical,
  Gift,
  Infinity as InfinityIcon,
  type LucideIcon,
  Lock,
  MessageCircle,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { formatEuros } from "@/lib/format";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { AnimatedSection } from "./animated-section";
import { BoutonCommande } from "./bouton-commande";

/** Icône lucide cohérente avec le thème d'un module (par mots-clés du titre). */
function iconForModule(titre: string): LucideIcon {
  const t = titre.toLowerCase();
  if (/technique|introduction|découv|présentation de la technique/.test(t)) return BookOpen;
  if (/hygiène|salubrité|désinfect|stéril/.test(t)) return Droplets;
  if (/réglementaire|obligation|légal|loi|norme/.test(t)) return Scale;
  if (/contre-indication|indication/.test(t)) return ShieldAlert;
  if (/précaution|sécurité/.test(t)) return ShieldCheck;
  if (/composition|kit|caractéristique/.test(t)) return FlaskConical;
  if (/matériel|équipement|outil/.test(t)) return Wrench;
  if (/préparation|préparer|protocole|étape/.test(t)) return ClipboardList;
  if (/accueil|accueillir|offre/.test(t)) return Users;
  if (/conseil|conseiller/.test(t)) return MessageCircle;
  if (/suivi|suivre|fidélis|après/.test(t)) return CalendarCheck;
  return Sparkles;
}

/** Données minimales lues côté serveur (jamais contenu_url / contenu_texte). */
export type FormationData = {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string | null;
  description: string | null;
  prix_cents: number;
  prix_lancement_cents: number | null;
  niveau: string | null;
  duree_minutes: number | null;
};

export type ModuleData = {
  id: string;
  titre: string;
  description: string | null;
  ordre: number;
};

const HEADING = "mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl";
const KICKER = "text-xs uppercase tracking-[0.22em] text-bordeaux-600";

export function FormationSalesPage({
  formation,
  modules,
}: {
  formation: FormationData;
  modules: ModuleData[];
}) {
  const hasPromo =
    formation.prix_lancement_cents != null &&
    formation.prix_lancement_cents < formation.prix_cents;
  const prixAffiche = hasPromo
    ? formation.prix_lancement_cents!
    : formation.prix_cents;
  const prixLabel = formatEuros(prixAffiche);

  return (
    <div className="bg-cream">
      {/* 1. HERO ------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-bordeaux-950 text-white">
        {/* lueur or discrète */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-or-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-or-300/30 bg-bordeaux-950/50 px-5 py-2 text-xs uppercase tracking-[0.22em] text-or-300 backdrop-blur-sm"
          >
            <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-or-300/20 to-transparent" />
            <Sparkles size={14} /> Naéa Académie · Formation en ligne
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-8 font-display text-3xl leading-tight text-white md:text-5xl"
          >
            {formation.titre}
          </motion.h1>

          {formation.sous_titre ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80"
            >
              {formation.sous_titre}
            </motion.p>
          ) : null}

          {/* Prix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10"
          >
            <div className="flex items-end justify-center gap-3">
              {hasPromo ? (
                <span className="font-display text-2xl text-white/45 line-through">
                  {formatEuros(formation.prix_cents)}
                </span>
              ) : null}
              <span className="font-display text-5xl text-or-300">
                {prixLabel}
              </span>
            </div>
            {hasPromo ? (
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-or-300/80">
                Offre de lancement
              </p>
            ) : null}

            <div className="mt-8 flex justify-center">
              <BoutonCommande
                formationSlug={formation.slug}
                prixLabel={prixLabel}
              />
            </div>
            <p className="mt-5 inline-flex items-center justify-center gap-2 text-xs text-white/65">
              <Lock size={14} className="text-or-300" /> Paiement sécurisé ·
              Accès à vie
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. POUR QUI / RÉSULTATS ------------------------------------------- */}
      <AnimatedSection
        id="pour-qui"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-10 md:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className={KICKER}>Pour qui</span>
          <h2 className={HEADING}>Une prestation rentable, faite dans les règles</h2>
          <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
            Pensée pour les <strong>esthéticiennes</strong> et les{" "}
            <strong>auto-entrepreneurs</strong> de la beauté qui veulent ajouter
            une prestation recherchée et rentable à leur carte — réalisée dans le
            respect du cadre réglementaire (produits cosmétiques conformes).
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {[
            {
              icon: Sparkles,
              titre: "Une nouvelle prestation",
              texte:
                "Maîtrisez le blanchiment cosmétique de A à Z et proposez-le en toute confiance.",
            },
            {
              icon: Star,
              titre: "Rentable",
              texte:
                "Un protocole rapide, un panier moyen élevé : une prestation qui se rentabilise vite.",
            },
            {
              icon: ShieldCheck,
              titre: "Dans le cadre légal",
              texte:
                "Comprenez la réglementation et travaillez sereinement, en conformité.",
            },
          ].map((c) => (
            <article
              key={c.titre}
              className="rounded-2xl border border-or-300/30 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm"
            >
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-or-100 text-bordeaux-900">
                <c.icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-lg text-bordeaux-900">
                {c.titre}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bordeaux-900/70">
                {c.texte}
              </p>
            </article>
          ))}
        </div>
      </AnimatedSection>

      {/* 3. APERÇU / PROGRAMME (verrouillé) -------------------------------- */}
      <AnimatedSection
        id="programme"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-10 md:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className={KICKER}>Le programme</span>
          <h2 className={HEADING}>
            {modules.length} modules pour tout maîtriser
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
            Voici l&apos;intégralité du parcours. Le contenu se débloque après
            votre commande.
          </p>
        </div>

        {/* MOBILE — liste verticale (inchangée). */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 md:hidden">
          {modules.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
              className="flex items-start gap-4 rounded-2xl border border-or-300/30 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bordeaux-950/5 font-display text-sm text-bordeaux-900">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base leading-snug text-bordeaux-900 md:text-lg">
                    {m.titre}
                  </h3>
                  <Lock
                    size={15}
                    className="shrink-0 text-bordeaux-600/50"
                    aria-label="Contenu verrouillé"
                  />
                </div>
                {m.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-bordeaux-900/70">
                    {m.description}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        {/* DESKTOP (md+) — grille de cartes ~carrées, 2 puis 3 par ligne. */}
        <div className="mt-10 hidden grid-cols-2 gap-4 md:grid lg:grid-cols-3 md:gap-6">
          {modules.map((m, i) => {
            const Icon = iconForModule(m.titre);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                className="flex h-full flex-col rounded-2xl border border-or-300/30 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-or-400/15"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-or-100 text-bordeaux-900">
                    <Icon size={20} />
                  </span>
                  <Lock
                    size={15}
                    className="text-bordeaux-600/50"
                    aria-label="Contenu verrouillé"
                  />
                </div>
                <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-bordeaux-600">
                  Module {i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg leading-snug text-bordeaux-900">
                  {m.titre}
                </h3>
                {m.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-bordeaux-900/70">
                    {m.description}
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* 4. CE QUI EST INCLUS ---------------------------------------------- */}
      <AnimatedSection
        id="inclus"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-10 md:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className={KICKER}>Ce qui est inclus</span>
          <h2 className={HEADING}>Tout pour vous lancer</h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: Check,
              titre: "La formation complète",
              texte: `Les ${modules.length} modules en e-learning, à votre rythme.`,
            },
            {
              icon: ShieldCheck,
              titre: "Le cadre légal",
              texte: "La réglementation expliquée clairement pour travailler en règle.",
            },
            {
              icon: Gift,
              titre: "Modèle de consentement éclairé",
              texte: "Un document prêt à l'emploi offert en bonus.",
            },
            {
              icon: InfinityIcon,
              titre: "Accès à vie",
              texte: "Revenez sur la formation et ses mises à jour quand vous voulez.",
            },
          ].map((c) => (
            <div
              key={c.titre}
              className="flex items-start gap-4 rounded-2xl border border-or-300/30 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-or-100 text-bordeaux-900">
                <c.icon size={18} />
              </span>
              <div>
                <h3 className="font-display text-base text-bordeaux-900">
                  {c.titre}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-bordeaux-900/70">
                  {c.texte}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* 5. L'EXPERTE (placeholder) --------------------------------------- */}
      <AnimatedSection
        id="experte"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-10 md:py-20"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Emplacement photo (à fournir) */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl border border-or-300/40 bg-gradient-to-br from-bordeaux-950 to-bordeaux-900">
            <div className="absolute inset-0 grid place-items-center text-center">
              <span className="px-6 text-xs uppercase tracking-[0.22em] text-or-300/70">
                Photo de l&apos;experte
                <br />à venir
              </span>
            </div>
          </div>
          <div>
            <span className={KICKER}>L&apos;experte</span>
            <h2 className={HEADING}>La personne derrière la formation</h2>
            <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
              {/* PLACEHOLDER — contenu réel à fournir par la cliente. */}
              [Présentation de l&apos;experte à compléter : parcours, expérience
              en institut, nombre de prestations réalisées, pourquoi elle a créé
              cette formation.] Naéa partage ici un savoir-faire concret, testé en
              cabine, pour vous transmettre une prestation maîtrisée.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-bordeaux-600">
              Naéa Beauty · Nantes
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* 6. AVIS — vrais avis clientes (prestations en cabine), cadrage honnête */}
      <AnimatedSection
        id="avis"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-10 md:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className={KICKER}>Ses clientes en parlent</span>
          <h2 className={HEADING}>Ce que disent ses clientes</h2>
          <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
            Ce sont les retours de ses <strong>clientes en institut</strong>, sur
            ses prestations — pas des élèves de la formation. La meilleure preuve
            qu&apos;elle maîtrise au quotidien la technique qu&apos;elle vous
            transmet.
          </p>
        </div>

        <div className="mt-8">
          <TestimonialsCarousel />
        </div>
      </AnimatedSection>

      {/* 7. FAQ ------------------------------------------------------------ */}
      <FaqAcademie />

      {/* 8. CTA FINAL ------------------------------------------------------ */}
      <AnimatedSection
        id="commander"
        className="px-6 pb-20 pt-4 lg:px-10"
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-bordeaux-950 px-6 py-12 text-center text-white">
          <h2 className="font-display text-2xl text-white md:text-3xl">
            Prête à vous lancer ?
          </h2>
          <div className="mt-6 flex items-end justify-center gap-3">
            {hasPromo ? (
              <span className="font-display text-xl text-white/45 line-through">
                {formatEuros(formation.prix_cents)}
              </span>
            ) : null}
            <span className="font-display text-4xl text-or-300">
              {prixLabel}
            </span>
          </div>
          <div className="mt-8 flex justify-center">
            <BoutonCommande
              formationSlug={formation.slug}
              prixLabel={prixLabel}
            />
          </div>
          <p className="mt-5 inline-flex items-center justify-center gap-2 text-xs text-white/65">
            <Lock size={14} className="text-or-300" /> Paiement sécurisé · Accès
            à vie
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}

/* FAQ — même rendu/animation que le composant FAQ du site, avec les questions
   de la formation. */
const FAQ_ITEMS = [
  {
    q: "Quand ai-je accès à la formation ?",
    a: "Dès la validation de votre paiement, l'accès est immédiat : vous recevez vos identifiants et pouvez commencer tout de suite.",
  },
  {
    q: "Quel est le format ?",
    a: "Une formation 100 % en ligne (e-learning), à suivre à votre rythme depuis votre téléphone ou ordinateur, avec un accès à vie et les mises à jour incluses.",
  },
  {
    q: "Est-ce légal ? Quel est le cadre réglementaire ?",
    a: "La formation couvre précisément le cadre réglementaire du blanchiment dentaire cosmétique et vous apprend à réaliser la prestation avec des produits conformes, en toute conformité.",
  },
  {
    q: "Puis-je me rétracter ?",
    a: "Il s'agit d'un produit numérique à accès immédiat : en démarrant la formation, vous demandez son exécution immédiate et renoncez au droit de rétractation de 14 jours, conformément à la réglementation.",
  },
];

function FaqAcademie() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative z-10 py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="text-center">
          <span className={KICKER}>Questions fréquentes</span>
          <h2 className={HEADING}>Avant de commander</h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-bordeaux-100/70 bg-white/80 shadow-sm">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={i > 0 ? "border-t border-bordeaux-100/70" : ""}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-academie-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-or-50/40 md:px-6"
                >
                  <span className="font-medium text-bordeaux-900 md:text-lg">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-or-100 text-bordeaux-900"
                    aria-hidden
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`faq-academie-${i}`}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-bordeaux-900/70 md:px-6 md:pb-6">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
