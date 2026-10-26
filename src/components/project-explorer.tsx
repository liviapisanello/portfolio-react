"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { GitHubRepository } from "@/lib/github";
import { ProjectCard } from "@/components/project-card";

type ProjectExplorerProps = {
  featured: GitHubRepository[];
  repositories: GitHubRepository[];
};

export function ProjectExplorer({ featured, repositories }: ProjectExplorerProps) {
  const [showAll, setShowAll] = useState(featured.length === 0);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("Todas");
  const [sortBy, setSortBy] = useState("recent");

  const languages = useMemo(
    () =>
      [
        ...new Set(
          repositories
            .map((repository) => repository.language)
            .filter((item): item is string => item !== null),
        ),
      ].sort((first, second) => first.localeCompare(second)),
    [repositories],
  );

  const visibleProjects = useMemo(() => {
    if (!showAll) return featured;
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return repositories
      .filter((repository) => language === "Todas" || repository.language === language)
      .filter(
        (repository) =>
          !normalizedQuery ||
          repository.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
          repository.description?.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
          repository.topics.some((topic) =>
            topic.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
          ),
      )
      .sort((first, second) => {
        if (sortBy === "stars") return second.stargazers_count - first.stargazers_count;
        if (sortBy === "name") return first.name.localeCompare(second.name, "pt-BR");
        return Date.parse(second.updated_at) - Date.parse(first.updated_at);
      });
  }, [featured, language, query, repositories, showAll, sortBy]);

  return (
    <div className="project-explorer">
      {showAll && (
        <div className="project-filters" aria-label="Filtros de projetos">
          <label className="project-search">
            <Search size={17} aria-hidden="true" />
            <span className="visually-hidden">Buscar nos projetos</span>
            <input
              type="search"
              placeholder="Buscar por nome, descrição ou tecnologia"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca">
                <X size={16} />
              </button>
            )}
          </label>
          <label className="project-filter-select">
            <span>Linguagem</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option>Todas</option>
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="project-filter-select">
            <span>Ordenar por</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recent">Mais recentes</option>
              <option value="stars">Mais estrelas</option>
              <option value="name">Nome (A–Z)</option>
            </select>
          </label>
        </div>
      )}
      <p className="project-result-count" aria-live="polite">
        {showAll
          ? `${visibleProjects.length} de ${repositories.length} repositórios`
          : `${featured.length} projetos em destaque`}
      </p>
      {visibleProjects.length > 0 ? (
        <div className="projects-grid">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search aria-hidden="true" />
          <h3>Nenhum projeto encontrado</h3>
          <p>Tente outro termo ou remova o filtro de linguagem.</p>
          <button
            className="text-link"
            type="button"
            onClick={() => {
              setQuery("");
              setLanguage("Todas");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      {repositories.length > featured.length && (
        <button
          className="show-all-projects"
          type="button"
          aria-expanded={showAll}
          onClick={() => {
            setShowAll((current) => !current);
            setQuery("");
            setLanguage("Todas");
          }}
        >
          {showAll
            ? "Mostrar só os destaques"
            : `Explorar todos os ${repositories.length} repositórios`}
        </button>
      )}
    </div>
  );
}
