import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query
} from '@nestjs/common'
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto'
import { ReviewsService } from './reviews.service'

@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Post()
	create(@Body() createReviewDto: CreateReviewDto) {
		return this.reviewsService.create(createReviewDto)
	}

	@Get()
	findAll() {
		return this.reviewsService.findAll()
	}

	@Get('product/:productId')
	findByProduct(@Param('productId') productId: string) {
		return this.reviewsService.findByProduct(+productId)
	}

	@Get('user/:userId')
	findByUser(@Param('userId') userId: string) {
		return this.reviewsService.findByUser(+userId)
	}

	// Исправленный маршрут с использованием query параметров вместо path параметров
	@Get('rating/:minRating')
	findByRating(
		@Param('minRating') minRating: string,
		@Query('maxRating') maxRating?: string
	) {
		return this.reviewsService.findByRating(
			+minRating,
			maxRating ? +maxRating : undefined
		)
	}

	// Альтернативный вариант с использованием только query параметров
	@Get('rating')
	findByRatingQuery(
		@Query('minRating') minRating: string,
		@Query('maxRating') maxRating?: string
	) {
		return this.reviewsService.findByRating(
			minRating ? +minRating : 1,
			maxRating ? +maxRating : undefined
		)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.reviewsService.findOne(+id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
		return this.reviewsService.update(+id, updateReviewDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.reviewsService.remove(+id)
	}
}
