import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Package } from 'lucide-react'
import { ProductActions } from './product-actions'
import type { Product } from '@/lib/types'

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h2>
            <p className="text-muted-foreground mb-6">
              Comece adicionando seu primeiro produto
            </p>
            <Link href="/admin/produtos/novo">
              <Button>Adicionar Produto</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Produto</th>
                    <th className="pb-3 font-medium">Categoria</th>
                    <th className="pb-3 font-medium">Preço</th>
                    <th className="pb-3 font-medium">Estoque</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover bg-muted"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            {product.discount_percent > 0 && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                -{product.discount_percent}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-muted-foreground">
                          {product.category?.name || '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium">
                          R$ {Number(product.price).toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={product.stock <= 5 ? 'text-destructive font-medium' : ''}>
                          {product.stock} un.
                        </span>
                      </td>
                      <td className="py-4">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <ProductActions product={product} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
