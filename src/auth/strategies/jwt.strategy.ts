import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET || 'secret'
		})
	}

	async validate(payload: { id: number }) {
		const user = await this.usersService.findOne(payload.id)

		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role
		}
	}
}
