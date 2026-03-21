'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  const discountedPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stock <= 0) {
      toast.error('Produto sem estoque')
      return
    }
    
    addItem(product)
    toast.success('Produto adicionado ao carrinho!')
  }

  return (
    <Link href={`/produto/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">Sem imagem</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.discount_percent > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{product.discount_percent}%
              </Badge>
            )}
            {product.magazine_available && (
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" />
                Revista
              </Badge>
            )}
          </div>
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="secondary" className="text-sm">
                Esgotado
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            {product.discount_percent > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-lg font-semibold text-primary">
              R$ {discountedPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full gap-2"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Adicionar
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
