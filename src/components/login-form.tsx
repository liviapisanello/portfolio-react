"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;
    setError("");
    setIsSending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Não foi possível entrar. Confira as credenciais e tente novamente.");
        return;
      }
      const destination =
        nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível conectar ao serviço de autenticação.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="contact-form login-form" onSubmit={handleSubmit}>
      <label>
        E-mail
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Senha
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button-primary submit-button" disabled={isSending}>
        {isSending ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
