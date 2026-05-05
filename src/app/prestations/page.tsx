import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { CATEGORIES, SERVICES } from "@/lib/services";

export const metadata = {
  title: "Prestations & tarifs — Naéa Beauty",
  description:
    "Découvrez les prestations de Naéa Beauty à Nantes : réhaussement de cils, browlift et blanchiment dentaire.",
};

export default function PrestationsPage() {
  return (
    <>
      <section className="border-b border-bordeaux-100/60 bg-gradient-to-b from-bordeaux-50/50 to-cream py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Carte des soins
          </span>
          <h1 className="mt-3 font-display text-5xl text-bordeaux-900 md:text-6xl">
            Prestations & tarifs
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-bordeaux-900/70">
            Toutes les prestations durent environ 1 heure. Paiement en
            espèces, par virement ou PayPal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        {CATEGORIES.map((cat, idx) => {
          const items = SERVICES.filter((s) => s.category === cat.name);
          return (
            <div
              key={cat.name}
              className={idx > 0 ? "mt-20" : ""}
            >
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.22em] text-or-700">
                    {cat.tagline}
                  </span>
                  <h2 className="mt-2 font-display text-4xl text-bordeaux-900 md:text-5xl">
                    {cat.name}
                  </h2>
                </div>
                <span className="hidden h-px flex-1 bg-bordeaux-100 md:block" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {items.map((s) => (
                  <article
                    key={s.id}
                    className="group flex overflow-hidden rounded-2xl border border-bordeaux-100/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-bordeaux-200/30"
                  >
                    {s.image && (
                      <div className="relative w-32 shrink-0 overflow-hidden md:w-48">
                        <Image
                          src={s.image}
                          alt={s.name}
                          width={400}
                          height={500}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5 md:p-7">
                      <h3 className="font-display text-2xl text-bordeaux-900">
                        {s.name}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-bordeaux-900/70">
                        {s.description}
                      </p>
                      <div className="mt-4 flex items-end justify-between border-t border-bordeaux-100/60 pt-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-bordeaux-900/60">
                          <Clock size={14} /> {s.duration}
                        </span>
                        <span className="font-display text-3xl text-bordeaux-800">
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

        <div className="mt-20 rounded-2xl border border-or-300/40 bg-bordeaux-950 p-10 text-center text-or-100">
          <h3 className="font-display text-3xl">Une question avant de réserver ?</h3>
          <p className="mx-auto mt-3 max-w-xl text-or-100/80">
            Je vous accompagne avec plaisir pour choisir la prestation
            idéale selon vos envies et la nature de vos cils ou sourcils.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-or-500 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 transition-all hover:bg-or-400"
          >
            <Calendar size={16} /> Prendre rendez-vous
          </Link>
        </div>
      </section>
    </>
  );
}
