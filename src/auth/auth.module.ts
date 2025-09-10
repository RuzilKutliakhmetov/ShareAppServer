import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { YandexStrategy } from './strategies/yandex.strategy'

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'secret',
			signOptions: { expiresIn: '15m' }
		})
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, YandexStrategy],
	exports: [AuthService]
})
export class AuthModule {}
