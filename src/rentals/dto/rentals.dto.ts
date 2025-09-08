import { PartialType } from '@nestjs/mapped-types'
import { RentalStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator'

export class CreateRentalDto {
	@IsNumber()
	productId: number

	@IsNumber()
	ownerId: number

	@IsNumber()
	renterId: number

	@IsDateString()
	startDate: Date

	@IsDateString()
	endDate: Date

	@IsNumber()
	totalPrice: number

	@IsOptional()
	@IsEnum(RentalStatus)
	status?: RentalStatus
}

export class UpdateRentalDto extends PartialType(CreateRentalDto) {}
