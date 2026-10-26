import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import type { GitHubRepository } from "@/lib/github";
import { getProjectImage } from "@/lib/portfolio-projects";

export function ProjectCard({ project }: { project: GitHubRepository }) {
  const image = getProjectImage(project.name);
  return (
    <article className="project-card">
      <Link
        className="project-image"
        href={`/projetos/${encodeURIComponent(project.name)}`}
        aria-label={`Ver detalhes de ${project.name}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={640}
          height={400}
          loading="lazy"
          sizes="(max-width: 720px) 100vw, (max-width: 1050px) 50vw, 33vw"
        />
        <span className="project-category">{image.label}</span>
      </Link>
      <div className="project-content">
        <div className="project-meta">
          <span>{project.language || "Projeto"}</span>
          <span>
            Atualizado em{" "}
            {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
              new Date(project.updated_at),
            )}
          </span>
        </div>
        <h3>
          <Link href={`/projetos/${encodeURIComponent(project.name)}`}>{project.name}</Link>
        </h3>
        <p>
          {project.description || "Ainda não adicionei uma descrição a este repositório no GitHub."}
        </p>
        {project.topics.length > 0 && (
          <div className="project-tags">
            {project.topics.slice(0, 3).map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        )}
        <div className="project-actions">
          <Link href={`/projetos/${encodeURIComponent(project.name)}`} className="text-link">
            Detalhes <ArrowUpRight size={15} />
          </Link>
          <a href={project.html_url} target="_blank" rel="noreferrer" className="text-link">
            <Code2 size={15} /> Código
          </a>
        </div>
      </div>
    </article>
  );
}
