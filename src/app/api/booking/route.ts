import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prestation_id,
      date_rdv,
      heure_rdv,
      lieu,
      prenom,
      nom,
      email,
      telephone,
      notes_client,
    } = body;

    // --- Validation basique ---
    if (!prestation_id || !date_rdv || !heure_rdv || !lieu || !prenom || !nom || !email || !telephone) {
      return Response.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // --- Vérifier que la prestation existe et est active ---
    const { data: prestation } = await supabase
      .from("prestations")
      .select("id, prix, duree_minutes, actif")
      .eq("id", prestation_id)
      .single();

    if (!prestation || !prestation.actif) {
      return Response.json({ error: "Prestation introuvable ou inactive." }, { status: 400 });
    }

    // --- Vérifier que le créneau n'est pas déjà pris ---
    const { data: existing } = await supabase
      .from("reservations")
      .select("id")
      .eq("date_rdv", date_rdv)
      .eq("heure_rdv", heure_rdv)
      .not("statut", "in", '("annulee","no_show")')
      .limit(1);

    if (existing && existing.length > 0) {
      return Response.json({ error: "Ce créneau est déjà réservé." }, { status: 409 });
    }

    // --- Find or create client ---
    const emailNorm = email.trim().toLowerCase();
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("email", emailNorm)
      .limit(1);

    let client_id: string;

    if (existingClient && existingClient.length > 0) {
      client_id = existingClient[0].id;
      // Mettre à jour nom/téléphone si changé
      await supabase
        .from("clients")
        .update({
          prenom: prenom.trim(),
          nom: nom.trim(),
          telephone: telephone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", client_id);
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: emailNorm,
          telephone: telephone.trim(),
        })
        .select("id")
        .single();

      if (clientError || !newClient) {
        return Response.json({ error: "Erreur lors de la création du client." }, { status: 500 });
      }
      client_id = newClient.id;
    }

    // --- Récupérer le pourcentage d'acompte ---
    const { data: paramAcompte } = await supabase
      .from("parametres")
      .select("valeur")
      .eq("cle", "acompte_pourcentage")
      .single();

    const acomptePct = paramAcompte ? parseInt(paramAcompte.valeur, 10) : 50;
    const montant_total = prestation.prix;
    const montant_acompte = Math.round((montant_total * acomptePct) / 100);

    // --- Créer la réservation ---
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .insert({
        client_id,
        prestation_id,
        date_rdv,
        heure_rdv,
        lieu,
        statut: "en_attente",
        montant_total,
        montant_acompte,
        acompte_paye: false,
        notes_client: notes_client?.trim() || null,
      })
      .select("id")
      .single();

    if (resError || !reservation) {
      return Response.json({ error: "Erreur lors de la création de la réservation." }, { status: 500 });
    }

    return Response.json({ success: true, reservation_id: reservation.id });
  } catch {
    return Response.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
