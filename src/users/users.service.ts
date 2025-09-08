import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto/users.dto'

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async create(createUserDto: CreateUserDto) {
		// Проверка на уникальность email
		const existingUser = await this.prisma.user.findUnique({
			where: { email: createUserDto.email }
		})

		if (existingUser) {
			throw new ConflictException('User with this email already exists')
		}

		// Хэширование пароля
		// const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
		const hashedPassword = createUserDto.password
		return this.prisma.user.create({
			data: {
				...createUserDto,
				password: hashedPassword
			},
			include: {
				products: true,
				rentalsAsOwner: true,
				rentalsAsRenter: true,
				reviewsWritten: true,
				reviewsReceived: true,
				payments: true
			}
		})
	}

	async findAll() {
		return this.prisma.user.findMany({
			include: {
				products: true,
				rentalsAsOwner: true,
				rentalsAsRenter: true,
				reviewsWritten: true,
				reviewsReceived: true,
				payments: true
			}
		})
	}

	async findOne(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				products: {
					include: {
						category: true,
						rentals: true,
						reviews: true
					}
				},
				rentalsAsOwner: {
					include: {
						product: true,
						renter: true,
						payment: true,
						review: true
					}
				},
				rentalsAsRenter: {
					include: {
						product: true,
						owner: true,
						payment: true,
						review: true
					}
				},
				reviewsWritten: {
					include: {
						rental: true,
						product: true,
						reviewee: true
					}
				},
				reviewsReceived: {
					include: {
						rental: true,
						product: true,
						reviewer: true
					}
				},
				payments: {
					include: {
						rental: {
							include: {
								product: true
							}
						}
					}
				}
			}
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`)
		}

		return user
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		// Если обновляется пароль, хэшируем его
		if (updateUserDto.password) {
			// const hashedPassword = await bcrypt.hash(updateUserDto.password, 10)
			const hashedPassword = updateUserDto.password
			updateUserDto.password = hashedPassword
		}

		try {
			return await this.prisma.user.update({
				where: { id },
				data: updateUserDto,
				include: {
					products: true,
					rentalsAsOwner: true,
					rentalsAsRenter: true,
					reviewsWritten: true,
					reviewsReceived: true,
					payments: true
				}
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`User with ID ${id} not found`)
			}
			throw error
		}
	}

	async remove(id: number) {
		try {
			// Удаляем связанные записи каскадно
			await this.prisma.$transaction([
				// Удаляем отзывы, где пользователь автор или получатель
				this.prisma.review.deleteMany({
					where: {
						OR: [{ reviewerId: id }, { revieweeId: id }]
					}
				}),
				// Удаляем платежи пользователя
				this.prisma.payment.deleteMany({
					where: { userId: id }
				}),
				// Удаляем аренды, где пользователь владелец или арендатор
				this.prisma.rental.deleteMany({
					where: {
						OR: [{ ownerId: id }, { renterId: id }]
					}
				}),
				// Удаляем продукты пользователя (это вызовет каскадное удаление связанных аренд и отзывов)
				this.prisma.product.deleteMany({
					where: { ownerId: id }
				}),
				// Удаляем самого пользователя
				this.prisma.user.delete({
					where: { id }
				})
			])

			return { message: 'User and all related data deleted successfully' }
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`User with ID ${id} not found`)
			}
			throw error
		}
	}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
			include: {
				products: true,
				rentalsAsOwner: true,
				rentalsAsRenter: true
			}
		})
	}
}
