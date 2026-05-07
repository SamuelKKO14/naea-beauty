import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getResend } from "@/lib/resend";
import {
  demandeReservationClienteHTML,
  nouvelleReservationAdminHTML,
} from "@/lib/email-templates";

export async function POST(request: Request) {
  console.log("=== BOOKING API CALLED ===");
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

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

    console.log("=== BOOKING PAYLOAD ===", JSON.stringify({ prestation_id, date_rdv, heure_rdv, lieu, prenom, nom, email }));

    // --- Validation basique ---
    if (!prestation_id || !date_rdv || !heure_rdv || !lieu || !prenom || !nom || !email || !telephone) {
      console.log("=== BOOKING VALIDATION FAILED ===");
      return Response.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // --- Vérifier que la prestation existe et est active ---
    const { data: prestation } = await supabase
      .from("prestations")
      .select("id, nom, prix, duree_minutes, actif")
      .eq("id", prestation_id)
      .single();

    if (!prestation || !prestation.actif) {
      console.log("=== BOOKING PRESTATION NOT FOUND ===");
      return Response.json({ error: "Prestation introuvable ou inactive." }, { status: 400 });
    }

    // --- Vérifier doublon exact : même email + date + heure ---
    const emailNorm = email.trim().toLowerCase();
    const { data: duplicate } = await supabase
      .from("reservations")
      .select("id, montant_total, montant_acompte, client:clients(email)")
      .eq("date_rdv", date_rdv)
      .eq("heure_rdv", heure_rdv)
      .not("statut", "in", '("annulee","no_show")')
      .limit(10);

    console.log("=== DUPLICATE CHECK ===", JSON.stringify(duplicate));

    if (duplicate && duplicate.length > 0) {
      const existingForClient = duplicate.find(
        (r: any) => r.client?.email === emailNorm
      );
      if (existingForClient) {
        console.log("=== DUPLICATE FOUND — RETURNING EXISTING, NO EMAILS SENT ===", existingForClient.id);
        return Response.json({
          success: true,
          reservation_id: existingForClient.id,
          montant_total: existingForClient.montant_total,
          montant_acompte: existingForClient.montant_acompte,
          _debug: "duplicate_returned",
        });
      }
      console.log("=== SLOT TAKEN BY SOMEONE ELSE ===");
      return Response.json({ error: "Ce créneau est déjà réservé." }, { status: 409 });
    }

    // --- Find or create client ---
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("email", emailNorm)
      .limit(1);

    let client_id: string;

    if (existingClient && existingClient.length > 0) {
      client_id = existingClient[0].id;
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
        console.log("=== CLIENT CREATION FAILED ===", JSON.stringify(clientError));
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
      console.log("=== RESERVATION CREATION FAILED ===", JSON.stringify(resError));
      return Response.json({ error: "Erreur lors de la création de la réservation." }, { status: 500 });
    }

    console.log("=== RESERVATION CREATED ===", reservation.id);

    // --- Récupérer les paramètres pour les emails ---
    const { data: allParams } = await supabase
      .from("parametres")
      .select("cle, valeur")
      .in("cle", ["email_notification", "paypal_email", "iban", "site_url"]);

    const params: Record<string, string> = {};
    for (const p of allParams || []) {
      params[p.cle] = p.valeur;
    }

    console.log("=== EMAIL PARAMS ===", JSON.stringify(params));

    const siteUrl = params.site_url || "";
    const prenomTrimmed = prenom.trim();
    const nomTrimmed = nom.trim();

    // --- Email récap à la cliente ---
    let clientEmailResult: any = null;
    let clientEmailError: any = null;
    console.log("=== SENDING CLIENT EMAIL to:", emailNorm, "===");
    try {
      clientEmailResult = await getResend().emails.send({
        from: "Naéa Beauty <contact@naeabeauty.beauty>",
        to: emailNorm,
        replyTo: "samuelempire002@gmail.com",
        subject: "Votre demande de rendez-vous Naéa Beauty",
        html: demandeReservationClienteHTML({
          prenom: prenomTrimmed,
          prestation_nom: prestation.nom,
          date_rdv,
          heure_rdv,
          lieu,
          montant_acompte,
          paypal_email: params.paypal_email || null,
          iban: params.iban || null,
        }),
      });
      console.log("=== CLIENT EMAIL SENT ===", JSON.stringify(clientEmailResult));
    } catch (error) {
      clientEmailError = error;
      console.error("=== CLIENT EMAIL FAILED ===", JSON.stringify(error));
    }

    // --- Email notification à l'admin ---
    let adminEmailResult: any = null;
    let adminEmailError: any = null;
    console.log("=== ADMIN EMAIL TARGET:", params.email_notification || "NONE", "===");
    if (params.email_notification) {
      console.log("=== SENDING ADMIN EMAIL to:", params.email_notification, "===");
      try {
        adminEmailResult = await getResend().emails.send({
          from: "Naéa Beauty <contact@naeabeauty.beauty>",
          to: params.email_notification,
          replyTo: "samuelempire002@gmail.com",
          subject: `🔔 Nouvelle réservation — ${prenomTrimmed} ${nomTrimmed} — ${prestation.nom}`,
          html: nouvelleReservationAdminHTML({
            prenom: prenomTrimmed,
            nom: nomTrimmed,
            email: emailNorm,
            telephone: telephone.trim(),
            prestation_nom: prestation.nom,
            prestation_prix: prestation.prix,
            date_rdv,
            heure_rdv,
            lieu,
            montant_acompte,
            notes_client: notes_client?.trim() || null,
            backoffice_url: `${siteUrl}/admin/reservations`,
          }),
        });
        console.log("=== ADMIN EMAIL SENT ===", JSON.stringify(adminEmailResult));
      } catch (error) {
        adminEmailError = error;
        console.error("=== ADMIN EMAIL FAILED ===", JSON.stringify(error));
      }
    }

    console.log("=== BOOKING COMPLETE ===");

    return Response.json({
      success: true,
      reservation_id: reservation.id,
      montant_total,
      montant_acompte,
      emailResults: {
        clientEmail: clientEmailResult,
        clientEmailError: clientEmailError ? String(clientEmailError) : null,
        adminEmail: adminEmailResult,
        adminEmailError: adminEmailError ? String(adminEmailError) : null,
      },
    });
  } catch (error) {
    console.error("=== BOOKING GLOBAL ERROR ===", JSON.stringify(error));
    return Response.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
