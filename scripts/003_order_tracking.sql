-- =====================================================================
-- 003 - Rastreio de entrega + funções transacionais usadas pela API
-- Rode no SQL Editor do Supabase depois de 001 e 002.
-- Pode ser executado mais de uma vez.
-- =====================================================================

-- 1) Novas etapas do pedido -------------------------------------------
-- 'shipped' passa a se chamar 'out_for_delivery' (Saiu para entrega)
UPDATE public.orders SET status = 'out_for_delivery' WHERE status = 'shipped';
UPDATE public.orders SET status = 'pending' WHERE status IS NULL;

ALTER TABLE public.orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
);

-- 2) Histórico de etapas ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx
  ON public.order_status_history (order_id, created_at);

-- Apenas a API (service role) acessa esta tabela
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Popular histórico dos pedidos antigos
INSERT INTO public.order_status_history (order_id, status, created_at)
SELECT o.id, 'pending', o.created_at
FROM public.orders o
WHERE NOT EXISTS (SELECT 1 FROM public.order_status_history h WHERE h.order_id = o.id);

INSERT INTO public.order_status_history (order_id, status, created_at)
SELECT o.id, o.status, COALESCE(o.updated_at, o.created_at)
FROM public.orders o
WHERE o.status <> 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM public.order_status_history h
    WHERE h.order_id = o.id AND h.status = o.status
  );

-- 3) Criação de pedido atômica ----------------------------------------
-- Preço vem SEMPRE do banco; estoque é travado e baixado na mesma transação.
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address TEXT,
  p_notes TEXT,
  p_items JSONB -- [{ "product_id": uuid, "quantity": int }]
) RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_total NUMERIC(10, 2) := 0;
  v_item RECORD;
  v_product public.products%ROWTYPE;
  v_unit_price NUMERIC(10, 2);
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Carrinho vazio' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.orders (
    user_id, status, total, customer_name, customer_email,
    customer_phone, shipping_address, notes
  ) VALUES (
    p_user_id, 'pending', 0, p_customer_name, p_customer_email,
    p_customer_phone, p_shipping_address, p_notes
  ) RETURNING id INTO v_order_id;

  -- Agrupa itens repetidos e ordena por id para evitar deadlock entre pedidos simultâneos
  FOR v_item IN
    SELECT (e->>'product_id')::UUID AS product_id,
           SUM((e->>'quantity')::INT)::INT AS quantity
    FROM jsonb_array_elements(p_items) e
    GROUP BY 1
    ORDER BY 1
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Quantidade inválida' USING ERRCODE = 'P0001';
    END IF;

    SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id FOR UPDATE;

    IF NOT FOUND OR NOT v_product.is_active THEN
      RAISE EXCEPTION 'Produto indisponível' USING ERRCODE = 'P0001';
    END IF;

    IF v_product.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para %. Disponível: %', v_product.name, v_product.stock
        USING ERRCODE = 'P0001';
    END IF;

    v_unit_price := ROUND(v_product.price * (1 - COALESCE(v_product.discount_percent, 0) / 100.0), 2);

    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price)
    VALUES (v_order_id, v_product.id, v_product.name, v_item.quantity, v_unit_price);

    UPDATE public.products
    SET stock = stock - v_item.quantity, updated_at = NOW()
    WHERE id = v_product.id;

    v_total := v_total + v_unit_price * v_item.quantity;
  END LOOP;

  UPDATE public.orders SET total = v_total WHERE id = v_order_id;

  INSERT INTO public.order_status_history (order_id, status, created_by)
  VALUES (v_order_id, 'pending', p_user_id);

  RETURN v_order_id;
END;
$$;

-- 4) Mudança de etapa com histórico -----------------------------------
-- Ao cancelar, o estoque dos itens é devolvido. Pedido cancelado não pode ser reaberto.
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_note TEXT,
  p_actor UUID
) RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_current TEXT;
BEGIN
  SELECT status INTO v_current FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado' USING ERRCODE = 'P0002';
  END IF;

  IF v_current = p_status THEN
    RAISE EXCEPTION 'O pedido já está nesta etapa' USING ERRCODE = 'P0001';
  END IF;

  IF v_current = 'cancelled' THEN
    RAISE EXCEPTION 'Pedido cancelado não pode mudar de etapa' USING ERRCODE = 'P0001';
  END IF;

  IF p_status = 'cancelled' THEN
    UPDATE public.products p
    SET stock = p.stock + i.quantity, updated_at = NOW()
    FROM public.order_items i
    WHERE i.order_id = p_order_id AND i.product_id = p.id;
  END IF;

  UPDATE public.orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;

  INSERT INTO public.order_status_history (order_id, status, note, created_by)
  VALUES (p_order_id, p_status, NULLIF(TRIM(p_note), ''), p_actor);
END;
$$;

-- Só a API (service role) pode chamar essas funções
REVOKE ALL ON FUNCTION public.place_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_order_status(UUID, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT, TEXT, UUID) TO service_role;

-- 5) Flag de admin segura ---------------------------------------------
-- user_metadata pode ser alterado pelo próprio usuário; app_metadata só pelo servidor.
-- A API e o front passam a checar app_metadata.is_admin.
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB) || '{"is_admin": true}'::JSONB
WHERE raw_user_meta_data->>'is_admin' = 'true';
