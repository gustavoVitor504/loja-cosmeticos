import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ParseIdPipe } from '../common/parse-id.pipe'
import { AdminOnly } from '../auth/auth.decorators'
import { CreateProductDto, ListProductsQuery, UpdateProductDto } from './product.dto'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQuery) {
    return this.products.listActive(query)
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.products.findActiveBySlug(slug)
  }

  @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.products.listRelated(slug)
  }
}

@AdminOnly()
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.listAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: string) {
    return this.products.findById(id)
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto)
  }

  @Patch(':id')
  update(@Param('id', ParseIdPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: string) {
    return this.products.remove(id)
  }
}
