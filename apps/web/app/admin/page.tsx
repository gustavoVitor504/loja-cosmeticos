import { serverApi } from '@/lib/api/server'
import { getOrderStatusInfo, type DashboardStats } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

export default async function AdminDashboard() {
  const stats = await serverApi<DashboardStats>('/admin/dashboard')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProductsCount} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingOrders} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Produtos com 5 ou menos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum pedido ainda
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name || 'Cliente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        R$ {Number(order.total).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getOrderStatusInfo(order.status).label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Todos os produtos com estoque adequado
              </p>
            ) : (
              <div className="space-y-4">
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <span className={`font-semibold ${product.stock === 0 ? 'text-destructive' : 'text-yellow-600'}`}>
                      {product.stock} un.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
