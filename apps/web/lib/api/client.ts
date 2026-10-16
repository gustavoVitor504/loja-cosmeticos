import { createClient } from '@/lib/supabase/client'
import { apiFetch, type ApiOptions } from './core'

export { ApiError } from './core'

/** Chamada à API a partir de Client Components, usando o token da sessão do usuário. */
export async function clientApi<T>(path: string, options: ApiOptions = {}) {
  const { data } = await createClient().auth.getSession()
  return apiFetch<T>(path, { ...options, token: data.session?.access_token })
}
