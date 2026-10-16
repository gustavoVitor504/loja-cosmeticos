export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string
}

export async function apiFetch<T>(path: string, { body, token, headers, ...init }: ApiOptions = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  })

  if (!response.ok) {
    let message = 'Erro ao comunicar com o servidor'
    try {
      const data = await response.json()
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message)
    } catch {
      // resposta sem JSON
    }
    throw new ApiError(message, response.status)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}
