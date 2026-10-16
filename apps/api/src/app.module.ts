import { Controller, Get, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseModule } from './supabase/supabase.module'
import { ProductsModule } from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { SettingsModule } from './settings/settings.module'
import { OrdersModule } from './orders/orders.module'
import { DashboardModule } from './dashboard/dashboard.module'

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok' }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    ProductsModule,
    CategoriesModule,
    SettingsModule,
    OrdersModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
