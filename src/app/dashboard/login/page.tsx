import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string | string[]; next?: string | string[] }>;
}) {
  const params = await searchParams;
  const setupMissing = params.setup === "supabase";
  return (
    <main className="section-wrap auth-page">
      <div className="auth-card">
        <p className="eyebrow">ÁREA RESTRITA</p>
        <h1>Entrar no painel.</h1>
        <p className="auth-intro">
          Acesse para organizar as mensagens recebidas e escolher os projetos em destaque.
        </p>
        {setupMissing && (
          <p className="form-status error" role="alert">
            O painel precisa ser conectado ao Supabase. Configure as variáveis de ambiente e siga os
            passos no README.
          </p>
        )}
        <LoginForm nextPath={typeof params.next === "string" ? params.next : "/dashboard"} />
        <Link href="/" className="back-link">
          Voltar ao portfólio
        </Link>
      </div>
    </main>
  );
}
