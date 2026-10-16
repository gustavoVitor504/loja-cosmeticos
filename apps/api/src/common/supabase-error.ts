import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import type { PostgrestError } from '@supabase/supabase-js'

const logger = new Logger('Supabase')

/** Converte erros do Postgres/PostgREST em exceções HTTP. */
export function throwSupabaseError(error: PostgrestError, fallback = 'Erro interno'): never {
  switch (error.code) {
    // RAISE EXCEPTION ... USING ERRCODE = 'P0001' nas funções SQL = erro de regra de negócio
    case 'P0001':
      throw new BadRequestException(error.message)
    case 'P0002':
    case 'PGRST116':
      throw new NotFoundException(error.code === 'P0002' ? error.message : 'Registro não encontrado')
    case '23505':
      throw new ConflictException('Já existe um registro com esses dados (ex.: slug duplicado)')
    case '23503':
      throw new BadRequestException('Registro relacionado não encontrado')
    default:
      logger.error(`${error.code}: ${error.message}`)
      throw new InternalServerErrorException(fallback)
  }
}
