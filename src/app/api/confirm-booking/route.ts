import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resend } from "@/lib/resend";
import { confirmationClienteHTML } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const { reservation_id } = await request.json();

    if (!reservation_id) {
      return Response.json({ error: "reservation_id requis." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Récupérer la réservation avec client + prestation
    const { data: reservation } = await supabase
      .from("reservations")
      .select("*, client:clients(prenom, email), prestation:prestations(nom)")
      .eq("id", reservation_id)
      .single();

    if (!reservation) {
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

    if (!clientEmail) {
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

    await resend.emails.send({
      from: "Naéa Beauty <onboarding@resend.dev>",
      to: clientEmail,
      subject: "Votre rendez-vous Naéa Beauty est confirmé ✨",
      html,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Erreur lors de l'envoi de l'email." }, { status: 500 });
  }
}
