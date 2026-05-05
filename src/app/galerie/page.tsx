import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Galerie — Naéa Beauty",
  description:
    "Découvrez les réalisations de Naéa Beauty : réhaussement de cils, browlift et blanchiment dentaire.",
};

const PHOTOS: { src: string; alt: string; tall?: boolean }[] = [
  { src: "/gallery/cils-1.png", alt: "Réhaussement de cils — résultat naturel", tall: true },
  { src: "/gallery/cils-2.png", alt: "Réhaussement de cils Naéa Beauty" },
  { src: "/gallery/browlift-1.png", alt: "Browlift — sourcils sublimés" },
  { src: "/gallery/cils-3.png", alt: "Réhaussement de cils Naéa Beauty", tall: true },
  { src: "/gallery/dents-1.png", alt: "Blanchiment dentaire en cours" },
  { src: "/gallery/cils-4.png", alt: "Réhaussement de cils Naéa Beauty" },
  { src: "/gallery/dents-3.png", alt: "Blanchiment dentaire — résultat", tall: true },
  { src: "/gallery/dents-2.png", alt: "Blanchiment dentaire ultra white" },
];

export default function GaleriePage() {
  return (
    <>
      <section className="border-b border-bordeaux-100/60 bg-gradient-to-b from-bordeaux-50/50 to-cream py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Réalisations
          </span>
          <h1 className="mt-3 font-display text-5xl text-bordeaux-900 md:text-6xl">
            Galerie
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-bordeaux-900/70">
            Quelques résultats de mes prestations. Chaque cliente est
            unique — l’adaptation est totale.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
          {PHOTOS.map((p, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-bordeaux-100/60 bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-bordeaux-200/40 lg:mb-6"
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={p.tall ? 800 : 800}
                height={p.tall ? 1100 : 800}
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-bordeaux-50/60 p-10 text-center">
          <h3 className="font-display text-3xl text-bordeaux-900">
            Envie d’un résultat semblable ?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-bordeaux-900/70">
            Chaque prestation est sur-mesure. Réservez votre rendez-vous et
            nous définirons ensemble le résultat qui vous correspond.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-bordeaux-800 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-or-100 transition-all hover:bg-bordeaux-900"
          >
            <Calendar size={16} /> Réserver
          </Link>
        </div>
      </section>
    </>
  );
}
