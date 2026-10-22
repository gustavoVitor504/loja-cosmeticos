import { Injectable, NotFoundException } from '@nestjs/common'
import type { Product } from '@loja/shared'
import { SupabaseService } from '../supabase/supabase.service'
import { throwSupabaseError } from '../common/supabase-error'
import type { CreateProductDto, ListProductsQuery, UpdateProductDto } from './product.dto'

const WITH_CATEGORY = '*, category:categories(*)'

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.client
  }

  async listActive({ categoria, ordenar, busca }: ListProductsQuery): Promise<Product[]> {
    let query = this.db.from('products').select(WITH_CATEGORY).eq('is_active', true)

    if (categoria && categoria !== 'all') {
      const { data: category } = await this.db
        .from('categories')
        .select('id')
        .eq('slug', categoria)
        .maybeSingle()
      if (!category) return []
      query = query.eq('category_id', category.id)
    }

    if (busca) {
      const escaped = busca.replace(/[\\%_]/g, (char) => `\\${char}`)
      query = query.ilike('name', `%${escaped}%`)
    }

    switch (ordenar) {
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throwSupabaseError(error)
    return data as Product[]
  }

  async findActiveBySlug(slug: string): Promise<Product> {
    const { data, error } = await this.db
      .from('products')
      .select(WITH_CATEGORY)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throwSupabaseError(error)
    if (!data) throw new NotFoundException('Produto não encontrado')
    return data as Product
  }

  async listRelated(slug: string): Promise<Product[]> {
    const product = await this.findActiveBySlug(slug)
    if (!product.category_id) return []

    const { data, error } = await this.db
      .from('products')
      .select(WITH_CATEGORY)
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(4)

    if (error) throwSupabaseError(error)
    return data as Product[]
  }

  async listAll(): Promise<Product[]> {
    const { data, error } = await this.db
      .from('products')
      .select(WITH_CATEGORY)
      .order('created_at', { ascending: false })

    if (error) throwSupabaseError(error)
    return data as Product[]
  }

  async findById(id: string): Promise<Product> {
    const { data, error } = await this.db
      .from('products')
      .select(WITH_CATEGORY)
      .eq('id', id)
      .maybeSingle()

    if (error) throwSupabaseError(error)
    if (!data) throw new NotFoundException('Produto não encontrado')
    return data as Product
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const { data, error } = await this.db
      .from('products')
      .insert(dto)
      .select(WITH_CATEGORY)
      .single()

    if (error) throwSupabaseError(error, 'Erro ao criar produto')
    return data as Product
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const { data, error } = await this.db
      .from('products')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(WITH_CATEGORY)
      .maybeSingle()

    if (error) throwSupabaseError(error, 'Erro ao atualizar produto')
    if (!data) throw new NotFoundException('Produto não encontrado')
    return data as Product
  }

  async remove(id: string): Promise<void> {
    const { error, count } = await this.db
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throwSupabaseError(error, 'Erro ao excluir produto')
    if (!count) throw new NotFoundException('Produto não encontrado')
  }
}
