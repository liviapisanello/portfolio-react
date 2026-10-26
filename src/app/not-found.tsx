import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="section-wrap detail-page">
      <p className="eyebrow">404 / ROTA NÃO ENCONTRADA</p>
      <h1>Você chegou a uma tela fora do mapa.</h1>
      <p>O endereço pode ter mudado. Vamos voltar para um lugar conhecido.</p>
      <Link className="button button-primary" href="/">
        <ArrowLeft size={16} /> Ir para o início
      </Link>
    </main>
  );
}
