import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto'

@Injectable()
export class ReviewsService {
	constructor(private prisma: PrismaService) {}

	async create(createReviewDto: CreateReviewDto) {
		// Проверяем существование связанных сущностей
		const [rental, product, reviewer, reviewee] = await Promise.all([
			this.prisma.rental.findUnique({
				where: { id: createReviewDto.rentalId }
			}),
			this.prisma.product.findUnique({
				where: { id: createReviewDto.productId }
			}),
			this.prisma.user.findUnique({
				where: { id: createReviewDto.reviewerId }
			}),
			this.prisma.user.findUnique({ where: { id: createReviewDto.revieweeId } })
		])

		if (!rental) {
			throw new NotFoundException(
				`Rental with ID ${createReviewDto.rentalId} not found`
			)
		}
		if (!product) {
			throw new NotFoundException(
				`Product with ID ${createReviewDto.productId} not found`
			)
		}
		if (!reviewer) {
			throw new NotFoundException(
				`Reviewer with ID ${createReviewDto.reviewerId} not found`
			)
		}
		if (!reviewee) {
			throw new NotFoundException(
				`Reviewee with ID ${createReviewDto.revieweeId} not found`
			)
		}

		// Проверяем, что аренда завершена
		if (rental.status !== 'COMPLETED') {
			throw new ConflictException('Can only review completed rentals')
		}

		// Проверяем, что отзыв еще не оставлен для этой аренды
		const existingReview = await this.prisma.review.findUnique({
			where: { rentalId: createReviewDto.rentalId }
		})

		if (existingReview) {
			throw new ConflictException('Review already exists for this rental')
		}

		return this.prisma.review.create({
			data: createReviewDto,
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				product: true,
				reviewer: true,
				reviewee: true
			}
		})
	}

	async findAll() {
		return this.prisma.review.findMany({
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				product: true,
				reviewer: true,
				reviewee: true
			}
		})
	}

	async findOne(id: number) {
		const review = await this.prisma.review.findUnique({
			where: { id },
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				product: true,
				reviewer: true,
				reviewee: true
			}
		})

		if (!review) {
			throw new NotFoundException(`Review with ID ${id} not found`)
		}

		return review
	}

	async update(id: number, updateReviewDto: UpdateReviewDto) {
		// Проверяем существование связанных сущностей, если они обновляются
		if (updateReviewDto.rentalId) {
			const rental = await this.prisma.rental.findUnique({
				where: { id: updateReviewDto.rentalId }
			})
			if (!rental) {
				throw new NotFoundException(
					`Rental with ID ${updateReviewDto.rentalId} not found`
				)
			}
		}

		if (updateReviewDto.reviewerId) {
			const reviewer = await this.prisma.user.findUnique({
				where: { id: updateReviewDto.reviewerId }
			})
			if (!reviewer) {
				throw new NotFoundException(
					`Reviewer with ID ${updateReviewDto.reviewerId} not found`
				)
			}
		}

		if (updateReviewDto.revieweeId) {
			const reviewee = await this.prisma.user.findUnique({
				where: { id: updateReviewDto.revieweeId }
			})
			if (!reviewee) {
				throw new NotFoundException(
					`Reviewee with ID ${updateReviewDto.revieweeId} not found`
				)
			}
		}

		try {
			return await this.prisma.review.update({
				where: { id },
				data: updateReviewDto,
				include: {
					rental: true,
					product: true,
					reviewer: true,
					reviewee: true
				}
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Review with ID ${id} not found`)
			}
			throw error
		}
	}

	async remove(id: number) {
		try {
			return await this.prisma.review.delete({
				where: { id }
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Review with ID ${id} not found`)
			}
			throw error
		}
	}

	async findByProduct(productId: number) {
		const product = await this.prisma.product.findUnique({
			where: { id: productId }
		})

		if (!product) {
			throw new NotFoundException(`Product with ID ${productId} not found`)
		}

		return this.prisma.review.findMany({
			where: { productId },
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				product: true,
				reviewer: true,
				reviewee: true
			}
		})
	}

	async findByUser(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		return this.prisma.review.findMany({
			where: {
				OR: [{ reviewerId: userId }, { revieweeId: userId }]
			},
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				product: true,
				reviewer: true,
				reviewee: true
			}
		})
	}

	async findByRating(minRating: number, maxRating?: number) {
		const whereCondition: any = {
			rating: {
				gte: minRating
			}
		}

		if (maxRating !== undefined) {
			whereCondition.rating.lte = maxRating
		}

		return this.prisma.review.findMany({
			where: whereCondition,
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				product: true,
				reviewer: true,
				reviewee: true
			}
		})
	}
}
