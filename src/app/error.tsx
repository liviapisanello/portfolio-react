"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => console.error("Erro não tratado na página.", error), [error]);
  return (
    <main className="section-wrap service-error">
      <p className="eyebrow">ERRO INESPERADO</p>
      <h1>Algo deu errado.</h1>
      <p>Ocorreu uma falha ao abrir esta página. Tente novamente.</p>
      <button className="button button-primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
