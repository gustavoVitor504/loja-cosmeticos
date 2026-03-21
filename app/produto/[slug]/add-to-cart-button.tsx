'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1))
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Produto sem estoque')
      return
    }
    
    addItem(product, quantity)
    toast.success(`${quantity} ${quantity === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho!`)
    setQuantity(1)
  }

  if (product.stock <= 0) {
    return (
      <Button disabled className="w-full" size="lg">
        Produto Esgotado
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantidade:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button onClick={handleAddToCart} className="w-full gap-2" size="lg">
        <ShoppingBag className="h-5 w-5" />
        Adicionar ao Carrinho
      </Button>
    </div>
  )
}
