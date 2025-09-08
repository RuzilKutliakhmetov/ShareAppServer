import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateRentalDto, UpdateRentalDto } from './dto/rentals.dto'

@Injectable()
export class RentalsService {
	constructor(private prisma: PrismaService) {}

	async create(createRentalDto: CreateRentalDto) {
		// Проверяем существование связанных сущностей
		const [product, owner, renter] = await Promise.all([
			this.prisma.product.findUnique({
				where: { id: createRentalDto.productId }
			}),
			this.prisma.user.findUnique({ where: { id: createRentalDto.ownerId } }),
			this.prisma.user.findUnique({ where: { id: createRentalDto.renterId } })
		])

		if (!product) {
			throw new NotFoundException(
				`Product with ID ${createRentalDto.productId} not found`
			)
		}
		if (!owner) {
			throw new NotFoundException(
				`Owner with ID ${createRentalDto.ownerId} not found`
			)
		}
		if (!renter) {
			throw new NotFoundException(
				`Renter with ID ${createRentalDto.renterId} not found`
			)
		}

		// Проверяем, что владелец действительно владеет продуктом
		if (product.ownerId !== createRentalDto.ownerId) {
			throw new ConflictException(
				'Product does not belong to the specified owner'
			)
		}

		// Проверяем доступность продукта
		if (product.status !== 'AVAILABLE') {
			throw new ConflictException('Product is not available for rental')
		}

		return this.prisma.$transaction(async tx => {
			// Создаем аренду
			const rental = await tx.rental.create({
				data: createRentalDto,
				include: {
					product: true,
					owner: true,
					renter: true,
					payment: true,
					review: true
				}
			})

			// Обновляем статус продукта
			await tx.product.update({
				where: { id: createRentalDto.productId },
				data: { status: 'RENTED' }
			})

			return rental
		})
	}

	async findAll() {
		return this.prisma.rental.findMany({
			include: {
				product: {
					include: {
						category: true,
						owner: true
					}
				},
				owner: true,
				renter: true,
				payment: true,
				review: true
			}
		})
	}

	async findOne(id: number) {
		const rental = await this.prisma.rental.findUnique({
			where: { id },
			include: {
				product: {
					include: {
						category: true,
						owner: true
					}
				},
				owner: true,
				renter: true,
				payment: true,
				review: {
					include: {
						reviewer: true,
						reviewee: true
					}
				}
			}
		})

		if (!rental) {
			throw new NotFoundException(`Rental with ID ${id} not found`)
		}

		return rental
	}

	async update(id: number, updateRentalDto: UpdateRentalDto) {
		// Проверяем существование связанных сущностей, если они обновляются
		if (updateRentalDto.productId) {
			const product = await this.prisma.product.findUnique({
				where: { id: updateRentalDto.productId }
			})
			if (!product) {
				throw new NotFoundException(
					`Product with ID ${updateRentalDto.productId} not found`
				)
			}
		}

		if (updateRentalDto.ownerId) {
			const owner = await this.prisma.user.findUnique({
				where: { id: updateRentalDto.ownerId }
			})
			if (!owner) {
				throw new NotFoundException(
					`Owner with ID ${updateRentalDto.ownerId} not found`
				)
			}
		}

		if (updateRentalDto.renterId) {
			const renter = await this.prisma.user.findUnique({
				where: { id: updateRentalDto.renterId }
			})
			if (!renter) {
				throw new NotFoundException(
					`Renter with ID ${updateRentalDto.renterId} not found`
				)
			}
		}

		try {
			return await this.prisma.rental.update({
				where: { id },
				data: updateRentalDto,
				include: {
					product: true,
					owner: true,
					renter: true,
					payment: true,
					review: true
				}
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Rental with ID ${id} not found`)
			}
			throw error
		}
	}

	async remove(id: number) {
		const rental = await this.prisma.rental.findUnique({
			where: { id },
			include: {
				payment: true,
				review: true
			}
		})

		if (!rental) {
			throw new NotFoundException(`Rental with ID ${id} not found`)
		}

		try {
			return await this.prisma.$transaction(async tx => {
				// Удаляем связанные платежи и отзывы
				if (rental.payment) {
					await tx.payment.delete({ where: { id: rental.payment.id } })
				}
				if (rental.review) {
					await tx.review.delete({ where: { id: rental.review.id } })
				}

				// Обновляем статус продукта обратно на AVAILABLE
				await tx.product.update({
					where: { id: rental.productId },
					data: { status: 'AVAILABLE' }
				})

				// Удаляем аренду
				return await tx.rental.delete({ where: { id } })
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Rental with ID ${id} not found`)
			}
			throw error
		}
	}
}
