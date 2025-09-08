import { PartialType } from '@nestjs/mapped-types'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCategoryDto {
	@IsString()
	name: string

	@IsString()
	slug: string

	@IsOptional()
	@IsNumber()
	parentId?: number
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
