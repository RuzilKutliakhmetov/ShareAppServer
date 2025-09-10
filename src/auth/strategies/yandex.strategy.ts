import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-yandex'

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
	constructor(private configService: ConfigService) {
		super({
			clientID: configService.getOrThrow('YANDEX_CLIENT_ID'),
			clientSecret: configService.getOrThrow('YANDEX_CLIENT_SECRET'),
			callbackURL: configService.get('SERVER_URL') + '/auth/yandex/callback'
		})
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: any,
		done: Function
	) {
		const { id, displayName, emails, photos } = profile

		const user = {
			id: id,
			email: emails[0].value,
			name: displayName,
			avatar: photos[0].value,
			accessToken
		}

		done(null, user)
	}
}
