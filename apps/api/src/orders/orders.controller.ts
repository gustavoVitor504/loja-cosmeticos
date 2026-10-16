import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import type { User } from '@supabase/supabase-js'
import { ParseIdPipe } from '../common/parse-id.pipe'
import { AdminOnly, Authenticated, CurrentUser } from '../auth/auth.decorators'
import { CheckoutDto, UpdateOrderStatusDto } from './order.dto'
import { OrdersService } from './orders.service'

/** Pedidos do cliente logado. */
@Authenticated()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  place(@CurrentUser() user: User, @Body() dto: CheckoutDto) {
    return this.orders.place(user.id, dto)
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.orders.listForUser(user.id)
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseIdPipe) id: string) {
    return this.orders.findForUser(id, user.id)
  }
}

@AdminOnly()
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list() {
    return this.orders.listAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: string) {
    return this.orders.findById(id)
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orders.updateStatus(id, user.id, dto)
  }
}
