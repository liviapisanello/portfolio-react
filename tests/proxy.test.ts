import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "../src/proxy";

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

describe("proteção da rota do painel", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("redireciona uma requisição sem sessão para autenticação", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-key");

    const response = await proxy(new NextRequest("http://localhost/dashboard"));
    const location = new URL(response.headers.get("location") || "http://localhost/");

    expect(response.status).toBe(307);
    expect(location.pathname).toBe("/dashboard/login");
    expect(location.searchParams.get("next")).toBe("/dashboard");
  });
});
