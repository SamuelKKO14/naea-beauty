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
  Check,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SERVICES } from "@/lib/services";
import { ReservationForm } from "@/components/contact-form";
import { Mail } from "lucide-react";
import { InstagramIcon, TikTokIcon } from "@/components/social-icons";
import { AnimatedGradientBackground } from "@/components/animated-gradient-background";
import { ShimmerButton, BorderAnimateButton } from "@/components/shimmer-button";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

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
  { id: "temoignages", label: "Avis" },
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
              <ShimmerButton href="#reserver">
                <Calendar
                  size={18}
                  className="transition-transform group-hover:rotate-12"
                />
                Réserver
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </ShimmerButton>
              <BorderAnimateButton href="#prestations">
                Voir les prestations
              </BorderAnimateButton>
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
      <AnimatedGradientBackground />
      <ScrollIndicator />

      {/* ── HERO ── */}
      <HeroSection />

      {/* ── PRESTATIONS (pricing cards) ── */}
      <AnimatedSection id="prestations" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
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

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {SERVICES.map((s) => (
            <motion.article
              key={s.id}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex flex-col justify-between rounded-2xl border border-or-300/30 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-or-400/15 md:p-7"
            >
              {/* Category badge */}
              <div>
                <span className="inline-block rounded-full bg-bordeaux-950/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-bordeaux-600">
                  {s.category}
                </span>

                {/* Name */}
                <h4 className="mt-3 font-display text-lg leading-snug text-bordeaux-900 md:text-xl">
                  {s.name}
                </h4>

                {/* Feature list */}
                <ul className="mt-4 space-y-2">
                  {s.description
                    .split(/[.,;!]+/)
                    .filter((part) => part.trim().length > 3)
                    .map((part, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm leading-snug text-bordeaux-900/70"
                      >
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-or-500"
                        />
                        {part.trim()}
                      </li>
                    ))}
                  <li className="flex items-start gap-2 text-sm leading-snug text-bordeaux-900/70">
                    <Clock size={14} className="mt-0.5 shrink-0 text-or-500" />
                    Durée : {s.duration}
                  </li>
                </ul>
              </div>

              {/* Price + CTA */}
              <div className="mt-6 border-t border-or-200/40 pt-5">
                <p className="text-center font-display text-3xl text-bordeaux-900 md:text-4xl">
                  {s.price}{" "}
                  <span className="text-lg text-bordeaux-600">€</span>
                </p>
                <ShimmerButton
                  href="#reserver"
                  className="mt-4 w-full justify-center px-4 py-3 text-xs"
                >
                  <Calendar size={14} />
                  Réserver
                </ShimmerButton>
              </div>
            </motion.article>
          ))}
        </div>
      </AnimatedSection>

      {/* ── GALERIE ── */}
      <AnimatedSection
        id="galerie"
        className="relative z-10 border-y border-bordeaux-100/60 bg-bordeaux-50/30 py-24"
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

      {/* ── TÉMOIGNAGES ── */}
      <AnimatedSection
        id="temoignages"
        className="relative z-10 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              Elles en parlent
            </span>
            <h2 className="mt-3 font-display text-4xl text-bordeaux-900 md:text-5xl">
              Avis clientes
            </h2>
            <p className="mt-5 text-base leading-relaxed text-bordeaux-900/70">
              La satisfaction de mes clientes est ma plus belle récompense.
            </p>
          </div>

          <div className="mt-14">
            <TestimonialsCarousel />
          </div>
        </div>
      </AnimatedSection>

      {/* ── À PROPOS ── */}
      <AnimatedSection id="apropos" className="relative z-10 py-24">
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
        className="relative z-10 border-t border-bordeaux-100/60 bg-gradient-to-b from-bordeaux-50/50 to-cream py-24"
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
