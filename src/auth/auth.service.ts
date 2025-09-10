import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { Response } from 'express'
import { UsersService } from '../users/users.service'
import { AuthDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService
	) {}

	public readonly REFRESH_TOKEN_NAME = 'refreshToken'

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto.email, dto.password)
		const tokens = this.issueTokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	async register(dto: AuthDto) {
		const existingUser = await this.usersService.findByEmail(dto.email)
		if (existingUser) {
			throw new ConflictException('User with this email already exists')
		}

		const hashedPassword = await bcrypt.hash(dto.password, 10)

		const user = await this.usersService.create({
			email: dto.email,
			password: hashedPassword,
			name: dto.email.split('@')[0] // Default name from email
		})

		const tokens = this.issueTokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	async getNewTokens(refreshToken: string) {
		if (!refreshToken) {
			throw new UnauthorizedException('Please sign in!')
		}

		const result = await this.jwtService.verifyAsync(refreshToken)
		if (!result) {
			throw new UnauthorizedException('Invalid token or expired!')
		}

		const user = await this.usersService.findOne(result.id)
		const tokens = this.issueTokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	async validateOAuthLogin(req: any) {
		let user = await this.usersService.findByEmail(req.user.email)

		if (!user) {
			user = await this.usersService.create({
				email: req.user.email,
				password: await bcrypt.hash(Math.random().toString(36), 10),
				name: req.user.name || req.user.email.split('@')[0],
				avatar: req.user.avatar,
				verified: true
			})
		}

		const tokens = this.issueTokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	private async validateUser(email: string, password: string) {
		const user = await this.usersService.findByEmail(email)
		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		const isValidPassword = await bcrypt.compare(password, user.password)
		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password')
		}

		return user
	}

	private issueTokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwtService.sign(data, {
			expiresIn: '15m'
		})

		const refreshToken = this.jwtService.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private returnUserFields(user: any) {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
			role: user.role,
			verified: user.verified
		}
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + 7)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: process.env.DOMAIN || 'localhost',
			expires: expiresIn,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: process.env.DOMAIN || 'localhost',
			expires: new Date(0),
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		})
	}
}
