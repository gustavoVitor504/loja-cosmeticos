'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { createClient } from '@/lib/supabase/client'
import type { ConsultantSettings } from '@/lib/types'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isFetching, setIsFetching] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo_url: '',
    phone: '',
    email: '',
    instagram: '',
    whatsapp: '',
    years_experience: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('consultant_settings')
        .select('*')
        .single()

      if (data) {
        setSettingsId(data.id)
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          photo_url: data.photo_url || '',
          phone: data.phone || '',
          email: data.email || '',
          instagram: data.instagram || '',
          whatsapp: data.whatsapp || '',
          years_experience: data.years_experience?.toString() || '',
        })
      }
      setIsFetching(false)
    }
    
    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const settingsData = {
        name: formData.name,
        bio: formData.bio || null,
        photo_url: formData.photo_url || null,
        phone: formData.phone || null,
        email: formData.email || null,
        instagram: formData.instagram || null,
        whatsapp: formData.whatsapp || null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        updated_at: new Date().toISOString(),
      }

      if (settingsId) {
        const { error } = await supabase
          .from('consultant_settings')
          .update(settingsData)
          .eq('id', settingsId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('consultant_settings')
          .insert(settingsData)
          .select()
          .single()

        if (error) throw error
        setSettingsId(data.id)
      }

      toast.success('Configurações salvas com sucesso!')
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Erro ao salvar configurações')
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
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Estes dados serão exibidos na página "Sobre" do site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="bio">Biografia</FieldLabel>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Conte um pouco sobre você e sua experiência como consultora..."
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="photo_url">URL da Foto</FieldLabel>
                  <Input
                    id="photo_url"
                    name="photo_url"
                    type="url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="years_experience">Anos de Experiência</FieldLabel>
                  <Input
                    id="years_experience"
                    name="years_experience"
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={handleChange}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Como os clientes podem entrar em contato com você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="whatsapp">WhatsApp (apenas números)</FieldLabel>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="5511999999999"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@seuinstagram"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}
