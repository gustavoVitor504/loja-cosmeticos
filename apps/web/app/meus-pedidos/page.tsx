import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSettings, serverApi } from '@/lib/api/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight } from 'lucide-react'
import type { Order } from '@/lib/types'

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/meus-pedidos')
  }

  const [orders, settings] = await Promise.all([
    serverApi<Order[]>('/orders'),
    getSettings(),
  ])

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
                      <OrderStatusBadge status={order.status} />
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
