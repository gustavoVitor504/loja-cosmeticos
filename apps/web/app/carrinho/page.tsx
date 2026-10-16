'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/cart-store'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-6">Adicione produtos para continuar comprando</p>
            <Link href="/"><Button>Ver Produtos</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Continuar comprando
        </Link>

        <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.product.discount_percent > 0
                ? item.product.price * (1 - item.product.discount_percent / 100)
                : item.product.price
              
              return (
                <Card key={item.product.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.product.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-xs text-muted-foreground">Sem imagem</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/produto/${item.product.slug}`} className="font-medium hover:text-primary line-clamp-2">
                          {item.product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {item.product.discount_percent > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              R$ {item.product.price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          <span className="font-semibold text-primary">
                            R$ {price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeItem(item.product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            <Button variant="outline" onClick={clearCart} className="w-full">Limpar Carrinho</Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Resumo do Pedido</h2>
                <div className="space-y-2">
                  {items.map((item) => {
                    const price = item.product.discount_percent > 0
                      ? item.product.price * (1 - item.product.discount_percent / 100)
                      : item.product.price
                    return (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground line-clamp-1">{item.product.name} x{item.quantity}</span>
                        <span>R$ {(price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )
                  })}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">Finalizar Pedido</Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground">
                  Ao finalizar, você será redirecionado para completar seus dados
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}