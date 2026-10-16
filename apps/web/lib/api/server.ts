import { createClient } from '@/lib/supabase/server'
import type { ConsultantSettings } from '@/lib/types'
import { ApiError, apiFetch, type ApiOptions } from './core'

interface ServerApiOptions extends ApiOptions {
  /** false = rota pública, não lê os cookies de sessão */
  auth?: boolean
}

async function getAccessToken() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

/** Chamada à API a partir de Server Components, usando o token da sessão do usuário. */
export async function serverApi<T>(path: string, { auth = true, ...options }: ServerApiOptions = {}) {
  const token = auth ? await getAccessToken() : undefined
  return apiFetch<T>(path, { cache: 'no-store', ...options, token })
}

/** Igual a serverApi, mas devolve null em 404 (para usar com notFound()). */
export async function serverApiOrNull<T>(path: string, options?: ServerApiOptions) {
  try {
    return await serverApi<T>(path, options)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** Dados públicos da consultora (rodapé, página Sobre). */
export function getSettings() {
  return serverApi<ConsultantSettings | null>('/settings', { auth: false })
}
