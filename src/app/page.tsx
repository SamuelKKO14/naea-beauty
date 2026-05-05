import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Heart, MapPin, Sparkles } from "lucide-react";
import { SERVICES } from "@/lib/services";

export default function Home() {
  const featured = SERVICES.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        {/* Image de fond plein écran */}
        <Image
          src="/hero.png"
          alt="Naéa Beauty — prestations beauté à Nantes"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Overlay gradient bordeaux */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bordeaux-950 via-bordeaux-950/80 to-bordeaux-950/40"
        />

        {/* Reflet doré subtil */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 80%, rgba(201,169,97,0.35), transparent 60%)",
          }}
        />

        {/* Contenu centré */}
        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-or-300/30 bg-bordeaux-950/50 px-5 py-2 text-xs uppercase tracking-[0.2em] text-or-300 backdrop-blur-sm">
            <Sparkles size={14} /> Beauté sur-mesure · Nantes
          </span>

          {/* Titre */}
          <h1 className="mt-8 max-w-3xl font-display text-5xl leading-[1.08] text-or-100 md:text-6xl lg:text-7xl xl:text-8xl">
            Sublimez votre regard,
            <br />
            <span className="italic text-or-300">éveillez votre éclat.</span>
          </h1>

          {/* Sous-titre */}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-or-100/80 md:text-xl">
            Réhaussement de cils, browlift et blanchiment dentaire.
            <br className="hidden sm:block" />
            Une expérience douce, soignée et entièrement dédiée à vous.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-or-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-all hover:bg-or-400 hover:shadow-xl hover:shadow-or-500/30"
            >
              <Calendar size={18} />
              Réserver
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/prestations"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-or-300/40 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-or-100 backdrop-blur-sm transition-all hover:border-or-300 hover:bg-or-100/5"
            >
              Voir les prestations
            </Link>
          </div>

          {/* Tagline basse */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-or-100/60 md:gap-8">
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
          </div>
        </div>
      </section>

      {/* SERVICES PHARES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Prestations phares
          </span>
          <h2 className="mt-3 font-display text-4xl text-bordeaux-900 md:text-5xl">
            Des soins pensés pour révéler votre beauté
          </h2>
          <p className="mt-5 text-base leading-relaxed text-bordeaux-900/70">
            Chaque prestation est réalisée avec des produits de qualité
            professionnelle, dans une ambiance calme et confidentielle.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {featured.map((s) => (
            <article
              key={s.id}
              className="group overflow-hidden rounded-2xl border border-bordeaux-100/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-bordeaux-200/40"
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
              <div className="p-6">
                <span className="text-xs uppercase tracking-wider text-or-700">
                  {s.category}
                </span>
                <h3 className="mt-2 font-display text-2xl text-bordeaux-900">
                  {s.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bordeaux-900/70">
                  {s.description}
                </p>
                <div className="mt-5 flex items-baseline justify-between border-t border-bordeaux-100/60 pt-4">
                  <span className="text-xs text-bordeaux-900/60">
                    {s.duration}
                  </span>
                  <span className="font-display text-2xl text-bordeaux-800">
                    {s.price} €
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/prestations"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-bordeaux-800 hover:text-bordeaux-600"
          >
            Voir toutes les prestations <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* À PROPOS BAND */}
      <section className="bg-bordeaux-50/50 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-bordeaux-200/40">
              <Image
                src="/gallery/cils-3.png"
                alt="Naéa Beauty au travail"
                width={800}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
              L’univers Naéa
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
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-bordeaux-900 px-8 py-16 text-center text-or-100 md:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(201,169,97,0.3), transparent 60%)",
            }}
          />
          <h2 className="font-display text-4xl md:text-5xl">
            Offrez-vous un moment <em className="text-or-300">Naéa</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-or-100/80">
            Réservez votre prestation en quelques clics. Je vous reviens dans la
            journée pour confirmer votre créneau.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-or-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 transition-all hover:bg-or-400 hover:shadow-2xl hover:shadow-or-500/30"
          >
            <Calendar size={18} />
            Réserver maintenant
          </Link>
        </div>
      </section>
    </>
  );
}
