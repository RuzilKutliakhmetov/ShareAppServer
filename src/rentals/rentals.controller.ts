import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { CreateRentalDto, UpdateRentalDto } from './dto/rentals.dto'
import { RentalsService } from './rentals.service'

@Controller('rentals')
export class RentalsController {
	constructor(private readonly rentalsService: RentalsService) {}

	@Post()
	create(@Body() createRentalDto: CreateRentalDto) {
		return this.rentalsService.create(createRentalDto)
	}

	@Get()
	findAll() {
		return this.rentalsService.findAll()
	}

	@Get('owner/:ownerId')
	findByOwner(@Param('ownerId') ownerId: string) {
		return this.rentalsService.findByOwner(+ownerId)
	}

	@Get('renter/:renterId')
	findByRenter(@Param('renterId') renterId: string) {
		return this.rentalsService.findByRenter(+renterId)
	}

	@Get('product/:productId')
	findByProduct(@Param('productId') productId: string) {
		return this.rentalsService.findByProduct(+productId)
	}

	@Get('status/:status')
	findByStatus(@Param('status') status: string) {
		return this.rentalsService.findByStatus(status)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.rentalsService.findOne(+id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateRentalDto: UpdateRentalDto) {
		return this.rentalsService.update(+id, updateRentalDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.rentalsService.remove(+id)
	}
}
