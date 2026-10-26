import { describe, expect, it } from "vitest";
import { dashboardRedirect } from "@/lib/auth-guard";

describe("proteção do dashboard", () => {
  it("redireciona visitante sem sessão para login preservando o destino", () => {
    expect(dashboardRedirect(false, "/dashboard")).toBe("/dashboard/login?next=%2Fdashboard");
  });

  it("não redireciona uma sessão autenticada", () => {
    expect(dashboardRedirect(true)).toBeNull();
  });

  it("não permite um destino de retorno externo", () => {
    expect(dashboardRedirect(false, "//example.com")).toBe("/dashboard/login?next=%2Fdashboard");
  });
});
