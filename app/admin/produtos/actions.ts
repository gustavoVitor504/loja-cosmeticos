'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) return { error }
  
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { error }
  
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { success: true }
}

export async function createProduct(productData: any) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('products').insert(productData)
  
  if (error) return { error }
  
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { success: true }
}