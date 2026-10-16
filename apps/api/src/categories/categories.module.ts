import { Controller, Get, Injectable, Module } from '@nestjs/common'
import type { Category } from '@loja/shared'
import { SupabaseService } from '../supabase/supabase.service'
import { throwSupabaseError } from '../common/supabase-error'

@Injectable()
export class CategoriesService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(): Promise<Category[]> {
    const { data, error } = await this.supabase.client.from('categories').select('*').order('name')
    if (error) throwSupabaseError(error)
    return data
  }
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list()
  }
}

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
