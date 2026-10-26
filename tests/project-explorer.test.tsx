import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GitHubRepository } from "@/lib/github";
import { ProjectExplorer } from "@/components/project-explorer";

const repositories: GitHubRepository[] = [
  {
    id: 1,
    name: "codecam",
    full_name: "liviapisanello/codecam",
    html_url: "https://github.com/liviapisanello/codecam",
    description: "Ferramenta de estudos com flashcards",
    language: "TypeScript",
    updated_at: "2026-01-02T00:00:00Z",
    stargazers_count: 2,
    topics: ["educacao"],
    homepage: null,
    fork: false,
    private: false,
  },
  {
    id: 2,
    name: "analytics",
    full_name: "liviapisanello/analytics",
    html_url: "https://github.com/liviapisanello/analytics",
    description: "Análise de dados com Python",
    language: "Python",
    updated_at: "2026-01-01T00:00:00Z",
    stargazers_count: 5,
    topics: ["dados"],
    homepage: null,
    fork: false,
    private: false,
  },
];

describe("exploração de projetos", () => {
  it("busca projetos por tecnologia e atualiza a lista", () => {
    render(<ProjectExplorer featured={repositories.slice(0, 1)} repositories={repositories} />);
    fireEvent.click(screen.getByRole("button", { name: /explorar todos/i }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar nos projetos" }), {
      target: { value: "Python" },
    });

    expect(screen.getByRole("heading", { name: "analytics" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "codecam" })).not.toBeInTheDocument();
    expect(screen.getByText("1 de 2 repositórios")).toBeInTheDocument();
  });

  it("filtra por linguagem e apresenta uma forma de limpar filtros vazios", () => {
    render(<ProjectExplorer featured={repositories.slice(0, 1)} repositories={repositories} />);
    fireEvent.click(screen.getByRole("button", { name: /explorar todos/i }));
    fireEvent.change(screen.getByLabelText("Linguagem"), { target: { value: "Java" } });

    const emptyState = screen.getByRole("heading", {
      name: "Nenhum projeto encontrado",
    }).parentElement;
    expect(emptyState).not.toBeNull();
    fireEvent.click(within(emptyState!).getByRole("button", { name: "Limpar filtros" }));

    expect(screen.getByRole("heading", { name: "codecam" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "analytics" })).toBeInTheDocument();
  });
});
