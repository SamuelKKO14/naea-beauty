export type Prestation = {
  id: string;
  nom: string;
  categorie: "cils" | "sourcils" | "sourire";
  description: string | null;
  duree_minutes: number;
  prix: number;
  actif: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Disponibilite = {
  id: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  actif: boolean;
  created_at: string;
};

export type DisponibiliteSpecifique = {
  id: string;
  date_jour: string;
  heure_debut: string;
  heure_fin: string;
  actif: boolean;
  created_at: string;
};

export type Indisponibilite = {
  id: string;
  date_debut: string;
  date_fin: string;
  motif: string | null;
  created_at: string;
};

export type StatutReservation =
  | "en_attente"
  | "confirmee"
  | "realisee"
  | "annulee"
  | "no_show";

export type Reservation = {
  id: string;
  client_id: string;
  prestation_id: string;
  date_rdv: string;
  heure_rdv: string;
  lieu: "chez_naea" | "domicile";
  statut: StatutReservation;
  montant_total: number;
  montant_acompte: number;
  acompte_paye: boolean;
  stripe_payment_id: string | null;
  stripe_checkout_session_id: string | null;
  notes_client: string | null;
  notes_admin: string | null;
  google_event_id: string | null;
  rappel_envoye: boolean;
  created_at: string;
  updated_at: string;
  client?: Client;
  prestation?: Prestation;
};

export type Temoignage = {
  id: string;
  client_id: string | null;
  prenom_affiche: string;
  prestation_nom: string;
  contenu: string;
  note: number;
  affiche: boolean;
  created_at: string;
};

export type Parametre = {
  cle: string;
  valeur: string;
  description: string | null;
  updated_at: string;
};
