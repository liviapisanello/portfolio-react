import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeaturedRepositoryNames } from "@/lib/github";

describe("preferências de projetos em destaque", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("busca a seleção salva sem usar cache", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://portfolio.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-key");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ value: ["codecam", "analytics"] }],
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getFeaturedRepositoryNames()).resolves.toEqual(["codecam", "analytics"]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/rest/v1/app_settings?key=eq.featured_repositories"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
