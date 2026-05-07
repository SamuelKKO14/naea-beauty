// Couleurs Naéa Beauty
const BORDEAUX_950 = "#3D0F1E";
const BORDEAUX_800 = "#7A1F3D";
const OR = "#C9A84C";
const OR_CLAIR = "#E8D5B5";
const CREAM = "#FFF8F0";
const BLANC = "#FFFFFF";
const GRIS_SEC = "#888888";

const FONT_TITRE = "Georgia, 'Times New Roman', serif";
const FONT_CORPS = "Arial, Helvetica, sans-serif";

const LOGO_URL = "https://naeabeauty.beauty/logo.png";

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${LOGO_URL}">
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:${FONT_CORPS};">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BLANC};border-radius:12px;overflow:hidden;border:1px solid ${OR_CLAIR};">
  <!-- Header avec logo -->
  <tr>
    <td style="background-color:${BORDEAUX_950};padding:28px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="Naéa Beauty" height="60" style="height:60px;width:auto;display:inline-block;" />
    </td>
  </tr>
  <!-- Espace -->
  <tr><td style="height:24px;"></td></tr>
  <!-- Body -->
  <tr>
    <td style="padding:0 40px 35px;color:${BORDEAUX_950};font-size:15px;line-height:1.7;font-family:${FONT_CORPS};">
      ${content}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="padding:32px 40px 28px;text-align:center;border-top:1px solid ${OR_CLAIR};">
      <p style="margin:0 0 4px;font-family:${FONT_TITRE};font-size:18px;color:${BORDEAUX_800};font-weight:700;">Naéa Beauty</p>
      <p style="margin:0 0 16px;font-size:12px;color:${GRIS_SEC};">Nantes — Beauté sur mesure</p>
      <p style="margin:0 0 6px;color:${GRIS_SEC};font-size:13px;">07 68 60 89 80 &middot; Instagram <a href="https://instagram.com/naea_beauty" style="color:${OR};text-decoration:none;">@naea_beauty</a></p>
      <p style="margin:0;color:#aaa;font-size:11px;">Naéa Beauty &mdash; Tous droits réservés</p>
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
    <td style="padding:8px 12px;font-size:14px;color:${BORDEAUX_800};opacity:0.7;border-bottom:1px solid ${OR_CLAIR};width:40%;font-family:${FONT_CORPS};">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:${BORDEAUX_950};border-bottom:1px solid ${OR_CLAIR};font-weight:600;font-family:${FONT_CORPS};">${value}</td>
  </tr>`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatLieu(lieu: string) {
  return lieu === "chez_naea" ? "Chez Naéa" : "À domicile";
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
    ? `<div style="margin:24px 0;padding:20px;background-color:${CREAM};border-left:4px solid ${OR};border-radius:6px;">
        <p style="margin:0 0 8px;font-weight:700;color:${BORDEAUX_800};font-size:14px;font-family:${FONT_TITRE};">Consignes avant votre soin</p>
        <p style="margin:0;font-size:14px;color:${BORDEAUX_950};line-height:1.6;">${data.consignes_pre_soin.replace(/\n/g, "<br>")}</p>
      </div>`
    : "";

  return layout(`
    <p style="margin:0 0 20px;">Bonjour <strong>${data.prenom}</strong>,</p>
    <p style="margin:0 0 24px;">Votre rendez-vous est confirmé ! Nous avons bien reçu votre acompte.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${OR_CLAIR};border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${infoRow("Prestation", data.prestation_nom)}
      ${infoRow("Date", formatDate(data.date_rdv))}
      ${infoRow("Heure", data.heure_rdv.slice(0, 5))}
      ${infoRow("Lieu", formatLieu(data.lieu))}
      ${infoRow("Montant total", formatPrice(data.montant_total))}
      ${infoRow("Acompte versé", formatPrice(data.montant_acompte))}
      ${infoRow("Reste à payer", formatPrice(reste))}
    </table>

    ${consignesBlock}

    <div style="margin:24px 0;padding:16px 20px;background-color:${CREAM};border-radius:8px;border:1px solid ${OR_CLAIR};">
      <p style="margin:0;font-size:13px;color:${BORDEAUX_950};line-height:1.6;">
        Si vous devez annuler, merci de nous prévenir au moins <strong>24h à l'avance</strong>. L'acompte est non-remboursable.
      </p>
    </div>

    <p style="margin:24px 0 0;font-size:15px;">À très bientôt,</p>
    <p style="margin:4px 0 0;font-size:15px;color:${BORDEAUX_800};font-weight:700;font-family:${FONT_TITRE};">Naéa Beauty</p>
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
    ? `<div style="margin:20px 0;padding:16px;background-color:${CREAM};border-radius:8px;border:1px solid ${OR_CLAIR};">
        <p style="margin:0 0 6px;font-weight:700;font-size:13px;color:${BORDEAUX_800};opacity:0.7;">Message de la cliente</p>
        <p style="margin:0;font-size:14px;color:${BORDEAUX_950};line-height:1.5;">${data.notes_client.replace(/\n/g, "<br>")}</p>
      </div>`
    : "";

  return layout(`
    <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:${BORDEAUX_800};font-family:${FONT_TITRE};">Nouvelle réservation !</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${OR_CLAIR};border-radius:8px;overflow:hidden;margin-bottom:20px;">
      ${infoRow("Prénom", data.prenom)}
      ${infoRow("Nom", data.nom)}
      ${infoRow("Email", data.email)}
      ${infoRow("Téléphone", data.telephone)}
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
      <a href="${data.backoffice_url}" style="display:inline-block;background-color:${OR};color:${BLANC};padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;font-family:${FONT_CORPS};">Voir dans le back-office</a>
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
      ? `<p style="margin:0 0 8px;font-size:14px;color:${BORDEAUX_950};"><strong>PayPal :</strong> ${data.paypal_email}</p>`
      : "";
    const ibanLine = data.iban
      ? `<p style="margin:0;font-size:14px;color:${BORDEAUX_950};"><strong>IBAN :</strong> ${data.iban}</p>`
      : "";

    paiementBlock = `
      <div style="margin:20px 0;padding:20px;background-color:${CREAM};border-left:4px solid ${OR};border-radius:6px;">
        <p style="margin:0 0 12px;font-weight:700;color:${BORDEAUX_800};font-size:14px;font-family:${FONT_TITRE};">Coordonnées de paiement</p>
        ${paypalLine}
        ${ibanLine}
      </div>`;
  }

  return layout(`
    <p style="margin:0 0 20px;">Bonjour <strong>${data.prenom}</strong>,</p>
    <p style="margin:0 0 24px;">Nous avons bien reçu votre demande de rendez-vous.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${OR_CLAIR};border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${infoRow("Prestation", data.prestation_nom)}
      ${infoRow("Date", formatDate(data.date_rdv))}
      ${infoRow("Heure", data.heure_rdv.slice(0, 5))}
      ${infoRow("Lieu", formatLieu(data.lieu))}
    </table>

    <p style="margin:0 0 16px;">Pour confirmer votre rendez-vous, merci de verser l'acompte de <strong>${formatPrice(data.montant_acompte)}</strong> par PayPal ou virement bancaire.</p>

    ${paiementBlock}

    <p style="margin:20px 0 0;font-size:14px;color:${BORDEAUX_800};opacity:0.7;">Votre rendez-vous sera confirmé dès réception de l'acompte.</p>

    <p style="margin:24px 0 0;font-size:15px;">À très bientôt,</p>
    <p style="margin:4px 0 0;font-size:15px;color:${BORDEAUX_800};font-weight:700;font-family:${FONT_TITRE};">Naéa Beauty</p>
  `);
}
