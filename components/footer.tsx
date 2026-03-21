import Link from 'next/link'
import { Leaf, Instagram, Phone, Mail } from 'lucide-react'

type FooterProps = {
  name?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  instagram?: string | null
}

export function Footer({ name, email, phone, whatsapp, instagram }: FooterProps) {
  const contactPhone = whatsapp || phone || ''
  const phoneFormatted = phone || contactPhone
  const brandName = name || 'Natura'
  const ig = instagram || ''
  const em = email || ''

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">

          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">{brandName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Beleza que faz bem para você e para o mundo.
              Produtos de alta qualidade com ingredientes naturais.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Navegação</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Produtos
              </Link>
              <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sobre a Consultora
              </Link>
              <Link href="/carrinho" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Carrinho
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contato</h3>
            <div className="flex flex-col gap-3">
              {contactPhone.length > 0 && (
                <a
                  href={'https://wa.me/' + contactPhone}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {phoneFormatted}
                </a>
              )}
              {em.length > 0 && (
                <a
                  href={'mailto:' + em}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {em}
                </a>
              )}
              {ig.length > 0 && (
                <a
                  href={'https://instagram.com/' + ig.replace('@', '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  {ig}
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="mt-12 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName} Consultora. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}