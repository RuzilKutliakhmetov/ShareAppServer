import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AuthDto } from './dto/auth.dto'
import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService, private jwt: JwtService) { }

	async register(dto: AuthDto) {
		const oldUser = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		})

		if (oldUser) throw new BadRequestException('Пользователь уже существует')

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: faker.person.firstName(),
				avatar: faker.image.avatar(),
				phone: faker.phone.number(),
				password: await hash(dto.password),
				role: 'USER',
				verified: false
			}
		})
		const tokens = await this.issueTokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}

		return user
	}

	private async issueTokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private returnUserFields(user: Partial<User>) {
		return {
			id: user.id,
			email: user.email
		}
	}
}
