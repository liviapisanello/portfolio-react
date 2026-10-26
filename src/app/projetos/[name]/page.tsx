import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Code2, Star } from "lucide-react";
import { getRepository } from "@/lib/github";
import { getProjectContext } from "@/lib/portfolio-projects";

export default async function ProjectPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const result = await loadProject(name);
  if (result.error) {
    return (
      <main className="section-wrap detail-page">
        <p className="eyebrow">FALHA DE CONEXÃO</p>
        <h1>Este projeto não carregou.</h1>
        <p>
          A API do GitHub está indisponível ou atingiu o limite de requisições. Tente novamente mais
          tarde.
        </p>
        <Link className="button button-outline" href="/#projetos">
          <ArrowLeft size={16} /> Voltar aos projetos
        </Link>
      </main>
    );
  }
  const project = result.project;
  if (!project) notFound();

  const updated = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    new Date(project.updated_at),
  );
  return (
    <main className="section-wrap detail-page">
      <Link href="/#projetos" className="back-link">
        <ArrowLeft size={16} /> Voltar aos projetos
      </Link>
      <p className="eyebrow">REPOSITÓRIO PÚBLICO · GITHUB</p>
      <h1>{project.name}</h1>
      <p className="detail-lede">
        {project.description ||
          getProjectContext(project.name) ||
          "Acesse o repositório para ver o código e as informações disponíveis."}
      </p>
      {getProjectContext(project.name) && (
        <p className="detail-context">{getProjectContext(project.name)}</p>
      )}
      <dl className="detail-facts">
        <div>
          <dt>Linguagem principal</dt>
          <dd>{project.language || "Não especificada"}</dd>
        </div>
        <div>
          <dt>Última atualização</dt>
          <dd>{updated}</dd>
        </div>
        <div>
          <dt>Estrelas</dt>
          <dd>
            <Star size={16} /> {project.stargazers_count}
          </dd>
        </div>
      </dl>
      {project.topics.length > 0 && (
        <div className="project-tags detail-tags">
          {project.topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
      )}
      <div className="hero-actions">
        <a
          href={project.html_url}
          target="_blank"
          rel="noreferrer"
          className="button button-primary"
        >
          <Code2 size={17} /> Abrir repositório <ArrowUpRight size={16} />
        </a>
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noreferrer"
            className="button button-outline"
          >
            Ver demonstração <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </main>
  );
}

async function loadProject(name: string) {
  try {
    return { project: await getRepository(name), error: false };
  } catch (error) {
    console.error(`Falha ao carregar o projeto ${name} do GitHub.`, error);
    return { project: null, error: true };
  }
}
