import { BadRequestException, NotFoundException } from '@nestjs/common'
import { OrdersService } from './orders.service'
import type { SupabaseService } from '../supabase/supabase.service'

function serviceWithRpc(result: { data?: unknown; error?: { code: string; message: string } | null }) {
  const rpc = jest.fn().mockResolvedValue({ data: result.data ?? null, error: result.error ?? null })
  const supabase = { client: { rpc } } as unknown as SupabaseService
  return { service: new OrdersService(supabase), rpc }
}

const checkout = {
  items: [{ productId: 'p1', quantity: 2 }],
  customerName: 'Ana',
  customerEmail: 'ana@exemplo.com',
  customerPhone: '11999999999',
  shippingAddress: 'Rua A, 1',
}

describe('OrdersService', () => {
  it('cria o pedido enviando só produto e quantidade (preço vem do banco)', async () => {
    const { service, rpc } = serviceWithRpc({ data: 'order-1' })

    await expect(service.place('user-1', checkout)).resolves.toEqual({ orderId: 'order-1' })
    expect(rpc).toHaveBeenCalledWith('place_order', {
      p_user_id: 'user-1',
      p_customer_name: 'Ana',
      p_customer_email: 'ana@exemplo.com',
      p_customer_phone: '11999999999',
      p_shipping_address: 'Rua A, 1',
      p_notes: null,
      p_items: [{ product_id: 'p1', quantity: 2 }],
    })
  })

  it('converte erro de regra de negócio do SQL em 400 com a mensagem original', async () => {
    const { service } = serviceWithRpc({
      error: { code: 'P0001', message: 'Estoque insuficiente para Kaiak. Disponível: 1' },
    })

    await expect(service.place('user-1', checkout)).rejects.toThrow(
      new BadRequestException('Estoque insuficiente para Kaiak. Disponível: 1'),
    )
  })

  it('converte pedido inexistente em 404 ao mudar etapa', async () => {
    const { service } = serviceWithRpc({ error: { code: 'P0002', message: 'Pedido não encontrado' } })

    await expect(service.updateStatus('o1', 'admin', { status: 'confirmed' })).rejects.toThrow(NotFoundException)
  })
})
