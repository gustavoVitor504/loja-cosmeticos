import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight } from 'lucide-react'
import type { Order } from '@/lib/types'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'default' },
  delivered: { label: 'Entregue', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
}

async function getOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient()
  
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data as Order[]
}

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: settings } = await supabase
    .from('consultant_settings')
    .select('name, email, phone, instagram, whatsapp')
    .single()

  if (!user) {
    redirect('/auth/login?redirect=/meus-pedidos')
  }

  const orders = await getOrders(user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Meus Pedidos</h1>
          <Link href="/">
            <Button variant="outline">Continuar Comprando</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
              <p className="text-muted-foreground mb-6">
                Você ainda não fez nenhum pedido
              </p>
              <Link href="/">
                <Button>Ver Produtos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusMap[order.status] || statusMap.pending
              const itemCount = order.order_items?.length || 0
              
              return (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          R$ {Number(order.total).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <Link href={`/meus-pedidos/${order.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          Ver Detalhes
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer
      name={settings?.name}
      email={settings?.email}
      phone={settings?.phone}
      whatsapp={settings?.whatsapp}
      instagram={settings?.instagram}
      />
    </div>
  )
}
