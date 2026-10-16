import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common'
import type { User } from '@supabase/supabase-js'
import { AuthGuard, type AuthenticatedRequest } from './auth.guard'

import { ADMIN_ONLY_KEY } from './auth.constants'

/** Exige usuário logado. */
export const Authenticated = () => applyDecorators(UseGuards(AuthGuard))

/** Exige usuário logado com app_metadata.is_admin = true. */
export const AdminOnly = () => applyDecorators(SetMetadata(ADMIN_ONLY_KEY, true), UseGuards(AuthGuard))

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User => ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
)
