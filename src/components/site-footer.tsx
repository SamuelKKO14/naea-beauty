import { Mail, MapPin } from "lucide-react";
import { InstagramIcon, TikTokIcon } from "@/components/social-icons";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-bordeaux-100/40 bg-bordeaux-950 text-or-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 lg:px-10">
        <div>
          <h3 className="font-display text-2xl tracking-wide">Naéa Beauty</h3>
          <p className="mt-3 text-sm leading-relaxed text-or-100/70">
            Beauté sur-mesure à Nantes — réhaussement de cils, browlift et
            blanchiment dentaire.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-or-300">Navigation</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="#hero" className="hover:text-or-300">
                Accueil
              </a>
            </li>
            <li>
              <a href="#prestations" className="hover:text-or-300">
                Prestations
              </a>
            </li>
            <li>
              <a href="#galerie" className="hover:text-or-300">
                Galerie
              </a>
            </li>
            <li>
              <a href="#reserver" className="hover:text-or-300">
                Réserver
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-or-300">Contact</h4>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-or-400" />
              Nantes — à domicile & déplacements
            </li>
            <li className="flex items-center gap-2">
              <InstagramIcon size={16} className="text-or-400" />
              <a
                href="https://instagram.com/naea_beauty"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-or-300"
              >
                @naea_beauty
              </a>
            </li>
            <li className="flex items-center gap-2">
              <TikTokIcon size={16} className="text-or-400" />
              <a
                href="https://tiktok.com/@naea_beauty"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-or-300"
              >
                TikTok
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-or-400" />
              <a href="mailto:contact@naeabeauty.com" className="hover:text-or-300">
                contact@naeabeauty.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-or-100/10 px-6 py-6 text-center text-xs text-or-100/50 lg:px-10">
        © {new Date().getFullYear()} Naéa Beauty — Tous droits réservés
      </div>
    </footer>
  );
}
