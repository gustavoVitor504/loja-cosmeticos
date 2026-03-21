'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'
import { toast } from 'sonner'
import { createProduct } from '../actions'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' ? { slug: generateSlug(value) } : {}),
    }))
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
      }

      const result = await createProduct(productData)

      if (result.error) {
        if (result.error.code === '23505') {
          toast.error('Já existe um produto com este slug')
        } else {
          toast.error('Erro ao criar produto')
        }
        return
      }

      toast.success('Produto criado com sucesso!')
      router.push('/admin/produtos')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao criar produto')
    } finally {
      setIsLoading(false)
    }
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

      <h1 className="text-3xl font-bold mb-8">Novo Produto</h1>

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
              {isLoading ? 'Criando...' : 'Criar Produto'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
