# loja-cosmeticos

Loja de uma consultora Natura: catálogo, carrinho, pedidos com rastreio de entrega e painel admin.

## Estrutura

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

- O front usa o Supabase **só para autenticação**. Todo dado passa pela API.
- A API valida o JWT do Supabase (`Authorization: Bearer <token>`) e aplica as regras de acesso.
- Admin é definido por `app_metadata.is_admin = true` no usuário do Supabase (não pode ser alterado pelo próprio usuário).

## Rastreio de entrega

Cada pedido passa pelas etapas:

`Pedido recebido → Confirmado → Em separação → Saiu para entrega → Entregue` (ou `Cancelado`)

- No admin (`/admin/pedidos/[id]`) a consultora escolhe a nova etapa e pode deixar uma observação para o cliente.
- O cliente acompanha a linha do tempo em `/meus-pedidos/[id]`.
- Cada mudança fica registrada em `order_status_history`. Ao cancelar, o estoque dos itens é devolvido.

## Banco de dados

No SQL Editor do Supabase, rode em ordem:

1. `scripts/001_create_tables.sql`
2. `scripts/002_seed_data.sql`
3. `scripts/003_order_tracking.sql` — histórico de etapas, funções `place_order` / `update_order_status` e flag de admin em `app_metadata`
4. `scripts/004_enable_rls.sql` — ativa RLS em todas as tabelas e remove políticas para `anon`/`authenticated` (o front não acessa tabelas, só a API com `service_role`). O `SELECT` no final deve mostrar `rls_ativo = true` e `politicas = 0` em todas as linhas

Para tornar um usuário admin:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'consultora@exemplo.com';
```

O usuário precisa sair e entrar de novo para o token refletir a mudança.

## Rodando localmente

```bash
npm install

cp apps/api/.env.example apps/api/.env          # preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
cp apps/web/.env.example apps/web/.env.local    # preencha as chaves públicas do Supabase

npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000 (em outro terminal)
```

Outros comandos:

```bash
npm run build                 # shared + api + web
npm run typecheck
npm test -w @loja/api
```

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

- **web**: Vercel com *Root Directory* = `apps/web`.
- **api**: qualquer host Node (Render, Railway, Fly.io…). Build `npm run build:shared && npm run build -w @loja/api`, start `npm run start -w @loja/api`.
  Configure `CORS_ORIGIN` com a URL do front e, no web, `NEXT_PUBLIC_API_URL` com a URL da API.
