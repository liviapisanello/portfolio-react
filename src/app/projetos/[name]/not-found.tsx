import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <main className="section-wrap detail-page">
      <p className="eyebrow">404 / PROJETO NÃO ENCONTRADO</p>
      <h1>Esse repositório não está disponível.</h1>
      <p>Confira o endereço ou volte para a lista de projetos públicos.</p>
      <Link href="/#projetos" className="button button-primary">
        <ArrowLeft size={16} /> Voltar ao portfólio
      </Link>
    </main>
  );
}
