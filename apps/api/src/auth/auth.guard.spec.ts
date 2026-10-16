import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from './auth.guard'
import type { SupabaseService } from '../supabase/supabase.service'

function setup(user: object | null, adminOnly: boolean) {
  const supabase = {
    client: { auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: user ? null : {} }) } },
  } as unknown as SupabaseService
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(adminOnly) } as unknown as Reflector
  return new AuthGuard(supabase, reflector)
}

function context(authorization?: string) {
  const request: Record<string, unknown> = { headers: { authorization } }
  return {
    request,
    ctx: {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => null,
      getClass: () => null,
    } as unknown as ExecutionContext,
  }
}

describe('AuthGuard', () => {
  it('rejeita requisição sem token', async () => {
    await expect(setup({ id: 'u1' }, false).canActivate(context().ctx)).rejects.toThrow(UnauthorizedException)
  })

  it('rejeita token inválido', async () => {
    await expect(setup(null, false).canActivate(context('Bearer x').ctx)).rejects.toThrow(UnauthorizedException)
  })

  it('anexa o usuário na requisição', async () => {
    const user = { id: 'u1', app_metadata: {} }
    const { request, ctx } = context('Bearer x')
    await expect(setup(user, false).canActivate(ctx)).resolves.toBe(true)
    expect(request.user).toBe(user)
  })

  it('ignora is_admin em user_metadata (editável pelo próprio usuário)', async () => {
    const user = { id: 'u1', app_metadata: {}, user_metadata: { is_admin: true } }
    await expect(setup(user, true).canActivate(context('Bearer x').ctx)).rejects.toThrow(ForbiddenException)
  })

  it('libera rota admin com app_metadata.is_admin', async () => {
    const user = { id: 'u1', app_metadata: { is_admin: true } }
    await expect(setup(user, true).canActivate(context('Bearer x').ctx)).resolves.toBe(true)
  })
})
