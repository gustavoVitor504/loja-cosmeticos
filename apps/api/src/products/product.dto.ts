import { PartialType } from '@nestjs/mapped-types'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import type { ProductInput, SortOption } from '@loja/shared'

export class CreateProductDto implements ProductInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string

  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug: string

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description: string | null

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number

  @IsInt()
  @Min(0)
  @Max(100)
  discount_percent: number

  @IsOptional()
  @IsUUID()
  category_id: string | null

  @IsInt()
  @Min(0)
  stock: number

  @IsBoolean()
  is_active: boolean

  @IsBoolean()
  magazine_available: boolean

  @IsArray()
  @IsString({ each: true })
  images: string[]
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

const SORT_OPTIONS: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'name', 'newest']

export class ListProductsQuery {
  @IsOptional()
  @IsString()
  categoria?: string

  @IsOptional()
  @IsIn(SORT_OPTIONS)
  ordenar?: SortOption

  @IsOptional()
  @IsString()
  @MaxLength(100)
  busca?: string
}
