'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import type { Category, SortOption } from '@/lib/types'

interface ProductFiltersProps {
  categories: Category[]
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'name', label: 'Nome A-Z' },
  { value: 'newest', label: 'Mais Recentes' },
]

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get('categoria') || 'all'
  const currentSort = (searchParams.get('ordenar') as SortOption) || 'relevance'
  const currentSearch = searchParams.get('busca') || ''

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all' && value !== 'relevance') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    updateParams('busca', search)
  }

  const clearFilters = () => {
    router.push('/')
  }

  const hasFilters = currentCategory !== 'all' || currentSort !== 'relevance' || currentSearch

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Buscar produtos..."
            defaultValue={currentSearch}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={currentCategory} onValueChange={(value) => updateParams('categoria', value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSort} onValueChange={(value) => updateParams('ordenar', value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
