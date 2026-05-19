import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente — Naéa Beauty",
  description:
    "Conditions générales applicables aux prestations Naéa Beauty (acompte, annulation, retard, etc.).",
};

export default function CgvPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-32 lg:px-10">
      <h1 className="font-display text-3xl text-bordeaux-900 md:text-4xl">
        Conditions générales de vente
      </h1>
      <p className="mt-3 text-sm text-bordeaux-900/60">
        Dernière mise à jour&nbsp;: {new Date().toLocaleDateString("fr-FR")}
      </p>

      <div className="prose-naea mt-10 space-y-8 text-sm leading-relaxed text-bordeaux-900/80">
        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 1 — Objet</h2>
          <p className="mt-3">
            Les présentes conditions régissent les prestations de beauté
            proposées par Naéa Beauty (Amina Saydoullayeva)&nbsp;: réhaussement
            de cils, browlift, blanchiment dentaire et services associés,
            réalisés à domicile sur Nantes ou chez Naéa.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 2 — Réservation et acompte</h2>
          <p className="mt-3">
            Toute réservation est effectuée via le formulaire en ligne du
            site. Un <strong>acompte de 50%</strong> du montant total de la
            prestation est demandé pour confirmer le rendez-vous. Le
            rendez-vous n&apos;est confirmé qu&apos;à réception de l&apos;acompte (par
            PayPal ou virement bancaire).
          </p>
          <p className="mt-3">
            L&apos;acompte est <strong>non-remboursable</strong> en cas
            d&apos;annulation par la cliente.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 3 — Annulation et modification</h2>
          <p className="mt-3">
            Toute annulation ou modification du rendez-vous doit être
            communiquée au moins <strong>24 heures à l&apos;avance</strong> par
            email ou téléphone.
          </p>
          <p className="mt-3">
            Passé ce délai, l&apos;acompte est conservé. En cas d&apos;empêchement
            justifié (cas de force majeure), un report pourra être envisagé
            à la discrétion de Naéa Beauty.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 4 — Retard de la cliente</h2>
          <p className="mt-3">
            En cas de retard supérieur à <strong>15 minutes sans
            prévenir</strong>, le rendez-vous pourra être annulé et l&apos;acompte
            conservé. Un retard inférieur entraînera une réduction du temps
            de prestation à la même échéance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 5 — Lieu de prestation</h2>
          <p className="mt-3">
            Les prestations sont réalisées à Nantes&nbsp;:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>à domicile (chez la cliente, sur Nantes et alentours)</li>
            <li>ou chez Naéa Beauty</li>
          </ul>
          <p className="mt-3">
            Aucun supplément de déplacement n&apos;est facturé.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 6 — Résultats et contre-indications</h2>
          <p className="mt-3">
            Les résultats peuvent varier selon la nature des cils, sourcils
            ou dents de chaque cliente. En réservant, vous confirmez
            n&apos;avoir aucune contre-indication connue aux soins choisis
            (allergies, traitement médical particulier, grossesse pour
            certains soins, etc.).
          </p>
          <p className="mt-3">
            En cas de doute, parlez-en avant la prestation. Naéa Beauty ne
            saurait être tenue responsable de réactions liées à des
            contre-indications non déclarées.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 7 — Paiement du solde</h2>
          <p className="mt-3">
            Le solde restant (50% du montant total) est dû le jour de la
            prestation, en <strong>espèces</strong>, par <strong>virement</strong> ou
            via <strong>PayPal</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 8 — Acceptation</h2>
          <p className="mt-3">
            En cochant la case &laquo;&nbsp;J&apos;accepte les conditions de
            réservation&nbsp;&raquo; lors de la prise de rendez-vous, vous
            acceptez sans réserve les présentes conditions générales.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Article 9 — Litiges</h2>
          <p className="mt-3">
            En cas de litige, une solution amiable sera recherchée en
            priorité. À défaut, les tribunaux compétents seront ceux du
            ressort de Nantes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bordeaux-900">Contact</h2>
          <p className="mt-3">
            Pour toute question relative aux CGV&nbsp;:
            <a href="mailto:contact@naeabeauty.beauty" className="ml-1 text-or-700 hover:underline">
              contact@naeabeauty.beauty
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}
