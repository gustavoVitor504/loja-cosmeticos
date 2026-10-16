import { Controller, Get, Injectable, Module } from '@nestjs/common'
import type { DashboardStats, Order, Product } from '@loja/shared'
import { AdminOnly } from '../auth/auth.decorators'
import { SupabaseService } from '../supabase/supabase.service'
import { throwSupabaseError } from '../common/supabase-error'

const LOW_STOCK_THRESHOLD = 5

@Injectable()
export class DashboardService {
  constructor(private readonly supabase: SupabaseService) {}

  async stats(): Promise<DashboardStats> {
    const db = this.supabase.client

    const [products, activeProducts, lowStock, orders, recent] = await Promise.all([
      db.from('products').select('*', { count: 'exact', head: true }),
      db.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      db
        .from('products')
        .select('*')
        .eq('is_active', true)
        .lte('stock', LOW_STOCK_THRESHOLD)
        .order('stock', { ascending: true }),
      db.from('orders').select('total, status'),
      db
        .from('orders')
        .select('*, order_items(count)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    for (const result of [products, activeProducts, lowStock, orders, recent]) {
      if (result.error) throwSupabaseError(result.error)
    }

    const allOrders = orders.data ?? []

    return {
      productsCount: products.count ?? 0,
      activeProductsCount: activeProducts.count ?? 0,
      lowStockProducts: (lowStock.data ?? []) as Product[],
      ordersCount: allOrders.length,
      pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
      // Pedidos cancelados não entram na receita
      totalRevenue: allOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0),
      recentOrders: (recent.data ?? []) as Order[],
    }
  }
}

@AdminOnly()
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  stats() {
    return this.dashboard.stats()
  }
}

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
