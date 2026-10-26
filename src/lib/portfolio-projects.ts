import type { GitHubRepository } from "@/lib/github";

const projectImages: Record<string, { src: string; alt: string; label: string }> = {
  analytics: {
    src: "/assets/img/project-1.svg",
    alt: "Ilustração de um painel analítico com gráficos",
    label: "Análise de dados",
  },
  codecam: {
    src: "/assets/img/project-2.svg",
    alt: "Ilustração de uma interface de estudos",
    label: "Educação",
  },
  assessorai: {
    src: "/assets/img/project-3.svg",
    alt: "Ilustração de uma conversa com assistente digital",
    label: "Inteligência artificial",
  },
};

export function getProjectImage(name: string) {
  return (
    projectImages[name.toLowerCase()] ?? {
      src: "/assets/img/project-1.svg",
      alt: `Ilustração abstrata para o projeto ${name}`,
      label: "Projeto",
    }
  );
}

export function getPortfolioProjects(repositories: GitHubRepository[]) {
  return repositories.map((repository) => ({
    ...repository,
    description: repository.description || getProjectContext(repository.name),
  }));
}

export function getProjectContext(name: string): string | null {
  const context: Record<string, string> = {
    analytics:
      "Análise exploratória e modelo de machine learning para identificar potenciais clientes do aplicativo InDespensa, com métricas e visualizações dos resultados.",
    codecam:
      "Plataforma mobile-first que transforma fotos de materiais em resumos, tópicos e flashcards, com acessibilidade no centro da experiência.",
    assessorai:
      "Assistente conversacional que encaminha pedidos a especialistas em finanças, agenda e FAQ com busca em uma base de documentos.",
  };
  return context[name.toLowerCase()] ?? null;
}
