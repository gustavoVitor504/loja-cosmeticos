'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount_percent: '0',
    category_id: '',
    stock: '0',
    is_active: true,
    magazine_available: false,
    images: [] as string[],
  })
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      if (cats) setCategories(cats)

      // Fetch product
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !product) {
        toast.error('Produto não encontrado')
        router.push('/admin/produtos')
        return
      }

      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: String(product.price),
        discount_percent: String(product.discount_percent),
        category_id: product.category_id || '',
        stock: String(product.stock),
        is_active: product.is_active,
        magazine_available: product.magazine_available,
        images: product.images || [],
      })
      setIsFetching(false)
    }
    
    fetchData()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }))
    setNewImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        discount_percent: parseInt(formData.discount_percent) || 0,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        is_active: formData.is_active,
        magazine_available: formData.magazine_available,
        images: formData.images,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)

      if (error) {
        toast.error('Erro ao atualizar produto')
        return
      }

      toast.success('Produto atualizado com sucesso!')
      router.push('/admin/produtos')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao atualizar produto')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link 
        href="/admin/produtos" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos produtos
      </Link>

      <h1 className="text-3xl font-bold mb-8">Editar Produto</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome do Produto</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="slug">Slug (URL)</FieldLabel>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Descrição</FieldLabel>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Preço e Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field>
                      <FieldLabel htmlFor="price">Preço (R$)</FieldLabel>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="discount_percent">Desconto (%)</FieldLabel>
                      <Input
                        id="discount_percent"
                        name="discount_percent"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_percent}
                        onChange={handleChange}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="stock">Estoque</FieldLabel>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="URL da imagem"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddImage} variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Imagem ${index + 1}`}
                            className="aspect-square w-full object-cover rounded-lg bg-muted"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p>Adicione URLs de imagens do produto</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organização</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Categoria</FieldLabel>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ativo</p>
                      <p className="text-sm text-muted-foreground">
                        Produto visível na loja
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Disponível na Revista</p>
                      <p className="text-sm text-muted-foreground">
                        Produto está na revista atual
                      </p>
                    </div>
                    <Switch
                      checked={formData.magazine_available}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, magazine_available: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
