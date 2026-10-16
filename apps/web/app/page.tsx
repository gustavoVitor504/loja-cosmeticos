import { Suspense } from 'react'
import { getSettings, serverApi } from '@/lib/api/server'
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

const SORT_VALUES: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'name', 'newest']

async function getProducts(
  category?: string,
  sort?: SortOption,
  search?: string
): Promise<Product[]> {
  const params = new URLSearchParams()
  if (category) params.set('categoria', category)
  if (sort && SORT_VALUES.includes(sort)) params.set('ordenar', sort)
  if (search) params.set('busca', search.slice(0, 100))

  return serverApi<Product[]>(`/products?${params}`, { auth: false })
}

async function getCategories(): Promise<Category[]> {
  return serverApi<Category[]>('/categories', { auth: false })
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
  const settings = await getSettings()
    
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
