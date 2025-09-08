import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RentalsController } from './rentals.controller'
import { RentalsService } from './rentals.service'

@Module({
	controllers: [RentalsController],
	providers: [RentalsService, PrismaService],
	exports: [RentalsService]
})
export class RentalsModule {}
