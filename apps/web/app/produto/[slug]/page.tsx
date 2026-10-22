import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Package } from 'lucide-react'
import { getSettings, serverApi, serverApiOrNull } from '@/lib/api/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ImageCarousel } from '@/components/image-carousel'
import { AddToCartButton } from './add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

function getProduct(slug: string) {
  return serverApiOrNull<Product>(`/products/${encodeURIComponent(slug)}`, { auth: false })
}

function getRelatedProducts(slug: string) {
  return serverApi<Product[]>(`/products/${encodeURIComponent(slug)}/related`, { auth: false })
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()])
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(slug)

  const discountedPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos produtos
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            <ImageCarousel images={product.images} productName={product.name} />

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {product.discount_percent > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    -{product.discount_percent}% OFF
                  </Badge>
                )}
                {product.magazine_available && (
                  <Badge variant="secondary" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    Disponível na Revista
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="outline">{product.category.name}</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

              <div className="flex items-baseline gap-3">
                {product.discount_percent > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="text-3xl font-bold text-primary">
                  R$ {discountedPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {product.stock > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    {product.stock} {product.stock === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                  </span>
                ) : (
                  <span className="text-sm text-destructive">Produto esgotado</span>
                )}
              </div>

              {product.description && (
                <div className="space-y-2">
                  <h2 className="font-semibold">Descrição</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <AddToCartButton product={product} />

              {product.magazine_available && (
                <div className="rounded-lg border border-secondary bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Disponível na Revista Natura</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Este produto está disponível na revista atual.
                        Entre em contato para mais informações sobre promoções exclusivas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((related) => {
                  const relatedPrice = related.discount_percent > 0
                    ? related.price * (1 - related.discount_percent / 100)
                    : related.price

                  return (
                    <Link
                      key={related.id}
                      href={`/produto/${related.slug}`}
                      className="group"
                    >
                      <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-3">
                        {related.images?.[0] && (
                          <img
                            src={related.images[0]}
                            alt={related.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                      <h3 className="font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors">
                        {related.name}
                      </h3>
                      <p className="text-primary font-semibold mt-1">
                        R$ {relatedPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer
        name={settings?.name}
        email={settings?.email}
        phone={settings?.phone}
        whatsapp={settings?.whatsapp}
        instagram={settings?.instagram}
      />
    </div>
  )
}
