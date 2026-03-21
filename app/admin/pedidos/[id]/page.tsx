import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Phone, Mail, FileText, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OrderStatusUpdate } from './order-status-update'
import type { Order } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'default' },
  delivered: { label: 'Entregue', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
}

async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Order
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const status = statusMap[order.status] || statusMap.pending

  return (
    <div className="p-8">
      <Link 
        href="/admin/pedidos" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos pedidos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant={status.variant} className="text-base px-4 py-2">
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity} x R$ {Number(item.unit_price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <p className="font-semibold">
                      R$ {(Number(item.unit_price) * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">
                  R$ {Number(order.total).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.customer_name && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>
              )}
              
              {order.customer_email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <a href={`mailto:${order.customer_email}`} className="font-medium hover:text-primary">
                      {order.customer_email}
                    </a>
                  </div>
                </div>
              )}
              
              {order.customer_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <a href={`tel:${order.customer_phone}`} className="font-medium hover:text-primary">
                      {order.customer_phone}
                    </a>
                  </div>
                </div>
              )}
              
              {order.shipping_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{order.shipping_address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
