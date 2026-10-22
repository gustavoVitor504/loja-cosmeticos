-- =====================================================================
-- 004 - Bloqueia acesso direto às tabelas com a chave pública (anon)
-- Rode no SQL Editor do Supabase depois do 003. Pode ser executado mais de uma vez.
--
-- O front não lê nem grava tabelas: todo dado passa pela API, que usa a
-- service_role (ignora RLS). Por isso o RLS fica ativo SEM políticas para
-- anon/authenticated, e qualquer política antiga é removida.
-- =====================================================================

DO $$
DECLARE
  t TEXT;
  p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'categories', 'products', 'orders',
    'order_items', 'consultant_settings', 'order_status_history'
  ] LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);

    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- decrement_stock foi criada fora dos scripts e era chamada direto do navegador.
-- Não é mais usada (place_order baixa o estoque); bloqueia para não permitir zerar estoque.
DO $$
DECLARE
  f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'decrement_stock'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.signature);
  END LOOP;
END $$;

-- Conferência: todas as linhas devem ter rls_ativo = true e politicas = 0
SELECT c.relname AS tabela,
       c.relrowsecurity AS rls_ativo,
       (SELECT count(*) FROM pg_policies pp WHERE pp.schemaname = 'public' AND pp.tablename = c.relname) AS politicas
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
