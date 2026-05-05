import { Mail, MapPin } from "lucide-react";
import { InstagramIcon, TikTokIcon } from "@/components/social-icons";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact & Réservation — Naéa Beauty",
  description:
    "Réservez votre prestation Naéa Beauty à Nantes : cils, sourcils, blanchiment dentaire.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-bordeaux-100/60 bg-gradient-to-b from-bordeaux-50/50 to-cream py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Demande de rendez-vous
          </span>
          <h1 className="mt-3 font-display text-5xl text-bordeaux-900 md:text-6xl">
            Contact & Réservation
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-bordeaux-900/70">
            Remplissez le formulaire ci-dessous. Je vous reponds personnellement
            dans la journée pour confirmer votre créneau.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.4fr_1fr] lg:px-10">
        <div className="rounded-2xl border border-bordeaux-100/60 bg-white p-8 shadow-sm md:p-10">
          <ContactForm />
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
              <li>• Annulation possible jusqu’à 24h avant</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
