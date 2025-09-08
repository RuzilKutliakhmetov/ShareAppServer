import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.dto'
import { PaymentsService } from './payments.service'

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post()
	create(@Body() createPaymentDto: CreatePaymentDto) {
		return this.paymentsService.create(createPaymentDto)
	}

	@Get()
	findAll() {
		return this.paymentsService.findAll()
	}

	@Get('user/:userId')
	findByUser(@Param('userId') userId: string) {
		return this.paymentsService.findByUser(+userId)
	}

	@Get('rental/:rentalId')
	findByRental(@Param('rentalId') rentalId: string) {
		return this.paymentsService.findByRental(+rentalId)
	}

	@Get('status/:status')
	findByStatus(@Param('status') status: string) {
		return this.paymentsService.findByStatus(status)
	}

	@Get('method/:method')
	findByMethod(@Param('method') method: string) {
		return this.paymentsService.findByMethod(method)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.paymentsService.findOne(+id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
		return this.paymentsService.update(+id, updatePaymentDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.paymentsService.remove(+id)
	}
}
