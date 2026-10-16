import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_INFO,
  type OrderStatus,
  type OrderStatusHistory,
} from '@/lib/types'

interface OrderTimelineProps {
  status: OrderStatus
  history?: OrderStatusHistory[]
}

type StepState = 'done' | 'current' | 'upcoming'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Linha do tempo das etapas da entrega, com data e observação de cada etapa já alcançada. */
export function OrderTimeline({ status, history = [] }: OrderTimelineProps) {
  // Última ocorrência de cada etapa (o histórico vem em ordem cronológica)
  const reached = new Map<OrderStatus, OrderStatusHistory>()
  for (const entry of history) reached.set(entry.status, entry)

  const isCancelled = status === 'cancelled'
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status as (typeof ORDER_STATUS_FLOW)[number])

  const steps: OrderStatus[] = isCancelled
    ? [...ORDER_STATUS_FLOW.filter((step) => reached.has(step)), 'cancelled']
    : [...ORDER_STATUS_FLOW]

  const stateOf = (step: OrderStatus, index: number): StepState => {
    if (step === status) return 'current'
    if (isCancelled || index < currentIndex) return 'done'
    return 'upcoming'
  }

  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const state = stateOf(step, index)
        const entry = state === 'upcoming' ? undefined : reached.get(step)
        const isLast = index === steps.length - 1
        const cancelledStep = step === 'cancelled'

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-0.5',
                  state === 'upcoming' || stateOf(steps[index + 1], index + 1) === 'upcoming'
                    ? 'bg-border'
                    : 'bg-primary',
                )}
              />
            )}

            <span
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                state === 'upcoming' && 'border-border bg-background',
                state === 'done' && 'border-primary bg-primary text-primary-foreground',
                state === 'current' && !cancelledStep && 'border-primary bg-background ring-4 ring-primary/15',
                cancelledStep && 'border-destructive bg-destructive text-white',
              )}
            >
              {state === 'done' && <Check className="h-3.5 w-3.5" />}
              {cancelledStep && <X className="h-3.5 w-3.5" />}
              {state === 'current' && !cancelledStep && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>

            <div className="min-w-0 flex-1 -mt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={cn(
                    'font-medium',
                    state === 'upcoming' && 'text-muted-foreground',
                    cancelledStep && 'text-destructive',
                  )}
                >
                  {ORDER_STATUS_INFO[step].label}
                </p>
                {entry && <time className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</time>}
              </div>
              {state === 'current' && (
                <p className="text-sm text-muted-foreground">{ORDER_STATUS_INFO[step].description}</p>
              )}
              {entry?.note && (
                <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{entry.note}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
