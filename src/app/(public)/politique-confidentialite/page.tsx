import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Naéa Beauty",
  description:
    "Comment Naéa Beauty collecte, utilise et protège vos données personnelles.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-32 lg:px-10">
      <h1 className="font-display text-3xl text-bordeaux-900 md:text-4xl">
        Politique de confidentialité
      </h1>
      <p className="mt-3 text-sm text-bordeaux-900/60">
        Dernière mise à jour&nbsp;: {new Date().toLocaleDateString("fr-FR")}
      </p>

      <div className="prose-naea mt-10 space-y-8 text-sm leading-relaxed text-bordeaux-900/80">
        <section>
          <p>
            Chez Naéa Beauty, nous attachons une grande importance à la
            protection de vos données personnelles. Cette politique explique
            quelles informations nous collectons, pourquoi, et comment elles
            sont protégées.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Données collectées</h2>
          <p className="mt-3">
            Lorsque vous réservez un rendez-vous via notre site, nous
            collectons les informations suivantes&nbsp;:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Prénom et nom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Date et heure du rendez-vous souhaité</li>
            <li>Lieu de prestation (à domicile ou chez Naéa)</li>
            <li>Notes éventuelles que vous nous communiquez</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Finalités du traitement</h2>
          <p className="mt-3">Vos données sont utilisées exclusivement pour&nbsp;:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Gérer votre rendez-vous (confirmation, rappel, suivi)</li>
            <li>Vous contacter en cas de besoin pour votre prestation</li>
            <li>Envoyer un récapitulatif et les instructions de paiement</li>
            <li>Tenir un historique de vos prestations</li>
          </ul>
          <p className="mt-3">
            Vos données ne sont <strong>jamais revendues</strong> à des tiers
            et ne sont utilisées à aucune fin commerciale ou publicitaire
            externe.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Stockage et sécurité</h2>
          <p className="mt-3">
            Vos données sont stockées en toute sécurité sur les serveurs
            de <strong>Supabase</strong> (infrastructure conforme au RGPD,
            hébergement européen). Les communications sont chiffrées (HTTPS).
            L&apos;accès est restreint aux personnes autorisées.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Durée de conservation</h2>
          <p className="mt-3">
            Vos données sont conservées tant que votre compte client est
            actif. Vous pouvez demander leur suppression à tout moment (voir
            « Vos droits »).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Cookies</h2>
          <p className="mt-3">
            Le site n&apos;utilise que des cookies techniques strictement
            nécessaires à son fonctionnement (session, préférences). Aucun
            cookie de traçage publicitaire n&apos;est déposé.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Vos droits</h2>
          <p className="mt-3">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
            rectification, d&apos;effacement, d&apos;opposition et de portabilité de
            vos données. Pour exercer ces droits, contactez-nous&nbsp;:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>
              Par email&nbsp;: <a href="mailto:contact@naeabeauty.beauty" className="text-or-700 hover:underline">contact@naeabeauty.beauty</a>
            </li>
            <li>
              Par téléphone&nbsp;: <a href="tel:+33768608980" className="text-or-700 hover:underline">07 68 60 89 80</a>
            </li>
          </ul>
          <p className="mt-3">
            Vous pouvez également introduire une réclamation auprès de la
            CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-or-700 hover:underline">www.cnil.fr</a>).
          </p>
        </section>
      </div>
    </article>
  );
}
