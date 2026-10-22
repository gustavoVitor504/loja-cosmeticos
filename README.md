# Loja de Cosméticos

E-commerce de cosméticos em Next.js com Supabase, com catálogo, carrinho, checkout com validação de estoque, área do cliente e painel administrativo.

> **Projeto de portfólio.** A loja é uma demonstração e nenhum produto é vendido.

**[Ver site no ar](https://v0-site-cosmeticos-natura.vercel.app)**

## Funcionalidades

- Catálogo com filtros e página de produto com carrossel de imagens
- Cadastro e login com Supabase Auth
- Carrinho persistente (mantido ao recarregar a página)
- Checkout que valida o estoque de cada item antes de criar o pedido e dá baixa no estoque
- Área "Meus pedidos" com o detalhe de cada compra
- Painel administrativo protegido: cadastro e edição de produtos, gestão de pedidos com atualização de status e configurações da loja

## Tecnologias

- Next.js (App Router), React e TypeScript
- Supabase (PostgreSQL e autenticação)
- Tailwind CSS e shadcn/ui
- Zustand (estado do carrinho)
- React Hook Form e Zod (formulários e validação)
- Deploy na Vercel

## Destaques técnicos

- **Middleware do Next.js** que renova a sessão do usuário e bloqueia `/admin` para quem não é administrador
- **Route handler** (`app/api/checkout`) que roda no servidor e valida usuário, carrinho e estoque antes de gravar o pedido
- **Server Actions** para as operações do painel administrativo
- **Scripts SQL versionados** (`scripts/`) para criar as tabelas e popular o banco

## Desenvolvimento assistido por IA

A interface foi construída com apoio do [v0](https://v0.app), ferramenta de IA generativa da Vercel. A integração com o Supabase, as regras de negócio do checkout e a proteção das rotas administrativas foram revisadas e ajustadas manualmente.

## Como rodar localmente

Pré-requisitos: Node.js 18+ e um projeto no [Supabase](https://supabase.com).

1. Clone e instale as dependências:

```bash
git clone https://github.com/gustavoVitor504/loja-cosmeticos.git
cd loja-cosmeticos
npm install
```

2. Crie um arquivo `.env.local` na raiz:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

3. No SQL Editor do Supabase, rode `scripts/001_create_tables.sql` e depois `scripts/002_seed_data.sql`.

4. Inicie o projeto:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Autor

**Gustavo Vitor Ferreira Nunes** — [LinkedIn](https://www.linkedin.com/in/gustavovitorferreira/) · [GitHub](https://github.com/gustavoVitor504)
