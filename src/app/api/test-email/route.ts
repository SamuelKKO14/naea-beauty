import { getResend } from "@/lib/resend";

export async function GET() {
  try {
    const { data, error } = await getResend().emails.send({
      from: "Naéa Beauty <contact@naeabeauty.beauty>",
      to: "samuelempire002@gmail.com",
      replyTo: "naeabeauty44@gmail.com",
      subject: "Test Resend Naéa Beauty",
      html: "<h1>Resend fonctionne !</h1><p>Les emails Naéa Beauty sont opérationnels.</p>",
    });

    console.log("[TEST-EMAIL] data:", JSON.stringify(data));
    console.log("[TEST-EMAIL] error:", JSON.stringify(error));

    return Response.json({ data, error });
  } catch (err) {
    console.error("[TEST-EMAIL] exception:", JSON.stringify(err));
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
