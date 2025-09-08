import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto'

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post()
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto)
	}

	@Get()
	findAll() {
		return this.categoriesService.findAll()
	}

	@Get('parent/:parentId')
	findChildren(@Param('parentId') parentId: string) {
		return this.categoriesService.findChildren(+parentId)
	}

	@Get('slug/:slug')
	findBySlug(@Param('slug') slug: string) {
		return this.categoriesService.findBySlug(slug)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.categoriesService.findOne(+id)
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateCategoryDto: UpdateCategoryDto
	) {
		return this.categoriesService.update(+id, updateCategoryDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.categoriesService.remove(+id)
	}
}
