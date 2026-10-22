import { createClient } from '@/lib/supabase/server'
import type { ConsultantSettings } from '@/lib/types'
import { ApiError, apiFetch, type ApiOptions } from './core'

interface ServerApiOptions extends ApiOptions {
  auth?: boolean
}

async function getAccessToken() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

export async function serverApi<T>(path: string, { auth = true, ...options }: ServerApiOptions = {}) {
  const token = auth ? await getAccessToken() : undefined
  return apiFetch<T>(path, { cache: 'no-store', ...options, token })
}

export async function serverApiOrNull<T>(path: string, options?: ServerApiOptions) {
  try {
    return await serverApi<T>(path, options)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function getSettings() {
  return serverApi<ConsultantSettings | null>('/settings', { auth: false })
}
