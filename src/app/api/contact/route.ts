import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  // TODO: brancher Resend pour envoyer l'email à contact@naeabeauty.com
  // (sera ajouté en Phase 2 avec la clé API Resend)
  console.log("[CONTACT]", data);

  return NextResponse.json({ ok: true });
}
