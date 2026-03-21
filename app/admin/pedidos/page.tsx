import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import type { Order } from '@/lib/types'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'default' },
  delivered: { label: 'Entregue', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
}

async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data as Order[]
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Pedidos</h1>

      {orders.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum pedido ainda</h2>
            <p className="text-muted-foreground">
              Os pedidos dos clientes aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Pedido</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Itens</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = statusMap[order.status] || statusMap.pending
                    const itemCount = order.order_items?.length || 0
                    
                    return (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-4">
                          <span className="font-mono text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{order.customer_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_email || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-muted-foreground">
                            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-primary">
                            R$ {Number(order.total).toFixed(2).replace('.', ',')}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/admin/pedidos/${order.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Ver
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
