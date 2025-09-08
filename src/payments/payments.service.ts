import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.dto'

@Injectable()
export class PaymentsService {
	constructor(private prisma: PrismaService) {}

	async create(createPaymentDto: CreatePaymentDto) {
		// Проверяем существование связанных сущностей
		const [rental, user] = await Promise.all([
			this.prisma.rental.findUnique({
				where: { id: createPaymentDto.rentalId }
			}),
			this.prisma.user.findUnique({ where: { id: createPaymentDto.userId } })
		])

		if (!rental) {
			throw new NotFoundException(
				`Rental with ID ${createPaymentDto.rentalId} not found`
			)
		}
		if (!user) {
			throw new NotFoundException(
				`User with ID ${createPaymentDto.userId} not found`
			)
		}

		// Проверяем, что платеж еще не существует для этой аренды
		const existingPayment = await this.prisma.payment.findUnique({
			where: { rentalId: createPaymentDto.rentalId }
		})

		if (existingPayment) {
			throw new ConflictException('Payment already exists for this rental')
		}

		return this.prisma.payment.create({
			data: createPaymentDto,
			include: {
				rental: {
					include: {
						product: true,
						owner: true,
						renter: true
					}
				},
				user: true
			}
		})
	}

	async findOne(id: number) {
		const payment = await this.prisma.payment.findUnique({
			where: { id },
			include: {
				rental: {
					include: {
						product: {
							include: {
								category: true,
								owner: true
							}
						},
						owner: true,
						renter: true,
						review: true
					}
				},
				user: true
			}
		})

		if (!payment) {
			throw new NotFoundException(`Payment with ID ${id} not found`)
		}

		return payment
	}

	async update(id: number, updatePaymentDto: UpdatePaymentDto) {
		// Проверяем существование связанных сущностей, если они обновляются
		if (updatePaymentDto.rentalId) {
			const rental = await this.prisma.rental.findUnique({
				where: { id: updatePaymentDto.rentalId }
			})
			if (!rental) {
				throw new NotFoundException(
					`Rental with ID ${updatePaymentDto.rentalId} not found`
				)
			}
		}

		if (updatePaymentDto.userId) {
			const user = await this.prisma.user.findUnique({
				where: { id: updatePaymentDto.userId }
			})
			if (!user) {
				throw new NotFoundException(
					`User with ID ${updatePaymentDto.userId} not found`
				)
			}
		}

		try {
			return await this.prisma.payment.update({
				where: { id },
				data: updatePaymentDto,
				include: {
					rental: true,
					user: true
				}
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Payment with ID ${id} not found`)
			}
			throw error
		}
	}

	async remove(id: number) {
		try {
			return await this.prisma.payment.delete({
				where: { id }
			})
		} catch (error) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Payment with ID ${id} not found`)
			}
			throw error
		}
	}
}
