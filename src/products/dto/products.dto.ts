import { PartialType } from '@nestjs/mapped-types'
import { Condition, ProductStatus } from '@prisma/client'
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator'

export class CreateProductDto {
	@IsString()
	title: string

	@IsString()
	description: string

	@IsNumber()
	price: number

	@IsNumber()
	deposit: number

	@IsNumber()
	categoryId: number

	@IsNumber()
	ownerId: number

	@IsArray()
	@IsString({ each: true })
	images: string[]

	@IsOptional()
	@IsEnum(Condition)
	condition?: Condition

	@IsOptional()
	@IsEnum(ProductStatus)
	status?: ProductStatus

	@IsString()
	location: string

	@IsOptional()
	features?: any
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
