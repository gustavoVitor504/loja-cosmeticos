import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const body = await request.json()
    const { items, shippingAddress, notes, customerName, customerEmail, customerPhone } = body
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }
    
    // Verificar estoque de todos os itens
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', item.id)
        .single()
      
      if (!product) {
        return NextResponse.json({ error: `Produto não encontrado: ${item.name}` }, { status: 400 })
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}` 
        }, { status: 400 })
      }
    }
    
    // Calcular total
    const total = items.reduce((sum: number, item: { price: number; discountPercent: number; quantity: number }) => {
      const discountedPrice = item.price * (1 - item.discountPercent / 100)
      return sum + (discountedPrice * item.quantity)
    }, 0)
    
    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        notes,
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('Erro ao criar pedido:', orderError)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }
    
    // Criar itens do pedido e decrementar estoque
    for (const item of items) {
      // Inserir item do pedido
      const discountedPrice = item.price * (1 - item.discountPercent / 100)
      
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: discountedPrice,
        })
      
      if (itemError) {
        console.error('Erro ao criar item do pedido:', itemError)
      }
      
      // Decrementar estoque usando a função SQL
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        p_product_id: item.id,
        p_quantity: item.quantity
      })
      
      if (stockError) {
        console.error('Erro ao decrementar estoque:', stockError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Pedido realizado com sucesso!' 
    })
    
  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
