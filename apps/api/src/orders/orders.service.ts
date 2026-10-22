import { Injectable, NotFoundException } from '@nestjs/common'
import type { Order, OrderStatusHistory } from '@loja/shared'
import { SupabaseService } from '../supabase/supabase.service'
import { throwSupabaseError } from '../common/supabase-error'
import type { CheckoutDto, UpdateOrderStatusDto } from './order.dto'

const ORDER_DETAIL =
  '*, order_items(*), status_history:order_status_history(id, order_id, status, note, created_at)'

function sortHistory(order: Order): Order {
  order.status_history?.sort(
    (a: OrderStatusHistory, b: OrderStatusHistory) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
  return order
}

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.client
  }

  async place(userId: string, dto: CheckoutDto): Promise<{ orderId: string }> {
    const { data, error } = await this.db.rpc('place_order', {
      p_user_id: userId,
      p_customer_name: dto.customerName,
      p_customer_email: dto.customerEmail,
      p_customer_phone: dto.customerPhone,
      p_shipping_address: dto.shippingAddress,
      p_notes: dto.notes ?? null,
      p_items: dto.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    })

    if (error) throwSupabaseError(error, 'Erro ao criar pedido')
    return { orderId: data as string }
  }

  async listForUser(userId: string): Promise<Order[]> {
    const { data, error } = await this.db
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throwSupabaseError(error)
    return data as Order[]
  }

  async findForUser(id: string, userId: string): Promise<Order> {
    const { data, error } = await this.db
      .from('orders')
      .select(ORDER_DETAIL)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throwSupabaseError(error)
    if (!data) throw new NotFoundException('Pedido não encontrado')
    return sortHistory(data as Order)
  }

  async listAll(): Promise<Order[]> {
    const { data, error } = await this.db
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) throwSupabaseError(error)
    return data as Order[]
  }

  async findById(id: string): Promise<Order> {
    const { data, error } = await this.db.from('orders').select(ORDER_DETAIL).eq('id', id).maybeSingle()

    if (error) throwSupabaseError(error)
    if (!data) throw new NotFoundException('Pedido não encontrado')
    return sortHistory(data as Order)
  }

  async updateStatus(id: string, actorId: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const { error } = await this.db.rpc('update_order_status', {
      p_order_id: id,
      p_status: dto.status,
      p_note: dto.note ?? null,
      p_actor: actorId,
    })

    if (error) throwSupabaseError(error, 'Erro ao atualizar etapa do pedido')
    return this.findById(id)
  }
}
