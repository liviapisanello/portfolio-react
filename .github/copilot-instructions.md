# Instruções do projeto para Copilot

## Escopo

- Este é o portfólio de Lívia Pisanello em Next.js App Router, React e TypeScript.
- Responda em português brasileiro quando a solicitação estiver em português.
- Preserve os fatos pessoais e links que já estão no site; nunca invente experiências, métricas, credenciais, deploy ou resultados.
- Evite rótulos artificiais de dashboard, numeração decorativa de seções, frases genéricas de portfólio e percentuais de competência sem necessidade; prefira a voz pessoal e editorial existente.
- Não exponha chaves. Use `.env.example` como referência e mantenha `.env*` local fora do Git, exceto `.env.example`.

## Arquitetura e convenções

- `src/app/`: rotas e layouts do App Router; páginas devem compor componentes e serviços.
- `src/components/`: componentes de interface; use PascalCase para componentes e nomes descritivos.
- `src/lib/`: acesso a APIs, validação e regras reutilizáveis; hooks começam com `use`.
- `database/`: schema SQL e políticas RLS do Supabase.
- Prefira Server Components; use `"use client"` apenas quando houver interação, estado ou APIs do navegador.
- Use TypeScript estrito, HTML semântico, acessibilidade por teclado e mensagens explícitas para loading, erro e vazio.
- Compartilhe regras de validação entre interface e endpoint. Não silencie erros de API nem substitua falhas por dados de demonstração.
- Mantenha dados dos repositórios vindos da API oficial do GitHub; não crie projetos falsos.

## Fluxo de trabalho

- Use GitHub Flow: uma branch `feature/...`, `fix/...` ou `docs/...` por mudança; integre à branch principal por pull request.
- Escreva commits em Conventional Commits, por exemplo `feat: adiciona painel de mensagens`.
- Antes de concluir, rode `npm test`, `npm run lint` e `npm run build`; corrija problemas introduzidos.
- Para alterações em contato, auth, Supabase ou RLS, revise conjuntamente endpoint, schema e estados de interface.
- Não execute migrações destrutivas nem publique/commite sem solicitação explícita.

## Decisões

- Next.js foi escolhido para rotas diretas, páginas de servidor e endpoints no mesmo deploy Vercel; uma SPA Vite teria mais configuração de API e fallback de rotas.
- Supabase fornece autenticação, Postgres e RLS sem manter um servidor próprio; a dependência é configuração externa e o painel fica indisponível sem ela.
- GitHub REST é a fonte dos projetos e tem cache de uma hora; se o limite da API falhar, mostre o erro em vez de inventar conteúdo.
- Resend envia notificações. Se o envio falhar após salvar, informe que a mensagem foi persistida e que a notificação falhou.
