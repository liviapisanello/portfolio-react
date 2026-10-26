# Portfólio — Lívia Pisanello

Portfólio pessoal construído em React e Next.js. O conteúdo pessoal, a stack, os projetos e o currículo vieram da versão anterior; a identidade visual combina tons de rosa, composição assimétrica e uma trilha interativa de missões. A seção de projetos sincroniza com o GitHub e permite pesquisar, filtrar por linguagem e ordenar os repositórios.

## Tecnologias

- Next.js App Router, React 19 e TypeScript.
- CSS responsivo próprio com paleta rosa, tipografia baseada em fontes do sistema, Lucide React e imagens SVG locais.
- GitHub REST API como fonte dos projetos; os dados de repositório usam cache de uma hora para reduzir requisições repetidas, enquanto a preferência de destaques do Supabase é consultada sem cache para aplicar as mudanças na home.
- Busca por nome/descrição/tecnologia, filtro por linguagem, ordenação por atualização/estrelas/nome e escolha entre destaques e todos os repositórios.
- Zod para validação no formulário e no endpoint.
- Supabase Auth, Postgres e Row Level Security (RLS) para o dashboard e mensagens.
- Resend para notificação de novas mensagens por e-mail.
- Vitest, Testing Library, ESLint e TypeScript para verificação.
- Prettier e Husky/lint-staged para formatar e verificar arquivos staged antes do commit.

As tecnologias são apresentadas por área, sem barras ou percentuais de autoavaliação, para evitar transformar familiaridade subjetiva em uma métrica de competência.

## Decisões e concessões

| Decisão                       | Alternativas consideradas                 | Critério e concessão                                                                                                                                                            |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router            | Vite + React Router                       | Rotas diretas e endpoint de contato no mesmo deploy Vercel. Em troca, adota-se a convenção do framework e aumenta-se a configuração inicial.                                    |
| Supabase                      | Firebase, backend próprio                 | Auth, Postgres e RLS com pouca infraestrutura. O dashboard depende de configurar o serviço externo; as chaves privadas nunca vão ao navegador.                                  |
| GitHub REST + cache de 1 hora | Cadastro manual ou GraphQL                | Os dados do card refletem o repositório e não precisam de cadastro duplicado. A API pública tem limite de chamadas e pode ficar indisponível.                                   |
| CSS próprio e `localStorage`  | Biblioteca de UI/estado e serviço de tema | Menos dependências e personalização visual direta; há mais CSS a manter e o tema e o progresso das missões são salvos neste navegador.                                          |
| Resend                        | EmailJS ou servidor SMTP próprio          | A chave fica no servidor e a mesma submissão é salva no banco. A conta/domínio do provedor precisa ser configurada; falha do e-mail é informada sem descartar a mensagem salva. |

## Rodar localmente

Requisitos: Node.js 20.9+ e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Sem Supabase, a página pública ainda carrega os projetos do GitHub; contato e painel informam que sua configuração não está disponível.

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável                        | Uso                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`                  | Opcional. Token somente leitura para aumentar o limite da API do GitHub.                           |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL pública do projeto Supabase.                                                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase, protegida pelas políticas RLS.                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Acesso privilegiado usado apenas pelo endpoint de contato no servidor. Nunca exponha no navegador. |
| `RESEND_API_KEY`                | Credencial do Resend usada para enviar a notificação.                                              |
| `RESEND_FROM_EMAIL`             | Remetente verificado no Resend.                                                                    |
| `CONTACT_EMAIL`                 | Caixa de entrada da proprietária.                                                                  |

O `.gitignore` mantém os arquivos de ambiente locais fora do Git; apenas `.env.example` é versionado. Não preencha o exemplo com segredos.

### Supabase e formulário

Siga [`database/README.md`](./database/README.md): crie projeto e usuário de administração no Supabase, aplique [`database/schema.sql`](./database/schema.sql), desative cadastro público e registre o UUID da proprietária em `app_admins`. O endpoint valida novamente os dados, salva a mensagem e tenta notificar por Resend. O painel pode consultar/atualizar mensagens e escolher até seis repositórios em destaque. A página usa a lista inicial de destaques enquanto o Supabase ainda não está conectado.

O resumo do dashboard exibe contagens reais de projetos destacados, repositórios públicos, mensagens recebidas e mensagens pendentes. A preferência dos destaques é consultada sem cache; depois de salvar, use o link para abrir a home e conferir a seleção atualizada.

Se a persistência funcionar e a notificação falhar, o formulário informa o estado parcial; a mensagem permanece no dashboard. A service role do Supabase nunca é usada no cliente.

## Rotas e arquitetura

```text
src/
  proxy.ts                    valida sessão antes das rotas do painel
  app/
    page.tsx                  home e projetos em destaque
    projetos/[name]/          detalhe de cada repositório
    api/contact/               validação, persistência e notificação
    api/github/projects/       lista pública usada pelo painel
    dashboard/                 login e área da proprietária
  components/                  navegação, exploração de projetos, cards, formulário e dashboard
  lib/                         API GitHub, validação, auth e Supabase
database/                      schema e políticas RLS
tests/                         validação do contato e proteção de acesso
.github/copilot-instructions.md padrões para IA e desenvolvimento
```

As rotas de projeto usam o nome do repositório e aceitam acesso direto/refresh. Uma rota desconhecida mostra 404; falhas do GitHub têm estado de erro; listas sem dados têm mensagem vazia. O proxy redireciona visitantes sem sessão ao login, e o banco limita mensagens/configurações à conta listada em `app_admins`.

## Testes e qualidade

```bash
npm test
npm run lint
npm run format:check
npm run typecheck
npm run build
```

Os testes automatizados cobrem validação do formulário, redirecionamento de visitante sem sessão e busca/filtros da lista de projetos. O hook pre-commit executa Prettier e ESLint nos arquivos staged. O GitHub Actions também executa lint, formatação, testes, typecheck e build em push/pull request para `main`.

## Branches e commits

- Estratégia: GitHub Flow. Cada funcionalidade começa em `feature/<nome>`, correção em `fix/<nome>` e documentação em `docs/<nome>`.
- Integre pela branch principal usando pull request; não desenvolva diretamente em `main`.
- Commits seguem Conventional Commits: `feat: adiciona detalhes dos projetos`, `fix: trata falha de notificação`, `docs: explica configuração do Supabase`.
- Antes do pull request, execute os quatro comandos da seção de testes. A instrução da IA está versionada em `.github/copilot-instructions.md`.

## Harness de IA

As instruções em `.github/copilot-instructions.md` documentam escopo, arquitetura, nomenclatura, proteção de segredos, testes, branches e commits. Elas orientam o Copilot no VS Code, mas não substituem lint, typecheck, testes ou revisão humana. Não há agente customizado, skills externas ou MCP configurado neste repositório: as integrações da aplicação são feitas por serviços internos tipados e essa simplicidade evita dependências de harness não necessárias ao escopo. No vídeo, informe o modelo realmente usado na sessão, sem presumir nem inventar configuração.

O roteiro com a narrativa de stack, trade-offs, harness e deploy está em [`docs/roteiro-entrevista.md`](./docs/roteiro-entrevista.md).

## Publicação e itens que exigem contas externas

O app está preparado para deploy na Vercel. Conecte o repositório GitHub, configure as variáveis de ambiente acima no projeto Vercel e publique a branch principal; pushes subsequentes nessa branch disparam deploy automático. Faça um teste manual com as URLs diretas de projetos/dashboard e formulário após configurar Supabase/Resend.

**Ainda precisam ser concluídos pela proprietária:** publicar o repositório no GitHub, conectar as contas e variáveis da Vercel/Supabase/Resend, verificar a nota Lighthouse mobile e gravar/publicar o vídeo não listado no YouTube. Esses passos requerem acesso e credenciais pessoais que não estão neste workspace; nenhuma URL ou resultado foi inventado.
