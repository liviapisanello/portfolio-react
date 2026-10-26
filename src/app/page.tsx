import Link from "next/link";
import { connection } from "next/server";
import { ArrowDown, ArrowUpRight, Code2, ExternalLink, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { ProjectExplorer } from "@/components/project-explorer";
import { QuestLog } from "@/components/quest-log";
import { getFeaturedRepositoryNames, getRepositories } from "@/lib/github";
import { getPortfolioProjects } from "@/lib/portfolio-projects";

async function loadHomeData() {
  try {
    const [repositories, featuredNames] = await Promise.all([
      getRepositories(),
      getFeaturedRepositoryNames(),
    ]);
    const projects = getPortfolioProjects(repositories);
    const featured = projects.filter((project) =>
      featuredNames.some(
        (name) => name.toLocaleLowerCase("en-US") === project.name.toLocaleLowerCase("en-US"),
      ),
    );
    return {
      repositories: projects,
      featured,
      hasError: false,
    };
  } catch (error) {
    console.error("Falha ao carregar os projetos do portfólio.", error);
    return { repositories: [], featured: [], hasError: true };
  }
}

export default async function HomePage() {
  await connection();
  const { repositories, featured, hasError } = await loadHomeData();
  if (hasError) {
    return (
      <main className="section-wrap service-error" id="inicio">
        <p className="eyebrow">FALHA AO CARREGAR</p>
        <h1>Não consegui buscar os projetos agora.</h1>
        <p>
          A API do GitHub ou as configurações de destaques podem estar indisponíveis. Tente
          novamente em instantes.
        </p>
        <Link className="button button-primary" href="/">
          Tentar novamente
        </Link>
      </main>
    );
  }

  return (
    <>
      <section className="hero section-wrap" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="hero-status-dot" /> PORTFÓLIO INTERATIVO · APERTE START
          </p>
          <h1>
            Oi, eu sou
            <br />
            <span>Lívia.</span>
          </h1>
          <p className="hero-description">
            Desenvolvedora full stack e estudante de Engenharia de Software. Gosto de entender
            problemas, conversar sobre ideias e transformá-las em produtos digitais.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projetos">
              <span className="start-prompt">START</span> Explorar projetos <ArrowDown size={17} />
            </a>
            <a className="button button-outline" href="#contato">
              Vamos conversar <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="social-row" aria-label="Links profissionais">
            <a href="https://github.com/liviapisanello" target="_blank" rel="noreferrer">
              <Code2 size={17} /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/l%C3%ADvia-laur-pisanello-204693296/"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} /> LinkedIn
            </a>
            <a href="mailto:livia.laur26@gmail.com">
              <Mail size={16} /> E-mail
            </a>
          </div>
        </div>
        <QuestLog />
        <a
          className="resume-link"
          href="/assets/docs/curriculo-livia-laur-pisanello.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Abrir currículo <ArrowUpRight size={15} />
        </a>
      </section>

      <section
        className="section-wrap section-block about-section"
        id="sobre"
        data-quest-id="sobre"
      >
        <div>
          <p className="eyebrow">FASE 01 · QUEM SOU</p>
          <h2 className="section-title">Aprender fazendo, sempre.</h2>
        </div>
        <div className="about-copy">
          <p>
            Sou desenvolvedora full stack e estudante de Engenharia de Software. Gosto de explorar
            diferentes partes de um produto — da interface às regras de negócio e aos dados — sempre
            pensando em quem vai usar.
          </p>
          <p>
            Comunicação, aprendizado contínuo e atenção aos detalhes fazem parte do meu jeito de
            trabalhar. Quero construir soluções que sejam tão cuidadosas por dentro quanto claras
            por fora.
          </p>
        </div>
      </section>

      <section className="section-block skills-section" id="skills" data-quest-id="skills">
        <div className="section-wrap">
          <p className="eyebrow">FASE 02 · HABILIDADES</p>
          <h2 className="section-title">Ferramentas da jornada.</h2>
          <p className="section-lede">
            Tecnologias que venho aplicando em projetos e aprofundando ao longo da minha formação.
          </p>
          <div className="skills-grid">
            {[
              ["TypeScript", "Linguagens"],
              ["JavaScript", "Linguagens"],
              ["Python", "Linguagens"],
              ["Java", "Linguagens"],
              ["React", "Interface"],
              ["Next.js", "Interface"],
              ["Node.js", "Backend"],
              ["NestJS", "Backend"],
              ["SQL", "Dados"],
              ["Prisma ORM", "Dados"],
              ["MongoDB", "Dados"],
            ].map(([skill, category]) => (
              <div className="skill-item" key={skill}>
                <div className="skill-heading">
                  <span>
                    <Code2 size={16} /> {skill}
                  </span>
                </div>
                <small>{category}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap section-block" id="projetos" data-quest-id="projetos">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">FASE 03 · PROJETOS</p>
            <h2 className="section-title">Projetos que saíram do papel.</h2>
            <p className="section-lede">
              Projetos e informações sincronizados com meus repositórios públicos no GitHub.
            </p>
          </div>
          <a
            className="text-link"
            href="https://github.com/liviapisanello?tab=repositories"
            target="_blank"
            rel="noreferrer"
          >
            Todos os repositórios <ArrowUpRight size={16} />
          </a>
        </div>
        {repositories.length > 0 ? (
          <ProjectExplorer featured={featured} repositories={repositories} />
        ) : (
          <div className="empty-state">
            <Code2 />
            <h3>Nenhum projeto em destaque ainda</h3>
            <p>Entre no painel para escolher quais repositórios aparecem aqui.</p>
            <Link href="/dashboard/login">
              Acessar painel <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </section>

      <section className="contact-section" id="contato" data-quest-id="contato">
        <div className="section-wrap contact-layout">
          <div className="contact-copy">
            <p className="eyebrow">FASE FINAL · SUA VEZ</p>
            <h2 className="section-title">Próxima missão: conversar.</h2>
            <p className="section-lede">
              Estou aberta a aprender, trocar ideias e explorar oportunidades em tecnologia. Me
              chama para conversar sobre produto, código e próximos passos.
            </p>
            <a className="contact-email" href="mailto:livia.laur26@gmail.com">
              <Mail size={18} /> livia.laur26@gmail.com
            </a>
            <p className="location-line">
              <MapPin size={15} /> Brasil · disponível para conexões remotas
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      <footer className="site-footer section-wrap">
        <span>© {new Date().getFullYear()} Lívia Pisanello</span>
        <span>Feito com curiosidade e React.</span>
        <Link href="/dashboard/login">Área da dona do portfólio</Link>
      </footer>
    </>
  );
}
