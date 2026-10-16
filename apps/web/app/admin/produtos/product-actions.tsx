'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { clientApi } from '@/lib/api/client'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter()

  const handleToggleActive = async () => {
    try {
      await clientApi(`/admin/products/${product.id}`, {
        method: 'PATCH',
        body: { is_active: !product.is_active },
      })
    } catch {
      toast.error('Erro ao atualizar produto')
      return
    }
    toast.success(product.is_active ? 'Produto desativado' : 'Produto ativado')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      await clientApi(`/admin/products/${product.id}`, { method: 'DELETE' })
    } catch {
      toast.error('Erro ao excluir produto')
      return
    }
    toast.success('Produto excluído')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/produtos/${product.id}`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleActive}>
          {product.is_active ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Desativar
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Ativar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
