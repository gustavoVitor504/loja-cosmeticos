import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from '@/components/product-filters'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product, Category, SortOption } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{
    categoria?: string
    ordenar?: SortOption
    busca?: string
  }>
}

async function getProducts(
  category?: string,
  sort?: SortOption,
  search?: string
): Promise<Product[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)

  if (category && category !== 'all') {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

async function ProductsGrid({ 
  category, 
  sort, 
  search 
}: { 
  category?: string
  sort?: SortOption
  search?: string 
}) {
  const products = await getProducts(category, sort, search)

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary/50 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Beleza que faz bem
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Descubra produtos Natura selecionados com carinho para realçar sua beleza natural.
              Atendimento personalizado e entrega rápida.
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>

          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsGrid 
              category={params.categoria} 
              sort={params.ordenar} 
              search={params.busca}
            />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  )
}
