'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ApiError, clientApi } from '@/lib/api/client'
import {
  ORDER_STATUSES,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_INFO,
  type OrderStatus,
  type UpdateOrderStatusInput,
} from '@/lib/types'
import { toast } from 'sonner'

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: OrderStatus
}

function nextStatus(current: OrderStatus): OrderStatus {
  const index = ORDER_STATUS_FLOW.indexOf(current as (typeof ORDER_STATUS_FLOW)[number])
  return index >= 0 && index < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[index + 1] : current
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(nextStatus(currentStatus))
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (currentStatus === 'cancelled') {
    return <p className="text-sm text-muted-foreground">Pedido cancelado. O estoque dos itens já foi devolvido.</p>
  }

  const handleUpdate = async () => {
    if (status === currentStatus) return

    if (status === 'cancelled' && !confirm('Cancelar este pedido? O estoque dos itens será devolvido.')) {
      return
    }

    setIsLoading(true)

    try {
      const body: UpdateOrderStatusInput = { status, note: note.trim() || undefined }
      await clientApi(`/admin/orders/${orderId}/status`, { method: 'PATCH', body })

      toast.success(`Pedido atualizado para "${ORDER_STATUS_INFO[status].label}"`)
      setNote('')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Erro ao atualizar etapa')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="order-status">Nova etapa</FieldLabel>
        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
          <SelectTrigger id="order-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((option) => (
              <SelectItem key={option} value={option} disabled={option === currentStatus}>
                {ORDER_STATUS_INFO[option].label}
                {option === currentStatus && ' (atual)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="order-status-note">Observação para o cliente (opcional)</FieldLabel>
        <Textarea
          id="order-status-note"
          placeholder="Ex.: entrega prevista para amanhã à tarde"
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>

      <Button
        onClick={handleUpdate}
        disabled={isLoading || status === currentStatus}
        variant={status === 'cancelled' ? 'destructive' : 'default'}
      >
        {isLoading ? 'Salvando...' : 'Atualizar etapa'}
      </Button>
    </FieldGroup>
  )
}
