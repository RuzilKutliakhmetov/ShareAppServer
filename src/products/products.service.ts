import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateProductDto, UpdateProductDto } from './dto/products.dto'

@Injectable()
export class ProductsService {
	constructor(private prisma: PrismaService) {}

	async create(createProductDto: CreateProductDto) {
		// Проверяем существование владельца и категории
		const [owner, category] = await Promise.all([
			this.prisma.user.findUnique({ where: { id: createProductDto.ownerId } }),
			this.prisma.category.findUnique({
				where: { id: createProductDto.categoryId }
			})
		])

		if (!owner) {
			throw new NotFoundException(
				`Owner with ID ${createProductDto.ownerId} not found`
			)
		}
		if (!category) {
			throw new NotFoundException(
				`Category with ID ${createProductDto.categoryId} not found`
			)
		}

		return this.prisma.product.create({
			data: createProductDto,
			include: {
				category: true,
				owner: true,
				rentals: {
					include: {
						owner: true,
						renter: true,
						payment: true
					}
				},
				reviews: {
					include: {
						reviewer: true,
						reviewee: true
					}
				}
			}
		})
	}

	async findAll() {
		return this.prisma.product.findMany({
			include: {
				category: true,
				owner: true,
				rentals: true,
				reviews: true
			}
		})
	}

	async findOne(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				owner: true,
				rentals: {
					include: {
						owner: true,
						renter: true,
						payment: true,
						review: true
					}
				},
				reviews: {
					include: {
						rental: true,
						reviewer: true,
						reviewee: true
					}
				}
			}
		})

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`)
		}

		return product
	}

	async update(id: number, updateProductDto: UpdateProductDto) {
		// Проверяем существование связанных сущностей, если они обновляются
		if (updateProductDto.ownerId) {
			const owner = await this.prisma.user.findUnique({
				where: { id: updateProductDto.ownerId }
			})
			if (!owner) {
				throw new NotFoundException(
					`Owner with ID ${updateProductDto.ownerId} not found`
				)
			}
		}

		if (updateProductDto.categoryId) {
			const category = await this.prisma.category.findUnique({
				where: { id: updateProductDto.categoryId }
			})
			if (!category) {
				throw new NotFoundException(
					`Category with ID ${updateProductDto.categoryId} not found`
				)
			}
		}

		try {
			return await this.prisma.product.update({
				where: { id },
				data: updateProductDto,
				include: {
					category: true,
					owner: true,
					rentals: true,
					reviews: true
				}
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Product with ID ${id} not found`)
			}
			throw error
		}
	}

	async remove(id: number) {
		try {
			// Удаляем связанные записи
			await this.prisma.$transaction([
				// Удаляем отзывы продукта
				this.prisma.review.deleteMany({
					where: { productId: id }
				}),
				// Удаляем аренды продукта (это вызовет каскадное удаление платежей и отзывов)
				this.prisma.rental.deleteMany({
					where: { productId: id }
				}),
				// Удаляем сам продукт
				this.prisma.product.delete({
					where: { id }
				})
			])

			return { message: 'Product and all related data deleted successfully' }
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Product with ID ${id} not found`)
			}
			throw error
		}
	}

	async findByCategory(categoryId: number) {
		const category = await this.prisma.category.findUnique({
			where: { id: categoryId }
		})

		if (!category) {
			throw new NotFoundException(`Category with ID ${categoryId} not found`)
		}

		return this.prisma.product.findMany({
			where: { categoryId },
			include: {
				category: true,
				owner: true,
				rentals: true,
				reviews: true
			}
		})
	}

	async findByOwner(ownerId: number) {
		const owner = await this.prisma.user.findUnique({
			where: { id: ownerId }
		})

		if (!owner) {
			throw new NotFoundException(`Owner with ID ${ownerId} not found`)
		}

		return this.prisma.product.findMany({
			where: { ownerId },
			include: {
				category: true,
				owner: true,
				rentals: true,
				reviews: true
			}
		})
	}
}
