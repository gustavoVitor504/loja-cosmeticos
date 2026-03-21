'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useCartStore } from '@/lib/cart-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default async function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const total = getTotal()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const supabase = createClient()
  const { data: settings } = await supabase
    .from('consultant_settings')
    .select('name, email, phone, instagram, whatsapp')
    .single()

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        }))
      }
    }
    
    getUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio')
      return
    }

    if (!user) {
      toast.error('Você precisa estar logado para finalizar o pedido')
      router.push('/auth/login?redirect=/checkout')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          notes: formData.notes,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items and decrement stock
      for (const item of items) {
        const price = item.product.discount_percent > 0
          ? item.product.price * (1 - item.product.discount_percent / 100)
          : item.product.price

        // Insert order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: price,
          })

        if (itemError) throw itemError

        // Decrement stock using RPC function
        const { error: stockError } = await supabase
          .rpc('decrement_stock', {
            p_product_id: item.product.id,
            p_quantity: item.quantity,
          })

        if (stockError) {
          console.error('Stock decrement error:', stockError)
        }
      }

      setIsSuccess(true)
      clearCart()
      toast.success('Pedido realizado com sucesso!')
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Erro ao processar pedido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-6">
              Adicione produtos para continuar
            </p>
            <Link href="/">
              <Button>Ver Produtos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="rounded-full bg-primary/10 p-6 w-fit mx-auto mb-6">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Pedido Realizado!</h1>
            <p className="text-muted-foreground mb-8">
              Seu pedido foi recebido com sucesso. Em breve entraremos em contato 
              para confirmar os detalhes da entrega.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/meus-pedidos">
                <Button className="w-full">Ver Meus Pedidos</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Continuar Comprando</Button>
              </Link>
            </div>
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
        <Link 
          href="/carrinho" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao carrinho
        </Link>

        <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

        {!user && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm">
                <Link href="/auth/login?redirect=/checkout" className="text-primary font-medium hover:underline">
                  Faça login
                </Link>
                {' '}para finalizar seu pedido e acompanhar suas compras.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleSubmit}>
                  <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Field>
                      
                      <Field>
                        <FieldLabel htmlFor="email">E-mail</FieldLabel>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Field>
                    </div>
                    
                    <Field>
                      <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                    
                    <Field>
                      <FieldLabel htmlFor="address">Endereço de Entrega</FieldLabel>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Rua, número, bairro, cidade, CEP"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                    
                    <Field>
                      <FieldLabel htmlFor="notes">Observações (opcional)</FieldLabel>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Informações adicionais sobre o pedido..."
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => {
                    const price = item.product.discount_percent > 0
                      ? item.product.price * (1 - item.product.discount_percent / 100)
                      : item.product.price
                    
                    return (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
                          {item.product.name} x{item.quantity}
                        </span>
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

                <Button 
                  type="submit" 
                  form="checkout-form"
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || !user}
                >
                  {isLoading ? 'Processando...' : 'Confirmar Pedido'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  O pagamento será combinado diretamente com a consultora
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
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
