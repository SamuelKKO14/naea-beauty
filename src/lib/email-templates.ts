const BORDEAUX = "#722F37";
const OR = "#C8A951";
const GRIS_TEXTE = "#333333";
const GRIS_CLAIR = "#666666";

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
  <!-- Header -->
  <tr>
    <td style="background-color:${BORDEAUX};padding:30px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">Naea Beauty</h1>
      <p style="margin:6px 0 0;color:${OR};font-size:13px;letter-spacing:2px;text-transform:uppercase;">Beaute du regard & du sourire</p>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="padding:35px 40px;color:${GRIS_TEXTE};font-size:15px;line-height:1.7;">
      ${content}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="background-color:#faf9f7;padding:25px 40px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0 0 6px;color:${GRIS_CLAIR};font-size:13px;">07 68 60 89 80 &middot; Instagram <a href="https://instagram.com/naea_beauty" style="color:${BORDEAUX};text-decoration:none;">@naea_beauty</a></p>
      <p style="margin:0;color:#999;font-size:11px;">Naea Beauty &mdash; Tous droits reserves</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px;font-size:14px;color:${GRIS_CLAIR};border-bottom:1px solid #f0f0f0;width:40%;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:${GRIS_TEXTE};border-bottom:1px solid #f0f0f0;font-weight:600;">${value}</td>
  </tr>`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatLieu(lieu: string) {
  return lieu === "chez_naea" ? "Chez Naea" : "A domicile";
}

function formatPrice(n: number) {
  return Number(n).toFixed(2).replace(".", ",") + " \u20AC";
}

// ------------------------------------------------------------------
// 1. Email confirmation apres acompte recu
// ------------------------------------------------------------------

type ConfirmationData = {
  prenom: string;
  prestation_nom: string;
  date_rdv: string;
  heure_rdv: string;
  lieu: string;
  montant_total: number;
  montant_acompte: number;
  consignes_pre_soin: string | null;
};

export function confirmationClienteHTML(data: ConfirmationData): string {
  const reste = data.montant_total - data.montant_acompte;

  const consignesBlock = data.consignes_pre_soin
    ? `<div style="margin:24px 0;padding:20px;background-color:#fdf8f0;border-left:4px solid ${OR};border-radius:6px;">
        <p style="margin:0 0 8px;font-weight:700;color:${BORDEAUX};font-size:14px;">Consignes avant votre soin</p>
        <p style="margin:0;font-size:14px;color:${GRIS_TEXTE};line-height:1.6;">${data.consignes_pre_soin.replace(/\n/g, "<br>")}</p>
      </div>`
    : "";

  return layout(`
    <p style="margin:0 0 20px;">Bonjour <strong>${data.prenom}</strong>,</p>
    <p style="margin:0 0 24px;">Votre rendez-vous est confirme ! Nous avons bien recu votre acompte.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${infoRow("Prestation", data.prestation_nom)}
      ${infoRow("Date", formatDate(data.date_rdv))}
      ${infoRow("Heure", data.heure_rdv.slice(0, 5))}
      ${infoRow("Lieu", formatLieu(data.lieu))}
      ${infoRow("Montant total", formatPrice(data.montant_total))}
      ${infoRow("Acompte verse", formatPrice(data.montant_acompte))}
      ${infoRow("Reste a payer", formatPrice(reste))}
    </table>

    ${consignesBlock}

    <div style="margin:24px 0;padding:16px 20px;background-color:#fff5f5;border-radius:8px;border:1px solid #f0dede;">
      <p style="margin:0;font-size:13px;color:${GRIS_TEXTE};line-height:1.6;">
        Si vous devez annuler, merci de nous prevenir au moins <strong>24h a l'avance</strong>. L'acompte est non-remboursable.
      </p>
    </div>

    <p style="margin:24px 0 0;font-size:15px;">A tres bientot,</p>
    <p style="margin:4px 0 0;font-size:15px;color:${BORDEAUX};font-weight:700;">Naea Beauty</p>
  `);
}

// ------------------------------------------------------------------
// 2. Notification admin nouvelle reservation
// ------------------------------------------------------------------

type AdminNotifData = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  prestation_nom: string;
  prestation_prix: number;
  date_rdv: string;
  heure_rdv: string;
  lieu: string;
  montant_acompte: number;
  notes_client: string | null;
  backoffice_url: string;
};

export function nouvelleReservationAdminHTML(data: AdminNotifData): string {
  const notesBlock = data.notes_client
    ? `<div style="margin:20px 0;padding:16px;background-color:#f9f9f9;border-radius:8px;">
        <p style="margin:0 0 6px;font-weight:700;font-size:13px;color:${GRIS_CLAIR};">Message de la cliente</p>
        <p style="margin:0;font-size:14px;color:${GRIS_TEXTE};line-height:1.5;">${data.notes_client.replace(/\n/g, "<br>")}</p>
      </div>`
    : "";

  return layout(`
    <p style="margin:0 0 20px;font-size:16px;font-weight:700;color:${BORDEAUX};">Nouvelle reservation !</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      ${infoRow("Prenom", data.prenom)}
      ${infoRow("Nom", data.nom)}
      ${infoRow("Email", data.email)}
      ${infoRow("Telephone", data.telephone)}
      ${infoRow("Prestation", data.prestation_nom)}
      ${infoRow("Prix", formatPrice(data.prestation_prix))}
      ${infoRow("Date", formatDate(data.date_rdv))}
      ${infoRow("Heure", data.heure_rdv.slice(0, 5))}
      ${infoRow("Lieu", formatLieu(data.lieu))}
      ${infoRow("Acompte attendu", formatPrice(data.montant_acompte))}
      ${infoRow("Statut", "En attente de paiement")}
    </table>

    ${notesBlock}

    <div style="text-align:center;margin:24px 0;">
      <a href="${data.backoffice_url}" style="display:inline-block;background-color:${BORDEAUX};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Voir dans le back-office</a>
    </div>
  `);
}

// ------------------------------------------------------------------
// 3. Email demande de reservation (avant paiement)
// ------------------------------------------------------------------

type DemandeData = {
  prenom: string;
  prestation_nom: string;
  date_rdv: string;
  heure_rdv: string;
  lieu: string;
  montant_acompte: number;
  paypal_email: string | null;
  iban: string | null;
};

export function demandeReservationClienteHTML(data: DemandeData): string {
  let paiementBlock = "";

  if (data.paypal_email || data.iban) {
    const paypalLine = data.paypal_email
      ? `<p style="margin:0 0 8px;font-size:14px;"><strong>PayPal :</strong> ${data.paypal_email}</p>`
      : "";
    const ibanLine = data.iban
      ? `<p style="margin:0;font-size:14px;"><strong>IBAN :</strong> ${data.iban}</p>`
      : "";

    paiementBlock = `
      <div style="margin:20px 0;padding:20px;background-color:#fdf8f0;border-left:4px solid ${OR};border-radius:6px;">
        <p style="margin:0 0 12px;font-weight:700;color:${BORDEAUX};font-size:14px;">Coordonnees de paiement</p>
        ${paypalLine}
        ${ibanLine}
      </div>`;
  }

  return layout(`
    <p style="margin:0 0 20px;">Bonjour <strong>${data.prenom}</strong>,</p>
    <p style="margin:0 0 24px;">Nous avons bien recu votre demande de rendez-vous.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${infoRow("Prestation", data.prestation_nom)}
      ${infoRow("Date", formatDate(data.date_rdv))}
      ${infoRow("Heure", data.heure_rdv.slice(0, 5))}
      ${infoRow("Lieu", formatLieu(data.lieu))}
    </table>

    <p style="margin:0 0 16px;">Pour confirmer votre rendez-vous, merci de verser l'acompte de <strong>${formatPrice(data.montant_acompte)}</strong> par PayPal ou virement bancaire.</p>

    ${paiementBlock}

    <p style="margin:20px 0 0;font-size:14px;color:${GRIS_CLAIR};">Votre rendez-vous sera confirme des reception de l'acompte.</p>

    <p style="margin:24px 0 0;font-size:15px;">A tres bientot,</p>
    <p style="margin:4px 0 0;font-size:15px;color:${BORDEAUX};font-weight:700;">Naea Beauty</p>
  `);
}
