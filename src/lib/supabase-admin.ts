import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase SERVICE ROLE — usage SERVEUR UNIQUEMENT (Server Components,
 * Route Handlers). Contourne la RLS : permet de lire une formation en
 * `brouillon` avant publication. NE JAMAIS importer ce module côté client
 * (la clé est lue depuis SUPABASE_SERVICE_ROLE_KEY, non NEXT_PUBLIC).
 *
 * Rappel sécurité : ne jamais sélectionner lecons.contenu_url / contenu_texte
 * pour les renvoyer au navigateur. Le contenu protégé sera servi plus tard par
 * une route serveur dédiée qui vérifie `acces`.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin: variables d'environnement manquantes.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
