'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf, LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logout realizado')
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <div>
            <span className="text-lg font-semibold block">Natura</span>
            <span className="text-xs text-muted-foreground">Painel Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Home className="h-4 w-4" />
            Ver Loja
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
