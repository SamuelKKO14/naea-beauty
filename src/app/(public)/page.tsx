"use client";

import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Phone,
  Sparkles,
  Check,
} from "lucide-react";
import {
  motion,
  useInView,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SERVICES } from "@/lib/services";
import { ReservationForm } from "@/components/contact-form";
import { Mail } from "lucide-react";
import { InstagramIcon, TikTokIcon } from "@/components/social-icons";
import { ShimmerButton, BorderAnimateButton } from "@/components/shimmer-button";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { BeforeAfterSlider } from "@/components/before-after-slider";

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
  { id: "avant-apres", label: "Avant / Après" },
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

/* ─── HERO SLIDESHOW ──────────────────────────────── */
const HERO_IMAGES = [
  "/hero/hero-1.png",
  "/hero/hero-2.png",
  "/hero/hero-3.png",
  "/hero/hero-4.png",
  "/hero/hero-5.png",
];

function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
    >
      {/* Slideshow — toutes les images empilées, fade */}
      {HERO_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`Naéa Beauty — prestation cils #${i + 1}`}
          fill
          priority={i === 0}
          className={`object-contain transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
        />
      ))}

      {/* Overlay sombre */}
      <div aria-hidden className="absolute inset-0 bg-black/40" />

      {/* Contenu texte */}
      <div className="relative z-10 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-xl lg:max-w-lg">
            <ShimmerBadge />
            <GoldLine />

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-8 font-display text-3xl leading-tight text-white md:text-4xl lg:text-5xl"
            >
              Sublimez
              <br />
              votre regard,
              <br />
              <span className="italic text-or-300">révélez votre beauté.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-4 max-w-md text-lg leading-relaxed text-white/80"
            >
              Réhaussement de cils, browlift et blanchiment dentaire à Nantes.
              Des soins pensés pour sublimer votre beauté naturelle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/60"
            >
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-or-400" /> Sur Nantes
              </span>
              <span className="hidden h-3 w-px bg-white/20 sm:block" />
              <span className="flex items-center gap-2">
                <Heart size={15} className="text-or-400" /> A domicile ou chez moi
              </span>
              <span className="hidden h-3 w-px bg-white/20 sm:block" />
              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-or-400" /> 1h de prestation
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
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

      {/* ── PRESTATIONS (pricing cards) ── */}
      <AnimatedSection id="prestations" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Nos soins
          </span>
          <h2 className="mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl">
            Prestations & tarifs
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
            Chaque soin dure environ 1h. Paiement accepté en espèces,
            virement ou PayPal.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
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
                <h4 className="mt-3 font-display text-base leading-snug text-bordeaux-900 md:text-lg">
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
                <p className="text-center font-display text-xl text-bordeaux-900">
                  {s.price}{" "}
                  <span className="text-sm text-bordeaux-600">€</span>
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

      {/* ── AVANT / APRÈS ── */}
      <AnimatedSection
        id="avant-apres"
        className="relative z-10 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              Résultats
            </span>
            <h2 className="mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl">
              Avant / Après
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col items-center gap-3">
                <BeforeAfterSlider
                  before={`/before-after/avant-${n}.jpg`}
                  after={`/before-after/apres-${n}.jpg`}
                  alt={`Résultat ${n}`}
                />
                <span className="text-sm text-bordeaux-900/70">
                  Réhaussement de cils
                </span>
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
              Ce qu&apos;elles en disent
            </span>
            <h2 className="mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl">
              Avis clientes
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
              Des clientes ravies, c&apos;est la meilleure preuve.
            </p>
          </div>

          <div className="mt-14">
            <TestimonialsCarousel />
          </div>
        </div>
      </AnimatedSection>

      {/* ── À PROPOS ── */}
      <AnimatedSection id="apropos" className="relative z-10 py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[auto_1fr] lg:px-10">
          <div className="relative mx-auto max-w-sm">
            <div className="aspect-square overflow-hidden rounded-[2rem] shadow-xl shadow-bordeaux-200/40">
              <Image
                src="/gallery/cils-03.png"
                alt="Naéa Beauty au travail"
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              L&apos;univers Naéa
            </span>
            <h2 className="mt-2 font-display text-2xl text-bordeaux-900 md:text-3xl">
              Une beauté <em className="text-or-700">douce</em>, naturelle et
              durable
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-bordeaux-900/70">
              Chez Naéa Beauty, chaque rendez-vous est un moment pour soi.
              Je prends le temps avec chaque cliente, avec des produits
              professionnels sélectionnés, pour sublimer vos traits sans jamais
              les dénaturer.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                "Une approche personnalisée à chaque cliente",
                "Des produits professionnels haut de gamme",
                "Une hygiène irréprochable, à domicile",
                "Un accompagnement avant et après la prestation",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-bordeaux-900/70"
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
              Prendre rendez-vous
            </span>
            <h2 className="mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl">
              Offrez-vous un moment Naéa
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
              Choisissez votre soin et votre créneau. Je vous confirme
              dans la journée.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-bordeaux-100/60 bg-white p-8 shadow-sm md:p-10">
              <ReservationForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-bordeaux-950 p-8 text-or-100">
                <h3 className="font-display text-xl text-or-300">
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
                    <Phone size={18} className="mt-0.5 shrink-0 text-or-400" />
                    <div>
                      <p className="font-semibold">Téléphone</p>
                      <a
                        href="tel:+33768608980"
                        className="text-or-100/70 hover:text-or-300"
                      >
                        07 68 60 89 80
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-or-400" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <a
                        href="mailto:contact@naeabeauty.beauty"
                        className="text-or-100/70 hover:text-or-300"
                      >
                        contact@naeabeauty.beauty
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
                <h4 className="font-display text-lg text-bordeaux-900">
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
