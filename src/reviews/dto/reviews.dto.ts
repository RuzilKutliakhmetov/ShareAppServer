import { PartialType } from '@nestjs/mapped-types'
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateReviewDto {
	@IsNumber()
	@Min(1)
	@Max(5)
	rating: number

	@IsOptional()
	@IsString()
	comment?: string

	@IsNumber()
	rentalId: number

	@IsNumber()
	productId: number

	@IsNumber()
	reviewerId: number

	@IsNumber()
	revieweeId: number
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
