"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SERVICES, CATEGORIES } from "@/lib/services";
import { ReservationForm } from "@/components/contact-form";
import { Mail } from "lucide-react";
import { InstagramIcon, TikTokIcon } from "@/components/social-icons";

/* ─── PHOTOS GALERIE (cils-01 → cils-28) ──────────── */
const PHOTOS = Array.from({ length: 28 }, (_, i) => ({
  src: `/gallery/cils-${String(i + 1).padStart(2, "0")}.png`,
  alt: `Naéa Beauty — prestation cils #${i + 1}`,
}));

/* ─── SECTION ANIMÉE WRAPPER ───────────────────────── */
function AnimatedSection({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── SHIMMER BADGE ────────────────────────────────── */
function ShimmerBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-or-300/30 bg-bordeaux-950/50 px-5 py-2 text-xs uppercase tracking-[0.2em] text-or-300 backdrop-blur-sm"
    >
      {/* Shimmer effect */}
      <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-or-300/20 to-transparent" />
      <Sparkles size={14} /> Beauté sur-mesure · Nantes
    </motion.span>
  );
}

/* ─── GOLD LINE SVG ────────────────────────────────── */
function GoldLine() {
  return (
    <motion.svg
      width="120"
      height="2"
      viewBox="0 0 120 2"
      className="mx-auto mt-6"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: 1.2, duration: 1, ease: "easeInOut" }}
    >
      <motion.line
        x1="0"
        y1="1"
        x2="120"
        y2="1"
        stroke="currentColor"
        strokeWidth="2"
        className="text-or-400"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.2, duration: 1, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/* ─── SCROLL INDICATOR (dots latéraux) ─────────────── */
const SECTIONS = [
  { id: "hero", label: "Accueil" },
  { id: "prestations", label: "Prestations" },
  { id: "galerie", label: "Galerie" },
  { id: "apropos", label: "À propos" },
  { id: "reserver", label: "Réserver" },
];

function ScrollIndicator() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      {SECTIONS.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          title={label}
          className="group flex items-center gap-2"
        >
          <span className="text-xs font-medium text-bordeaux-800/0 transition-all group-hover:text-bordeaux-800/80">
            {label}
          </span>
          <span
            className={`block h-2.5 w-2.5 rounded-full border-2 transition-all ${
              active === id
                ? "scale-125 border-or-500 bg-or-500"
                : "border-bordeaux-300 bg-transparent group-hover:border-or-400"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}

/* ─── HERO ─────────────────────────────────────────── */
function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax image (slow vertical movement)
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  // Zoom-out + fade on scroll
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Custom cursor on image hover
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }

  return (
    <motion.section
      id="hero"
      ref={heroRef}
      style={{ scale: heroScale, opacity: heroOpacity }}
      className="relative isolate min-h-[100svh] overflow-hidden bg-bordeaux-950"
    >
      {/* Image — 60% à droite avec parallax */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr]">
        {/* Espace gauche = vide (le texte est positionné par-dessus) */}
        <div className="hidden lg:block" />

        {/* Image droite bord à bord */}
        <div
          ref={imageContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setCursorVisible(true)}
          onMouseLeave={() => setCursorVisible(false)}
          className="relative overflow-hidden lg:cursor-none"
        >
          <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
            <Image
              src="/hero.png"
              alt="Naéa Beauty — prestations beauté à Nantes"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </motion.div>

          {/* Overlay gradient sur l'image */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-bordeaux-950 via-bordeaux-950/60 to-transparent lg:via-bordeaux-950/40"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-bordeaux-950/60 to-transparent lg:hidden"
          />

          {/* Custom cursor doré */}
          {cursorVisible && (
            <motion.div
              className="pointer-events-none absolute z-30 hidden h-5 w-5 rounded-full bg-or-400/80 shadow-lg shadow-or-500/40 mix-blend-screen lg:block"
              animate={{ x: cursorPos.x - 10, y: cursorPos.y - 10 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </div>
      </div>

      {/* Reflet doré */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 70%, rgba(201,169,97,0.35), transparent 55%)",
        }}
      />

      {/* Contenu texte à gauche */}
      <div className="relative z-10 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-xl lg:max-w-lg">
            {/* Badge shimmer */}
            <ShimmerBadge />

            {/* Ligne dorée SVG */}
            <GoldLine />

            {/* Titre */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-8 font-display text-5xl leading-[1.05] text-or-100 md:text-6xl lg:text-7xl xl:text-8xl"
            >
              Sublimez
              <br />
              votre regard,
              <br />
              <span className="italic text-or-300">éveillez votre éclat.</span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 max-w-md text-lg leading-relaxed text-or-100/80"
            >
              Réhaussement de cils, browlift et blanchiment dentaire.
              Une expérience douce, soignée et entièrement dédiée à vous.
            </motion.p>

            {/* CTA empilés */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-10 flex flex-col gap-3 sm:flex-row"
            >
              <motion.a
                href="#reserver"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-or-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-shadow hover:shadow-xl hover:shadow-or-500/40"
              >
                {/* Glow hover */}
                <span className="pointer-events-none absolute inset-0 rounded-full bg-or-300/0 transition-colors group-hover:bg-or-300/30" />
                <Calendar
                  size={18}
                  className="transition-transform group-hover:rotate-12"
                />
                Réserver
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </motion.a>
              <a
                href="#prestations"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-or-300/40 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-or-100 backdrop-blur-sm transition-all hover:border-or-300 hover:bg-or-100/5"
              >
                Voir les prestations
              </a>
            </motion.div>

            {/* Tagline basse */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mt-14 flex flex-wrap items-center gap-5 text-sm text-or-100/60"
            >
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-or-400" /> Sur Nantes
              </span>
              <span className="hidden h-3 w-px bg-or-100/20 sm:block" />
              <span className="flex items-center gap-2">
                <Heart size={15} className="text-or-400" /> A domicile ou chez moi
              </span>
              <span className="hidden h-3 w-px bg-or-100/20 sm:block" />
              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-or-400" /> 1h de prestation
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE PRINCIPALE (SINGLE PAGE)
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <ScrollIndicator />

      {/* ── HERO ── */}
      <HeroSection />

      {/* ── PRESTATIONS ── */}
      <AnimatedSection id="prestations" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Carte des soins
          </span>
          <h2 className="mt-3 font-display text-4xl text-bordeaux-900 md:text-5xl">
            Prestations & tarifs
          </h2>
          <p className="mt-5 text-base leading-relaxed text-bordeaux-900/70">
            Toutes les prestations durent environ 1 heure. Paiement en espèces,
            par virement ou PayPal.
          </p>
        </div>

        {CATEGORIES.map((cat, idx) => {
          const items = SERVICES.filter((s) => s.category === cat.name);
          return (
            <div key={cat.name} className={idx > 0 ? "mt-20" : "mt-16"}>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.22em] text-or-700">
                    {cat.tagline}
                  </span>
                  <h3 className="mt-2 font-display text-4xl text-bordeaux-900 md:text-5xl">
                    {cat.name}
                  </h3>
                </div>
                <span className="hidden h-px flex-1 bg-bordeaux-100 md:block" />
              </div>

              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                {items.map((s) => (
                  <article
                    key={s.id}
                    className="group overflow-hidden rounded-2xl border border-bordeaux-100/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-bordeaux-200/30"
                  >
                    {s.image && (
                      <div className="aspect-[4/5] overflow-hidden">
                        <Image
                          src={s.image}
                          alt={s.name}
                          width={600}
                          height={750}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4 md:p-6">
                      <h4 className="font-display text-lg text-bordeaux-900 md:text-2xl">
                        {s.name}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-bordeaux-900/70">
                        {s.description}
                      </p>
                      <div className="mt-4 flex items-end justify-between border-t border-bordeaux-100/60 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-bordeaux-900/60">
                          <Clock size={14} /> {s.duration}
                        </span>
                        <span className="font-display text-2xl text-bordeaux-800 md:text-3xl">
                          {s.price} €
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </AnimatedSection>

      {/* ── GALERIE ── */}
      <AnimatedSection
        id="galerie"
        className="border-y border-bordeaux-100/60 bg-bordeaux-50/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              Réalisations
            </span>
            <h2 className="mt-3 font-display text-4xl text-bordeaux-900 md:text-5xl">
              Galerie
            </h2>
            <p className="mt-5 text-base leading-relaxed text-bordeaux-900/70">
              Quelques résultats de mes prestations. Chaque cliente est
              unique — l'adaptation est totale.
            </p>
          </div>

          <div className="mt-16 columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
            {PHOTOS.map((p, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-bordeaux-100/60 bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-bordeaux-200/40 lg:mb-4"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={600}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── À PROPOS ── */}
      <AnimatedSection id="apropos" className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-bordeaux-200/40">
              <Image
                src="/gallery/cils-03.png"
                alt="Naéa Beauty au travail"
                width={800}
                height={800}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              L&apos;univers Naéa
            </span>
            <h2 className="mt-3 font-display text-4xl text-bordeaux-900 md:text-5xl">
              Une beauté <em className="text-or-700">douce</em>, naturelle et
              durable
            </h2>
            <p className="mt-5 text-base leading-relaxed text-bordeaux-900/80">
              Chez Naéa Beauty, chaque rendez-vous est un moment pour soi.
              Je travaille en petits comités, avec des soins minutieux et des
              produits sélectionnés, pour vous offrir un résultat sublime sans
              dénaturer vos traits.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Une approche personnalisée à chaque cliente",
                "Des produits professionnels haut de gamme",
                "Une hygiène irréprochable, à domicile",
                "Un accompagnement avant et après la prestation",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-bordeaux-900/85"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-or-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AnimatedSection>

      {/* ── RÉSERVER ── */}
      <AnimatedSection
        id="reserver"
        className="border-t border-bordeaux-100/60 bg-gradient-to-b from-bordeaux-50/50 to-cream py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              Demande de rendez-vous
            </span>
            <h2 className="mt-3 font-display text-4xl text-bordeaux-900 md:text-5xl">
              Réserver votre rendez-vous
            </h2>
            <p className="mt-5 text-base leading-relaxed text-bordeaux-900/70">
              Remplissez le formulaire ci-dessous. Je vous réponds
              personnellement dans la journée pour confirmer votre créneau.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-bordeaux-100/60 bg-white p-8 shadow-sm md:p-10">
              <ReservationForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-bordeaux-950 p-8 text-or-100">
                <h3 className="font-display text-2xl text-or-300">
                  Informations pratiques
                </h3>
                <ul className="mt-6 space-y-5 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-or-400" />
                    <div>
                      <p className="font-semibold">Nantes</p>
                      <p className="text-or-100/70">
                        À mon domicile ou chez vous, sans supplément.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-or-400" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <a
                        href="mailto:contact@naeabeauty.com"
                        className="text-or-100/70 hover:text-or-300"
                      >
                        contact@naeabeauty.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <InstagramIcon size={18} className="mt-0.5 shrink-0 text-or-400" />
                    <div>
                      <p className="font-semibold">Instagram</p>
                      <a
                        href="https://instagram.com/naea_beauty"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-or-100/70 hover:text-or-300"
                      >
                        @naea_beauty
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <TikTokIcon size={18} className="mt-0.5 shrink-0 text-or-400" />
                    <div>
                      <p className="font-semibold">TikTok</p>
                      <a
                        href="https://tiktok.com/@naea_beauty"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-or-100/70 hover:text-or-300"
                      >
                        @naea_beauty
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-bordeaux-100/60 bg-cream p-8">
                <h4 className="font-display text-xl text-bordeaux-900">
                  Bon à savoir
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-bordeaux-900/75">
                  <li>• Durée moyenne : 1 heure par prestation</li>
                  <li>• Paiement : espèces, virement ou PayPal</li>
                  <li>• Annulation possible jusqu&apos;à 24h avant</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
