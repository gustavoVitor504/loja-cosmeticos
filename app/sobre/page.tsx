import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Instagram, MessageCircle, Award, Heart, Leaf, Sparkles } from 'lucide-react'
import type { ConsultantSettings } from '@/lib/types'

async function getConsultantSettings(): Promise<ConsultantSettings | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consultant_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching consultant settings:', error)
    return null
  }

  return data
}

export default async function AboutPage() {
  const consultant = await getConsultantSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary/50 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              Consultora Natura
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {consultant?.name || 'Sua Consultora'}
            </h1>
            {consultant?.years_experience && (
              <p className="mt-2 text-lg text-muted-foreground">
                {consultant.years_experience} anos de experiência em beleza e bem-estar
              </p>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Bio Card */}
            <Card className="lg:row-span-2">
              <CardContent className="p-6 space-y-6">
                {/* Photo placeholder */}
                <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  {consultant?.photo_url ? (
                    <img
                      src={consultant.photo_url}
                      alt={consultant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Sparkles className="h-24 w-24 text-primary/40" />
                    </div>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">{consultant?.name || 'Maria Silva'}</h2>
                  
                  {consultant?.bio && (
                    <p className="text-muted-foreground leading-relaxed">
                      {consultant.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Entre em Contato</h3>
                <p className="text-muted-foreground">
                  Estou disponível para tirar dúvidas, fazer pedidos personalizados 
                  e ajudar você a escolher os melhores produtos.
                </p>
                
                <div className="space-y-3 pt-2">
                  {consultant?.phone && (
                    <a 
                      href={`tel:${consultant.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Telefone</p>
                        <p className="text-sm text-muted-foreground">{consultant.phone}</p>
                      </div>
                    </a>
                  )}
                  
                  {consultant?.whatsapp && (
                    <a 
                      href={`https://wa.me/${consultant.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm text-muted-foreground">Clique para conversar</p>
                      </div>
                    </a>
                  )}
                  
                  {consultant?.email && (
                    <a 
                      href={`mailto:${consultant.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">E-mail</p>
                        <p className="text-sm text-muted-foreground">{consultant.email}</p>
                      </div>
                    </a>
                  )}
                  
                  {consultant?.instagram && (
                    <a 
                      href={`https://instagram.com/${consultant.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Instagram</p>
                        <p className="text-sm text-muted-foreground">{consultant.instagram}</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Por que comprar comigo?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Consultoria Personalizada</p>
                      <p className="text-sm text-muted-foreground">
                        Ajudo você a escolher os produtos ideais para suas necessidades
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Atendimento Exclusivo</p>
                      <p className="text-sm text-muted-foreground">
                        Acompanhamento do pedido e suporte pós-venda
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Produtos Originais</p>
                      <p className="text-sm text-muted-foreground">
                        Garantia de produtos Natura 100% autênticos
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
