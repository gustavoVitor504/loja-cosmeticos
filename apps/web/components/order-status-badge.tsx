import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getOrderStatusInfo } from '@/lib/types'

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const info = getOrderStatusInfo(status)
  return (
    <Badge variant={info.variant} className={cn(className)}>
      {info.label}
    </Badge>
  )
}
