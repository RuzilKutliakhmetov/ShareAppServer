import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { PaymentsModule } from './payments/payments.module'
import { ProductsModule } from './products/products.module'
import { RentalsModule } from './rentals/rentals.module'
import { ReviewsModule } from './reviews/reviews.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		UsersModule,
		ProductsModule,
		CategoriesModule,
		RentalsModule,
		ReviewsModule,
		PaymentsModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
