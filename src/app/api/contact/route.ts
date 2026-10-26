import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { contactSchema } from "@/lib/contact-validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie um corpo JSON válido." }, { status: 400 });
  }

  const result = contactSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Revise os campos do formulário.",
        fields: result.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "O serviço de contato ainda não foi configurado." },
      { status: 503 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: savedMessage, error: saveError } = await supabase
    .from("messages")
    .insert(result.data)
    .select("id")
    .single();

  if (saveError) {
    console.error("Não foi possível salvar uma mensagem de contato.", saveError.message);
    return NextResponse.json(
      { error: "Não foi possível salvar sua mensagem. Tente novamente mais tarde." },
      { status: 502 },
    );
  }

  const emailApiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!emailApiKey || !contactEmail || !fromEmail) {
    console.error(
      "Mensagem salva, mas as variáveis de e-mail do Resend não estão configuradas.",
      savedMessage.id,
    );
    return NextResponse.json({ saved: true, emailSent: false }, { status: 202 });
  }

  let emailResponse: Response;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [contactEmail],
        reply_to: result.data.email,
        subject: `Portfólio: ${result.data.subject}`,
        text: `Mensagem de ${result.data.name} (${result.data.email})\n\n${result.data.message}`,
      }),
    });
  } catch (error) {
    console.error("Mensagem salva, mas não foi possível conectar ao provedor de e-mail.", {
      messageId: savedMessage.id,
      error: error instanceof Error ? error.message : "Erro de rede desconhecido.",
    });
    return NextResponse.json({ saved: true, emailSent: false }, { status: 202 });
  }

  if (!emailResponse.ok) {
    console.error("Mensagem salva, mas o provedor de e-mail recusou a notificação.", {
      messageId: savedMessage.id,
      status: emailResponse.status,
    });
    return NextResponse.json({ saved: true, emailSent: false }, { status: 202 });
  }
  return NextResponse.json({ saved: true, emailSent: true }, { status: 201 });
}
