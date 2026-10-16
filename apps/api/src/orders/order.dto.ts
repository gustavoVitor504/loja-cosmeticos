import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import {
  ORDER_STATUSES,
  type CheckoutInput,
  type CheckoutItemInput,
  type OrderStatus,
  type UpdateOrderStatusInput,
} from '@loja/shared'

export class CheckoutItemDto implements CheckoutItemInput {
  @IsUUID()
  productId: string

  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number
}

export class CheckoutDto implements CheckoutInput {
  @IsArray()
  @ArrayMinSize(1, { message: 'Carrinho vazio' })
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[]

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  customerName: string

  @IsEmail()
  customerEmail: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  customerPhone: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shippingAddress: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string
}

export class UpdateOrderStatusDto implements UpdateOrderStatusInput {
  @IsIn(ORDER_STATUSES)
  status: OrderStatus

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}
