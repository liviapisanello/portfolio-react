export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
  topics: string[];
  homepage: string | null;
  fork: boolean;
  private: boolean;
};

const GITHUB_USERNAME = "liviapisanello";
const apiHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function checkedJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: apiHeaders, next: { revalidate: 3600 } });
  if (!response.ok) {
    const reason =
      response.status === 403 || response.status === 429
        ? "A API do GitHub atingiu o limite de requisições."
        : `A API do GitHub respondeu com status ${response.status}.`;
    throw new Error(reason);
  }
  return response.json() as Promise<T>;
}

export async function getRepositories(): Promise<GitHubRepository[]> {
  const repositories = await checkedJson<GitHubRepository[]>(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`,
  );
  return repositories
    .filter((repository) => !repository.fork && !repository.private)
    .sort((first, second) => Date.parse(second.updated_at) - Date.parse(first.updated_at));
}

export async function getRepository(name: string): Promise<GitHubRepository | null> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(name)}`,
    {
      headers: apiHeaders,
      next: { revalidate: 3600 },
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      response.status === 403 || response.status === 429
        ? "A API do GitHub atingiu o limite de requisições."
        : `A API do GitHub respondeu com status ${response.status}.`,
    );
  }
  const repository = (await response.json()) as GitHubRepository;
  return repository.private || repository.fork ? null : repository;
}

export async function getFeaturedRepositoryNames(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return ["analytics", "codecam", "AssessorAI"];
  }

  const response = await fetch(
    `${url}/rest/v1/app_settings?key=eq.featured_repositories&select=value`,
    {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar os destaques do painel (status ${response.status}).`,
    );
  }
  const rows = (await response.json()) as Array<{ value: unknown }>;
  if (rows.length === 0 || !Array.isArray(rows[0].value)) return [];
  return rows[0].value.filter((value): value is string => typeof value === "string");
}
