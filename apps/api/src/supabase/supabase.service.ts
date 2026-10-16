import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente com a chave service_role: ignora RLS.
 * Toda regra de acesso (quem pode ver/alterar o quê) é aplicada nos controllers/services.
 */
@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient

  constructor(config: ConfigService) {
    this.client = createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
  }
}
