'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    if (status === currentStatus) return
    
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Status atualizado com sucesso!')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={handleUpdate} 
        disabled={isLoading || status === currentStatus}
      >
        {isLoading ? 'Salvando...' : 'Atualizar'}
      </Button>
    </div>
  )
}
