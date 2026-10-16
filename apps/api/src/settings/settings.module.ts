import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileInterceptor } from '@nestjs/platform-express'
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator'
import type { ConsultantSettings, ConsultantSettingsInput } from '@loja/shared'
import { AdminOnly } from '../auth/auth.decorators'
import { SupabaseService } from '../supabase/supabase.service'
import { throwSupabaseError } from '../common/supabase-error'

export class UpdateSettingsDto implements ConsultantSettingsInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio: string | null

  @IsOptional()
  @IsUrl()
  photo_url: string | null

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone: string | null

  @IsOptional()
  @IsEmail()
  email: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  instagram: string | null

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp: string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  years_experience: number | null
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

@Injectable()
export class SettingsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  private get db() {
    return this.supabase.client
  }

  async get(): Promise<ConsultantSettings | null> {
    const { data, error } = await this.db
      .from('consultant_settings')
      .select('*')
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (error) throwSupabaseError(error)
    return data
  }

  async save(dto: UpdateSettingsDto): Promise<ConsultantSettings> {
    const current = await this.get()
    const values = { ...dto, updated_at: new Date().toISOString() }

    const query = current
      ? this.db.from('consultant_settings').update(values).eq('id', current.id)
      : this.db.from('consultant_settings').insert(values)

    const { data, error } = await query.select().single()
    if (error) throwSupabaseError(error, 'Erro ao salvar configurações')
    return data
  }

  async uploadPhoto(file: Express.Multer.File): Promise<{ url: string }> {
    const ext = ALLOWED_PHOTO_TYPES[file.mimetype]
    if (!ext) throw new BadRequestException('Envie uma imagem JPG, PNG ou WEBP')
    if (file.size > MAX_PHOTO_BYTES) throw new BadRequestException('A imagem deve ter no máximo 5 MB')

    const bucket = this.config.get<string>('SUPABASE_STORAGE_BUCKET', 'consultant-assets')
    const path = `consultant-photo.${ext}`

    const { error } = await this.db.storage
      .from(bucket)
      .upload(path, file.buffer, { upsert: true, contentType: file.mimetype })

    if (error) throw new BadRequestException(`Erro ao enviar foto: ${error.message}`)

    const { data } = this.db.storage.from(bucket).getPublicUrl(path)
    // O nome do arquivo é fixo; o parâmetro evita que o navegador/CDN mostre a foto antiga
    return { url: `${data.publicUrl}?v=${Date.now()}` }
  }
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get()
  }
}

@AdminOnly()
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Put()
  save(@Body() dto: UpdateSettingsDto) {
    return this.settings.save(dto)
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_BYTES } }))
  uploadPhoto(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')
    return this.settings.uploadPhoto(file)
  }
}

@Module({
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
