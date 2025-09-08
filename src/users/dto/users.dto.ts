import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
	@IsEmail()
	email: string

	@IsString()
	password: string

	@IsString()
	name: string

	@IsOptional()
	@IsString()
	phone?: string

	@IsOptional()
	@IsString()
	avatar?: string

	@IsOptional()
	@IsBoolean()
	verified?: boolean
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
