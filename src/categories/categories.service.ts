import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto'

@Injectable()
export class CategoriesService {
	constructor(private prisma: PrismaService) {}

	async create(createCategoryDto: CreateCategoryDto) {
		// Проверка на уникальность имени и slug
		const [existingName, existingSlug] = await Promise.all([
			this.prisma.category.findUnique({
				where: { name: createCategoryDto.name }
			}),
			this.prisma.category.findUnique({
				where: { slug: createCategoryDto.slug }
			})
		])

		if (existingName) {
			throw new ConflictException('Category with this name already exists')
		}
		if (existingSlug) {
			throw new ConflictException('Category with this slug already exists')
		}

		// Проверка родительской категории, если указана
		if (createCategoryDto.parentId) {
			const parent = await this.prisma.category.findUnique({
				where: { id: createCategoryDto.parentId }
			})
			if (!parent) {
				throw new NotFoundException(
					`Parent category with ID ${createCategoryDto.parentId} not found`
				)
			}
		}

		return this.prisma.category.create({
			data: createCategoryDto,
			include: {
				parent: true,
				children: true,
				products: {
					include: {
						owner: true,
						rentals: true,
						reviews: true
					}
				}
			}
		})
	}

	async findAll() {
		return this.prisma.category.findMany({
			include: {
				parent: true,
				children: true,
				products: true
			}
		})
	}

	async findOne(id: number) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			include: {
				parent: true,
				children: true,
				products: {
					include: {
						owner: true,
						rentals: {
							include: {
								owner: true,
								renter: true
							}
						},
						reviews: true
					}
				}
			}
		})

		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`)
		}

		return category
	}

	async findBySlug(slug: string) {
		const category = await this.prisma.category.findUnique({
			where: { slug },
			include: {
				parent: true,
				children: true,
				products: {
					include: {
						owner: true,
						rentals: {
							include: {
								owner: true,
								renter: true
							}
						},
						reviews: true
					}
				}
			}
		})

		if (!category) {
			throw new NotFoundException(`Category with slug ${slug} not found`)
		}

		return category
	}

	async update(id: number, updateCategoryDto: UpdateCategoryDto) {
		// Проверка на уникальность, если обновляются name или slug
		if (updateCategoryDto.name) {
			const existing = await this.prisma.category.findFirst({
				where: {
					name: updateCategoryDto.name,
					NOT: { id }
				}
			})
			if (existing) {
				throw new ConflictException('Category with this name already exists')
			}
		}

		if (updateCategoryDto.slug) {
			const existing = await this.prisma.category.findFirst({
				where: {
					slug: updateCategoryDto.slug,
					NOT: { id }
				}
			})
			if (existing) {
				throw new ConflictException('Category with this slug already exists')
			}
		}

		// Проверка родительской категории, если обновляется
		if (updateCategoryDto.parentId) {
			if (updateCategoryDto.parentId === id) {
				throw new ConflictException('Category cannot be its own parent')
			}

			const parent = await this.prisma.category.findUnique({
				where: { id: updateCategoryDto.parentId }
			})
			if (!parent) {
				throw new NotFoundException(
					`Parent category with ID ${updateCategoryDto.parentId} not found`
				)
			}
		}

		try {
			return await this.prisma.category.update({
				where: { id },
				data: updateCategoryDto,
				include: {
					parent: true,
					children: true,
					products: true
				}
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Category with ID ${id} not found`)
			}
			throw error
		}
	}

	async remove(id: number) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			include: {
				products: true,
				children: true
			}
		})

		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`)
		}

		if (category.products.length > 0) {
			throw new ConflictException(
				'Cannot delete category with associated products'
			)
		}

		if (category.children.length > 0) {
			throw new ConflictException(
				'Cannot delete category with child categories'
			)
		}

		try {
			return await this.prisma.category.delete({
				where: { id }
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Category with ID ${id} not found`)
			}
			throw error
		}
	}

	async findChildren(parentId: number) {
		const parent = await this.prisma.category.findUnique({
			where: { id: parentId }
		})

		if (!parent) {
			throw new NotFoundException(
				`Parent category with ID ${parentId} not found`
			)
		}

		return this.prisma.category.findMany({
			where: { parentId },
			include: {
				children: true,
				products: true
			}
		})
	}
}
