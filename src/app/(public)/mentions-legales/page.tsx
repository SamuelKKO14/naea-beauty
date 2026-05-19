import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Naéa Beauty",
  description: "Mentions légales du site Naéa Beauty.",
};

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-32 lg:px-10">
      <h1 className="font-display text-3xl text-bordeaux-900 md:text-4xl">
        Mentions légales
      </h1>
      <p className="mt-3 text-sm text-bordeaux-900/60">
        Dernière mise à jour&nbsp;: {new Date().toLocaleDateString("fr-FR")}
      </p>

      <div className="prose-naea mt-10 space-y-8 text-sm leading-relaxed text-bordeaux-900/80">
        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Éditeur du site</h2>
          <ul className="mt-3 space-y-1.5">
            <li><strong>Nom&nbsp;:</strong> Amina Saydoullayeva</li>
            <li><strong>Activité&nbsp;:</strong> Prestations beauté (réhaussement de cils, browlift, blanchiment dentaire)</li>
            <li><strong>Statut&nbsp;:</strong> Micro-entrepreneur</li>
            <li><strong>Email&nbsp;:</strong> <a href="mailto:contact@naeabeauty.beauty" className="text-or-700 hover:underline">contact@naeabeauty.beauty</a></li>
            <li><strong>Téléphone&nbsp;:</strong> <a href="tel:+33768608980" className="text-or-700 hover:underline">07 68 60 89 80</a></li>
            <li><strong>Localisation&nbsp;:</strong> Nantes (Loire-Atlantique, France)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Directeur de la publication</h2>
          <p className="mt-3">
            Amina Saydoullayeva, en sa qualité d&apos;éditrice du site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Hébergement</h2>
          <p className="mt-3">
            Le site <strong>naeabeauty.beauty</strong> est hébergé par&nbsp;:
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>Vercel Inc.</li>
            <li>340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
            <li>
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-or-700 hover:underline">
                vercel.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Propriété intellectuelle</h2>
          <p className="mt-3">
            L&apos;ensemble du contenu présent sur ce site (textes, images,
            photos avant/après, logo, design) est la propriété exclusive de
            Naéa Beauty, sauf mention contraire. Toute reproduction,
            représentation, modification ou diffusion, partielle ou totale,
            sans autorisation écrite préalable est interdite.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Responsabilité</h2>
          <p className="mt-3">
            Les informations contenues sur ce site sont fournies à titre
            indicatif. Naéa Beauty s&apos;efforce d&apos;assurer leur exactitude
            mais ne peut garantir l&apos;absence d&apos;erreurs. La responsabilité
            de Naéa Beauty ne saurait être engagée en cas de mauvaise
            utilisation des informations communiquées.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Contact</h2>
          <p className="mt-3">
            Pour toute question relative aux présentes mentions légales,
            vous pouvez nous contacter à l&apos;adresse&nbsp;:
            <a href="mailto:contact@naeabeauty.beauty" className="ml-1 text-or-700 hover:underline">
              contact@naeabeauty.beauty
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}
