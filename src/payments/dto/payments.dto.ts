import { PartialType } from '@nestjs/mapped-types'
import { PaymentMethod, PaymentStatus } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePaymentDto {
	@IsNumber()
	amount: number

	@IsNumber()
	rentalId: number

	@IsNumber()
	userId: number

	@IsEnum(PaymentMethod)
	method: PaymentMethod

	@IsOptional()
	@IsEnum(PaymentStatus)
	status?: PaymentStatus

	@IsOptional()
	@IsString()
	transactionId?: string
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
