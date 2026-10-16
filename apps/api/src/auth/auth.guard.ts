import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { User } from '@supabase/supabase-js'
import type { Request } from 'express'
import { SupabaseService } from '../supabase/supabase.service'
import { ADMIN_ONLY_KEY } from './auth.constants'

export interface AuthenticatedRequest extends Request {
  user: User
}

export function isAdmin(user: User) {
  // app_metadata só pode ser alterado com a service_role, ao contrário de user_metadata
  return user.app_metadata?.is_admin === true
}

/** Valida o JWT do Supabase enviado em `Authorization: Bearer <token>`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const [scheme, token] = request.headers.authorization?.split(' ') ?? []

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Não autenticado')
    }

    const { data, error } = await this.supabase.client.auth.getUser(token)
    if (error || !data.user) {
      throw new UnauthorizedException('Sessão inválida ou expirada')
    }

    request.user = data.user

    const adminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (adminOnly && !isAdmin(data.user)) {
      throw new ForbiddenException('Acesso restrito ao administrador')
    }

    return true
  }
}
