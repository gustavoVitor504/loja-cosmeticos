export const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
] as const

export const ORDER_STATUSES = [...ORDER_STATUS_FLOW, 'cancelled'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

export const ORDER_STATUS_INFO: Record<
  OrderStatus,
  { label: string; description: string; variant: BadgeVariant }
> = {
  pending: {
    label: 'Pedido recebido',
    description: 'Recebemos seu pedido e vamos confirmá-lo em breve.',
    variant: 'secondary',
  },
  confirmed: {
    label: 'Confirmado',
    description: 'Pedido confirmado pela consultora.',
    variant: 'default',
  },
  preparing: {
    label: 'Em separação',
    description: 'Os produtos estão sendo separados e embalados.',
    variant: 'default',
  },
  out_for_delivery: {
    label: 'Saiu para entrega',
    description: 'O pedido está a caminho do endereço informado.',
    variant: 'default',
  },
  delivered: {
    label: 'Entregue',
    description: 'Pedido entregue. Aproveite!',
    variant: 'outline',
  },
  cancelled: {
    label: 'Cancelado',
    description: 'Este pedido foi cancelado.',
    variant: 'destructive',
  },
}

export const FINAL_ORDER_STATUSES: readonly OrderStatus[] = ['delivered', 'cancelled']

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value)
}

export function getOrderStatusInfo(status: string) {
  return isOrderStatus(status) ? ORDER_STATUS_INFO[status] : ORDER_STATUS_INFO.pending
}
