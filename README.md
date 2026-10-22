# Loja de Cosméticos

E-commerce de cosméticos com front em Next.js e API em NestJS sobre Supabase, com catálogo, carrinho, checkout com validação de estoque, rastreio de entrega, área do cliente e painel administrativo.

> **Projeto de portfólio.** A loja é uma demonstração e nenhum produto é vendido.

**[Ver site no ar](https://v0-site-cosmeticos-natura.vercel.app)**

## Funcionalidades

- Catálogo com filtros e página de produto com carrossel de imagens
- Cadastro e login com Supabase Auth
- Carrinho persistente (mantido ao recarregar a página)
- Checkout que valida o estoque de cada item, calcula o preço no servidor e dá baixa no estoque numa única transação
- Rastreio de entrega: o cliente acompanha a linha do tempo do pedido e a consultora define cada etapa
- Área "Meus pedidos" com o detalhe de cada compra
- Painel administrativo protegido: cadastro e edição de produtos, gestão de pedidos e etapas de entrega, configurações da loja

## Tecnologias

- Next.js (App Router), React e TypeScript
- NestJS (API REST) com class-validator
- Supabase (PostgreSQL, autenticação e Storage)
- Tailwind CSS e shadcn/ui
- Zustand (estado do carrinho)
- React Hook Form e Zod (formulários e validação)
- Jest (testes da API)
- Deploy na Vercel (front) e em host Node (API)

## Arquitetura

Monorepo com npm workspaces:

```
apps/
  web/      Front-end Next.js (páginas, carrinho, painel admin)
  api/      Back-end NestJS — única camada que acessa o banco
packages/
  shared/   Tipos e etapas de pedido usados pelos dois apps
scripts/    SQL do banco (rodar no Supabase, em ordem)
```

```
Navegador ──► apps/web (Next.js) ──HTTP + JWT──► apps/api (NestJS) ──service_role──► Supabase (Postgres + Storage)
     └──────────── login/cadastro/sessão ─────────────────────────────────────────────► Supabase Auth
```

## Destaques técnicos

- **Front e back separados:** o front usa o Supabase só para autenticação; todo dado passa pela API, que valida o JWT (`Authorization: Bearer <token>`) e aplica as regras de acesso
- **Admin seguro:** definido por `app_metadata.is_admin`, que o próprio usuário não consegue alterar
- **RLS ativo em todas as tabelas**, sem políticas para a chave pública: só a API acessa os dados
- **Checkout transacional** (`place_order` em PL/pgSQL): preço vindo do banco, estoque travado e baixado na mesma transação
- **Histórico de etapas** (`order_status_history`) com observação para o cliente; cancelar devolve o estoque
- **Middleware do Next.js** que renova a sessão e bloqueia `/admin` para quem não é administrador
- **Scripts SQL versionados** (`scripts/`) e testes unitários na API

## Rastreio de entrega

Cada pedido passa pelas etapas:

`Pedido recebido → Confirmado → Em separação → Saiu para entrega → Entregue` (ou `Cancelado`)

- No admin (`/admin/pedidos/[id]`) a consultora escolhe a nova etapa e pode deixar uma observação para o cliente.
- O cliente acompanha a linha do tempo em `/meus-pedidos/[id]`.

## Desenvolvimento assistido por IA

A interface foi construída com apoio do [v0](https://v0.app), ferramenta de IA generativa da Vercel. A separação entre front e API, a integração com o Supabase, as regras de negócio do checkout e a proteção das rotas administrativas foram revisadas e ajustadas manualmente.

## Como rodar localmente

Pré-requisitos: Node.js 20+ e um projeto no [Supabase](https://supabase.com).

1. Clone e instale as dependências:

```bash
git clone https://github.com/gustavoVitor504/loja-cosmeticos.git
cd loja-cosmeticos
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp apps/api/.env.example apps/api/.env          # SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
cp apps/web/.env.example apps/web/.env.local    # chaves públicas do Supabase e URL da API
```

3. No SQL Editor do Supabase, rode em ordem:
   1. `scripts/001_create_tables.sql`
   2. `scripts/002_seed_data.sql`
   3. `scripts/003_order_tracking.sql` — histórico de etapas, funções `place_order` / `update_order_status` e flag de admin em `app_metadata`
   4. `scripts/004_enable_rls.sql` — ativa RLS em todas as tabelas e remove políticas para `anon`/`authenticated`. O `SELECT` no final deve mostrar `rls_ativo = true` e `politicas = 0` em todas as linhas

4. Inicie a API e o front (em terminais separados):

```bash
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000
```

Outros comandos:

```bash
npm run build                 # shared + api + web
npm run typecheck
npm test -w @loja/api
```

### Tornar um usuário admin

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'consultora@exemplo.com';
```

O usuário precisa sair e entrar de novo para o token refletir a mudança.

## Endpoints da API

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/products?categoria=&ordenar=&busca=` | público |
| GET | `/products/:slug` · `/products/:slug/related` | público |
| GET | `/categories` · `/settings` | público |
| POST | `/orders` | cliente logado |
| GET | `/orders` · `/orders/:id` | cliente logado (só os próprios) |
| GET | `/admin/dashboard` | admin |
| GET/POST/PATCH/DELETE | `/admin/products[/:id]` | admin |
| GET | `/admin/orders` · `/admin/orders/:id` | admin |
| PATCH | `/admin/orders/:id/status` | admin |
| PUT | `/admin/settings` · POST `/admin/settings/photo` | admin |

## Deploy

- **web**: Vercel com *Root Directory* = `apps/web` e a variável `NEXT_PUBLIC_API_URL` apontando para a API.
- **api**: host Node (Render, Railway, Fly.io…), com *Root Directory* na raiz do repositório.
  - Build: `npm ci && npm run build:shared && npm run build -w @loja/api`
  - Start: `npm run start -w @loja/api`
  - Health check: `/health`
  - Variáveis: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN` (URL do front) e `NODE_VERSION=22`

## Autor

**Gustavo Vitor Ferreira Nunes** — [LinkedIn](https://www.linkedin.com/in/gustavovitorferreira/) · [GitHub](https://github.com/gustavoVitor504)
