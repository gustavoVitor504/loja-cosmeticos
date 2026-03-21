'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X, Leaf } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/cart-store'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Produtos', href: '/' },
  { name: 'Sobre', href: '/sobre' },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())

  useEffect(() => {
    const supabase = createClient()
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setIsAdmin(user?.user_metadata?.is_admin === true)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user)
      setIsAdmin(session?.user?.user_metadata?.is_admin === true)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold tracking-tight">Natura</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <Link href="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
          
          {isLoggedIn ? (
            <Link href={isAdmin ? '/admin' : '/meus-pedidos'}>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {isAdmin ? 'Painel Admin' : 'Minha Conta'}
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex flex-col gap-6 pt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="border-border" />
                {isLoggedIn ? (
                  <Link
                    href={isAdmin ? '/admin' : '/meus-pedidos'}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium"
                  >
                    {isAdmin ? 'Painel Admin' : 'Minha Conta'}
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
