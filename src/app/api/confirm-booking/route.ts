import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getResend } from "@/lib/resend";
import { confirmationClienteHTML } from "@/lib/email-templates";

export async function POST(request: Request) {
  console.log("=== CONFIRM-BOOKING API CALLED ===");

  try {
    // Vérifier l'authentification admin
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn("=== CONFIRM BOOKING DENIED — no authenticated user ===");
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("=== CONFIRM BOOKING — admin:", user.email, "===");

    const { reservation_id } = await request.json();

    if (!reservation_id) {
      console.log("=== CONFIRM: NO RESERVATION ID ===");
      return Response.json({ error: "reservation_id requis." }, { status: 400 });
    }

    console.log("=== CONFIRM: reservation_id:", reservation_id, "===");

    // Récupérer la réservation avec client + prestation
    const { data: reservation } = await supabase
      .from("reservations")
      .select("*, client:clients(prenom, email), prestation:prestations(nom)")
      .eq("id", reservation_id)
      .single();

    if (!reservation) {
      console.log("=== CONFIRM: RESERVATION NOT FOUND ===");
      return Response.json({ error: "Réservation introuvable." }, { status: 404 });
    }

    // Récupérer les consignes pré-soin
    const { data: paramConsignes } = await supabase
      .from("parametres")
      .select("valeur")
      .eq("cle", "consignes_pre_soin")
      .single();

    const clientEmail = (reservation.client as any)?.email;
    const clientPrenom = (reservation.client as any)?.prenom;
    const prestationNom = (reservation.prestation as any)?.nom;

    console.log("=== CONFIRM: clientEmail:", clientEmail, "clientPrenom:", clientPrenom, "===");

    if (!clientEmail) {
      console.log("=== CONFIRM: NO CLIENT EMAIL ===");
      return Response.json({ error: "Email client introuvable." }, { status: 400 });
    }

    const html = confirmationClienteHTML({
      prenom: clientPrenom,
      prestation_nom: prestationNom,
      date_rdv: reservation.date_rdv,
      heure_rdv: reservation.heure_rdv,
      lieu: reservation.lieu,
      montant_total: reservation.montant_total,
      montant_acompte: reservation.montant_acompte,
      consignes_pre_soin: paramConsignes?.valeur || null,
    });

    console.log("=== CONFIRM: SENDING EMAIL to:", clientEmail, "===");
    const result = await getResend().emails.send({
      from: "Naéa Beauty <contact@naeabeauty.beauty>",
      to: clientEmail,
      replyTo: "u8168691726@id.gle",
      subject: "Votre rendez-vous Naéa Beauty est confirmé ✨",
      html,
    });
    console.log("=== CONFIRM: EMAIL SENT ===", JSON.stringify(result));

    return Response.json({ success: true, emailResult: result });
  } catch (error) {
    console.error("=== CONFIRM: GLOBAL ERROR ===", JSON.stringify(error));
    return Response.json({ error: "Erreur lors de l'envoi de l'email." }, { status: 500 });
  }
}
