import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { CreateProductDto, UpdateProductDto } from './dto/products.dto'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto)
	}

	@Get()
	findAll() {
		return this.productsService.findAll()
	}

	@Get('category/:categoryId')
	findByCategory(@Param('categoryId') categoryId: string) {
		return this.productsService.findByCategory(+categoryId)
	}

	@Get('owner/:ownerId')
	findByOwner(@Param('ownerId') ownerId: string) {
		return this.productsService.findByOwner(+ownerId)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.productsService.findOne(+id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
		return this.productsService.update(+id, updateProductDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.productsService.remove(+id)
	}
}
