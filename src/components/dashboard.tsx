"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Code2, Inbox, LogOut, Save, Star } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  responded_at: string | null;
};
type Repository = { name: string; description: string | null; language: string | null };
type DashboardState = "loading" | "ready" | "error" | "forbidden";

function sameRepositoryName(first: string, second: string) {
  return first.toLocaleLowerCase("en-US") === second.toLocaleLowerCase("en-US");
}

async function getDashboardData() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const { data: admin, error: adminError } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError) throw adminError;
  if (!admin) return { admin: false as const };

  const [
    { data: messages, error: messageError },
    { data: settings, error: settingsError },
    repoResponse,
  ] = await Promise.all([
    supabase
      .from("messages")
      .select("id,name,email,subject,message,created_at,responded_at")
      .order("created_at", { ascending: false }),
    supabase.from("app_settings").select("value").eq("key", "featured_repositories").maybeSingle(),
    fetch("/api/github/projects", { cache: "no-store" }),
  ]);
  if (messageError) throw messageError;
  if (settingsError) throw settingsError;
  if (!repoResponse.ok)
    throw new Error("Não foi possível carregar a lista de repositórios do GitHub.");

  return {
    admin: true as const,
    messages: (messages || []) as Message[],
    repositories: (await repoResponse.json()) as Repository[],
    featured: Array.isArray(settings?.value)
      ? settings.value.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function Dashboard() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [featured, setFeatured] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getDashboardData()
      .then((data) => {
        if (!active) return;
        if (!data) {
          router.replace("/dashboard/login?next=%2Fdashboard");
        } else if (!data.admin) {
          setState("forbidden");
        } else {
          setMessages(data.messages);
          setRepositories(data.repositories);
          setFeatured(data.featured);
          setState("ready");
        }
      })
      .catch((cause: unknown) => {
        console.error("Falha ao carregar o dashboard.", cause);
        if (!active) return;
        setError(
          cause instanceof Error ? cause.message : "Falha desconhecida ao carregar o painel.",
        );
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [router, reloadKey]);

  async function toggleResponded(message: Message) {
    try {
      const supabase = createSupabaseBrowserClient();
      const respondedAt = message.responded_at ? null : new Date().toISOString();
      const { error: updateError } = await supabase
        .from("messages")
        .update({ responded_at: respondedAt })
        .eq("id", message.id);
      if (updateError) throw updateError;
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, responded_at: respondedAt } : item,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a mensagem.");
    }
  }

  async function saveFeatured() {
    setIsSaving(true);
    setError("");
    setSaved(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("app_settings")
        .upsert({ key: "featured_repositories", value: featured }, { onConflict: "key" });
      if (updateError) throw updateError;
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar os destaques.");
    } finally {
      setIsSaving(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    router.replace("/dashboard/login");
    router.refresh();
  }

  if (state === "loading")
    return <p className="loading-label">Carregando painel e verificando acesso...</p>;
  if (state === "forbidden")
    return (
      <div className="dashboard-message">
        <p className="eyebrow">ACESSO RESTRITO</p>
        <h1>Esta conta não é administradora.</h1>
        <p>
          Autentique-se com a conta cadastrada na tabela <code>app_admins</code> do Supabase.
        </p>
        <button className="button button-outline" onClick={signOut}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    );
  if (state === "error")
    return (
      <div className="dashboard-message">
        <p className="eyebrow">ERRO NO PAINEL</p>
        <h1>Não foi possível carregar os dados.</h1>
        <p>{error}</p>
        <button
          className="button button-primary"
          onClick={() => {
            setState("loading");
            setReloadKey((current) => current + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );

  const unansweredCount = messages.filter((message) => !message.responded_at).length;
  const visibleFeaturedCount = repositories.filter((repository) =>
    featured.some((name) => sameRepositoryName(name, repository.name)),
  ).length;

  return (
    <div className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">ÁREA DA DONA</p>
          <h1>Seu painel.</h1>
          <p>Mensagens recebidas e repositórios em destaque.</p>
        </div>
        <button className="button button-outline" onClick={signOut}>
          <LogOut size={16} /> Sair
        </button>
      </div>
      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}
      <section className="dashboard-stats" aria-label="Resumo do portfólio">
        <article className="dashboard-stat dashboard-stat-featured">
          <span>
            <Star size={14} /> NA VITRINE
          </span>
          <strong>{visibleFeaturedCount.toString().padStart(2, "0")}</strong>
          <small>projetos selecionados</small>
        </article>
        <article className="dashboard-stat">
          <span>
            <Code2 size={14} /> REPOSITÓRIOS
          </span>
          <strong>{repositories.length.toString().padStart(2, "0")}</strong>
          <small>projetos públicos encontrados</small>
        </article>
        <article className="dashboard-stat">
          <span>
            <Inbox size={14} /> CAIXA DE ENTRADA
          </span>
          <strong>{messages.length.toString().padStart(2, "0")}</strong>
          <small>mensagens recebidas</small>
        </article>
        <article className="dashboard-stat dashboard-stat-pending">
          <span>
            <Inbox size={14} /> EM ABERTO
          </span>
          <strong>{unansweredCount.toString().padStart(2, "0")}</strong>
          <small>mensagens para responder</small>
        </article>
      </section>
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">PÁGINA INICIAL</p>
            <h2>Projetos em destaque</h2>
          </div>
          <button
            className="button button-primary"
            onClick={() => void saveFeatured()}
            disabled={isSaving}
          >
            <Save size={16} /> {isSaving ? "Salvando..." : "Salvar seleção"}
          </button>
        </div>
        <p className="section-lede">
          Selecione até 6 repositórios públicos que serão exibidos na página inicial.
        </p>
        {saved && (
          <div className="form-status success dashboard-save-status" role="status">
            <Check size={16} /> Destaques salvos.
            <Link href="/#projetos" prefetch={false}>
              Conferir na página inicial
            </Link>
          </div>
        )}
        {repositories.length === 0 ? (
          <p className="empty-inline">Nenhum repositório público retornado pela API.</p>
        ) : (
          <div className="repository-picker">
            {repositories.map((repository) => (
              <label className="repository-option" key={repository.name}>
                <input
                  type="checkbox"
                  checked={featured.some((name) => sameRepositoryName(name, repository.name))}
                  onChange={() => {
                    setSaved(false);
                    setFeatured((current) =>
                      current.some((name) => sameRepositoryName(name, repository.name))
                        ? current.filter((name) => !sameRepositoryName(name, repository.name))
                        : current.length < 6
                          ? [...current, repository.name]
                          : current,
                    );
                  }}
                />
                <span>
                  <strong>{repository.name}</strong>
                  <small>
                    {repository.description || repository.language || "Repositório público"}
                  </small>
                </span>
                <Star size={16} />
              </label>
            ))}
          </div>
        )}
      </section>
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">CAIXA DE ENTRADA</p>
            <h2>
              Mensagens recebidas <span className="count-badge">{messages.length}</span>
            </h2>
          </div>
        </div>
        {messages.length === 0 ? (
          <p className="empty-inline">
            Ainda não há mensagens. Quando alguém enviar uma pelo site, ela aparecerá aqui.
          </p>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <article
                className={`message-card${message.responded_at ? " is-responded" : ""}`}
                key={message.id}
              >
                <div className="message-card-heading">
                  <div>
                    <h3>{message.subject}</h3>
                    <p>
                      {message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>
                    </p>
                  </div>
                  <button
                    className="responded-button"
                    type="button"
                    onClick={() => void toggleResponded(message)}
                    aria-pressed={Boolean(message.responded_at)}
                  >
                    {message.responded_at ? (
                      <>
                        <Check size={15} /> Respondida
                      </>
                    ) : (
                      "Marcar respondida"
                    )}
                  </button>
                </div>
                <p className="message-body">{message.message}</p>
                <time dateTime={message.created_at}>
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(message.created_at))}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
