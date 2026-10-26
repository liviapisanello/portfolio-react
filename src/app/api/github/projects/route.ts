import { NextResponse } from "next/server";
import { getRepositories } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repositories = await getRepositories();
    return NextResponse.json(
      repositories.map(({ name, description, language }) => ({ name, description, language })),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Falha ao carregar repositórios do GitHub para o painel.", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os repositórios do GitHub." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
