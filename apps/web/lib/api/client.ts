import { createClient } from '@/lib/supabase/client'
import { apiFetch, type ApiOptions } from './core'

export { ApiError } from './core'

export async function clientApi<T>(path: string, options: ApiOptions = {}) {
  const { data } = await createClient().auth.getSession()
  return apiFetch<T>(path, { ...options, token: data.session?.access_token })
}
